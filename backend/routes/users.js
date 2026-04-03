const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Donation } = require('../models');
const { requireAuth, requireActiveUser, requireAdmin } = require('../middleware/auth');
const { sendAccessApprovedEmail, sendAccessDeniedEmail } = require('../services/userEmailService');

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Safe user fields to return (no password, no reset tokens)
const safeUserFields = [
  'id', 'email', 'firstName', 'lastName', 'phone',
  'emailNotifications', 'eventUpdates', 'isActive', 'isVerified', 'role',
  'createdAt', 'updatedAt',
];

function toSafeUser(user) {
  const u = user.get ? user.get({ plain: true }) : user;
  const out = {};
  safeUserFields.forEach(f => { if (u[f] !== undefined) out[f] = u[f]; });
  return out;
}

// GET /api/users/me — current user profile (authenticated, active)
router.get('/me', requireAuth, requireActiveUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: safeUserFields,
      include: [
        { model: Donation, as: 'donations', attributes: ['id', 'amount', 'paymentStatus', 'donationType', 'createdAt'], required: false },
      ],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: toSafeUser(user), donations: user.donations || [] });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

// PATCH /api/users/me — update own profile (firstName, lastName, phone, email notifications)
const updateMeValidation = [
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('emailNotifications').optional().isBoolean(),
  body('eventUpdates').optional().isBoolean(),
];
router.patch(
  '/me',
  requireAuth,
  requireActiveUser,
  updateMeValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { firstName, lastName, phone, emailNotifications, eventUpdates } = req.body;
      const updates = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (phone !== undefined) updates.phone = phone;
      if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
      if (eventUpdates !== undefined) updates.eventUpdates = eventUpdates;
      await user.update(updates);
      res.json({ success: true, user: toSafeUser(user) });
    } catch (err) {
      console.error('Update me error:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
);

// Change own password (requires current password)
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];
router.post(
  '/me/change-password',
  requireAuth,
  requireActiveUser,
  changePasswordValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user || !(await user.comparePassword(req.body.currentPassword))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      await user.update({ password: req.body.newPassword });
      res.json({ success: true, message: 'Password updated.' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }
);

// ——— Admin-only routes ———

// GET /api/users — list users (admin); query: ?pending=true for access requests only
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingOnly = req.query.pending === 'true';
    const where = pendingOnly ? { role: 'pending' } : {};
    const users = await User.findAll({
      where,
      attributes: safeUserFields,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Donation, as: 'donations', attributes: ['id', 'amount', 'paymentStatus', 'createdAt'], required: false },
      ],
    });
    res.json({
      success: true,
      users: users.map(u => ({ ...toSafeUser(u), donations: (u.donations || []).length })),
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
});

// GET /api/users/:id — get one user (admin)
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: safeUserFields,
      include: [{ model: Donation, as: 'donations', required: false }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: toSafeUser(user), donations: user.donations || [] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, message: 'Failed to load user' });
  }
});

// PATCH /api/users/:id — update user (admin): isActive, role, lock out
const adminUpdateValidation = [
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['pending', 'approved', 'rejected', 'user', 'contributor', 'admin']),
];
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  adminUpdateValidation,
  validationErrorHandler,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { firstName, lastName, email, isActive, role } = req.body;
      const updates = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (role !== undefined) updates.role = role;

      const wasInactive = !user.isActive;
      if (isActive !== undefined) updates.isActive = isActive;

      // If approving access (isActive false -> true), promote pending to approved and send email
      if (wasInactive && isActive === true) {
        if (user.role === 'pending' || user.role === 1) {
          updates.role = 'approved';
        }
      }

      await user.update(updates);

      if (wasInactive && isActive === true) {
        try {
          await sendAccessApprovedEmail(user.email, user.firstName, 'https://seedsofhopesc.org');
        } catch (emailErr) {
          console.error('Failed to send access-approved email:', emailErr);
          // Don't fail the request; access was still granted
        }
      }

      res.json({ success: true, user: toSafeUser(user) });
    } catch (err) {
      console.error('Admin update user error:', err);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }
);

// POST /api/users/:id/approve-access — shorthand to approve access and send email
router.post('/:id/approve-access', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'rejected') {
      return res.status(400).json({ success: false, message: 'This user has been rejected and cannot be approved.' });
    }

    if (user.isActive && (user.role === 'approved' || user.role === 'user' || user.role === 'contributor' || user.role === 'admin')) {
      return res.json({ success: true, message: 'User already has access.', user: toSafeUser(user) });
    }

    const updates = { isActive: 1, role: 'approved' };
    await user.update(updates);

    try {
      await sendAccessApprovedEmail(user.email, user.firstName, 'https://seedsofhopesc.org');
    } catch (emailErr) {
      console.error('Failed to send access-approved email:', emailErr);
    }

    res.json({ success: true, message: 'Access approved and user notified.', user: toSafeUser(user) });
  } catch (err) {
    console.error('Approve access error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve access' });
  }
});

// POST /api/users/:id/deny-access — mark as rejected and send email
router.post('/:id/deny-access', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Move user to a permanently locked-out state
    await user.update({ role: 'rejected', isActive: 0 });

    try {
      await sendAccessDeniedEmail(user.email, user.firstName);
    } catch (emailErr) {
      console.error('Failed to send access-denied email:', emailErr);
    }

    res.json({ success: true, message: 'Access denied and user notified.', user: toSafeUser(user) });
  } catch (err) {
    console.error('Deny access error:', err);
    res.status(500).json({ success: false, message: 'Failed to deny access' });
  }
});

module.exports = router;
