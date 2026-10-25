const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, optionalToken } = require('../middleware/auth');

// GET /api/notifications - Get notifications for current user or their role
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch user-specific notifications OR role-targeted notifications OR global notifications
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
         OR target_role = ? 
         OR target_role = 'all'
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    const notifications = await query(sql, [userId, userRole]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read for current user
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    await query(
      `UPDATE notifications 
       SET is_read = 1 
       WHERE user_id = ? OR target_role = ? OR target_role = 'all'`,
      [userId, userRole]
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
});

// POST /api/notifications - Create notification (internal or authorized)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, target_role, title, message, type, link } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const result = await query(
      `INSERT INTO notifications (user_id, target_role, title, message, type, link, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [user_id || null, target_role || null, title, message, type || 'info', link || null]
    );

    res.status(201).json({ success: true, notificationId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification.' });
  }
});

module.exports = router;
