const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT for a user (id, email, role).
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Middleware: require valid JWT. Sets req.user (plain object with id, email, role).
 * Does not check isActive; use requireActiveUser for that.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Whether the role is allowed past the lock to view inside pages.
 * Allowed: 'approved', 'user', 'contributor', 'admin'; or integer 2 for contributor.
 * Pending/rejected (or integer 1) is not allowed.
 */
const ROLES_ALLOWED_INSIDE_PAGES = ['approved', 'user', 'contributor', 'admin'];
function isContributorOrAdmin(role) {
  if (ROLES_ALLOWED_INSIDE_PAGES.includes(role)) return true;
  if (typeof role === 'number' && role === 2) return true; // contributor by integer
  return false;
}

/**
 * Middleware: require auth, active account, and role that is allowed past the lock.
 * Pending users (role 'pending' or 1) are locked out; user/contributor/admin (or 2) can access when isActive.
 */
async function requireActiveUser(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'isActive', 'role'] });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved for access. Please contact an administrator.',
      });
    }
    if (!isContributorOrAdmin(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved for access. Please contact an administrator.',
      });
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error checking user status' });
  }
}

/**
 * Middleware: require auth and role === 'admin'.
 */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = {
  signToken,
  requireAuth,
  requireActiveUser,
  requireAdmin,
  isContributorOrAdmin,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
