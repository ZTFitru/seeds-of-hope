const { sendEmail } = require('../config/nodemailer');

const APP_NAME = process.env.APP_NAME || 'Seeds of Hope';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';

/**
 * Send password reset email with link containing token.
 * @param {string} to - User email
 * @param {string} resetToken - Token to include in link (frontend will send this to reset endpoint)
 * @param {string} firstName - User first name for greeting
 */
async function sendPasswordResetEmail(to, resetToken, firstName = '') {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset your password</title></head>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Reset your password</h2>
      <p>${greeting}</p>
      <p>You requested a password reset for your ${APP_NAME} account. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Reset password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      <p>— The ${APP_NAME} Team</p>
    </body>
    </html>
  `;
  await sendEmail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html,
  });
}

/**
 * Send email when an admin has approved the user's access to the site.
 * @param {string} to - User email
 * @param {string} firstName - User first name
 * @param {string} loginUrl - Optional login page URL
 */
async function sendAccessApprovedEmail(to, firstName = '', loginUrl = null) {
  const url = loginUrl || 'https://seedsofhopesc.org';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Access approved</title></head>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Your access has been approved</h2>
      <p>${greeting}</p>
      <p>An administrator has approved your request to access ${APP_NAME}. You can now log in to your account.</p>
      <p><a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Log in</a></p>
      <p>— The ${APP_NAME} Team</p>
    </body>
    </html>
  `;
  await sendEmail({
    to,
    subject: `Your ${APP_NAME} access has been approved`,
    html,
  });
}

/**
 * Send email when an admin has denied the user's access request.
 * @param {string} to - User email
 * @param {string} firstName - User first name
 */
async function sendAccessDeniedEmail(to, firstName = '') {
  const siteUrl = 'https://seedsofhopesc.org';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Access request denied</title></head>
    <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Your access request has been reviewed</h2>
      <p>${greeting}</p>
      <p>After reviewing your request, an administrator has decided not to approve access to ${APP_NAME} at this time.</p>
      <p>If you believe this decision was made in error or you have additional questions, please reach out through our website.</p>
      <p><a href="${siteUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Visit ${APP_NAME}</a></p>
      <p>— The ${APP_NAME} Team</p>
    </body>
    </html>
  `;
  await sendEmail({
    to,
    subject: `Your ${APP_NAME} access request`,
    html,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendAccessApprovedEmail,
  sendAccessDeniedEmail,
};
