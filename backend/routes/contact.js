const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/nodemailer');
const { contactValidation, handleValidationErrors } = require('../middleware/validation');

// POST /api/contact - Handle contact form submission
router.post('/', contactValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Email to organization (admin notification)
    const adminEmailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Received at: ${new Date().toLocaleString()}</small></p>
    `;

    // Email to user (confirmation)
    const userEmailHtml = `
      <h2>Thank You for Contacting Seeds of Hope</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p>Best regards,<br>The Seeds of Hope Team</p>
    `;

    // Send email to organization
    await sendEmail({
      to: process.env.TO_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: adminEmailHtml,
    });

    // Send confirmation email to user
    if (process.env.SEND_USER_CONFIRMATION === 'true') {
      await sendEmail({
        to: email,
        subject: 'Thank You for Contacting Seeds of Hope',
        html: userEmailHtml,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
