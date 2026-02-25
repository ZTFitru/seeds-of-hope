const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { signToken, requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/userEmailService');

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Register
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().isLength({ max: 100 }).withMessage('First name is required'),
  body('lastName').trim().notEmpty().isLength({ max: 100 }).withMessage('Last name is required'),
  body('phone').optional().trim().isLength({ max: 20 }),
];
router.post(
  '/register',
  registerValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone: phone || null,
        isActive: false,
        accessRequestedAt: new Date(),
      });
      const token = signToken(user);
      res.status(201).json({
        success: true,
        message: 'Account created. Your access must be approved by an administrator before you can log in.',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
);

// Login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
router.post(
  '/login',
  loginValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account is not approved for access. Please contact an administrator.',
        });
      }
      const token = signToken(user);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

// Forgot password: send reset email
const forgotValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];
router.post(
  '/forgot-password',
  forgotValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      // Always return success to avoid email enumeration
      if (!user) {
        return res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
      }
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.update({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      });
      await sendPasswordResetEmail(user.email, rawToken, user.firstName);
      res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ success: false, message: 'Failed to process request' });
    }
  }
);

// Reset password: token + new password
const resetValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
router.post(
  '/reset-password',
  resetValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
      });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      }
      await user.update({
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      res.json({ success: true, message: 'Password has been reset. You can now log in.' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  }
);

// Request access (for existing locked-out users; sets accessRequestedAt if not set)
router.post(
  '/request-access',
  requireAuth,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.isActive) {
        return res.json({ success: true, message: 'Your account already has access.' });
      }
      if (!user.accessRequestedAt) {
        await user.update({ accessRequestedAt: new Date() });
      }
      res.json({ success: true, message: 'Your access request is on file. An administrator will review it.' });
    } catch (err) {
      console.error('Request access error:', err);
      res.status(500).json({ success: false, message: 'Request failed' });
    }
  }
);

module.exports = router;
