const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// POST /api/contact - Submit contact form inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const result = await query(
      'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), subject || 'General Inquiry', message]
    );

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received by the Pulse Grid medical coordination desk. We will reach back promptly.',
      inquiryId: result.insertId
    });
  } catch (error) {
    console.error('Error saving contact inquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to send inquiry.' });
  }
});

module.exports = router;
