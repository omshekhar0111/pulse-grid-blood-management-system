const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/admin/overview - Detailed analytics & chart data
router.get('/overview', async (req, res) => {
  try {
    // 1. Total counts
    const usersCountRes = await query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const facilitiesCountRes = await query('SELECT is_verified, COUNT(*) as count FROM facilities GROUP BY is_verified');
    const requestsStatusRes = await query('SELECT status, COUNT(*) as count FROM blood_requests GROUP BY status');
    
    // 2. Inventory by component
    const inventoryByComp = await query(`
      SELECT component_type, SUM(units) as total_units
      FROM blood_inventory
      WHERE status != 'Expired'
      GROUP BY component_type
    `);

    // 3. Inventory by Blood Group
    const inventoryByGroup = await query(`
      SELECT blood_group, SUM(units) as total_units
      FROM blood_inventory
      WHERE status != 'Expired'
      GROUP BY blood_group
      ORDER BY blood_group ASC
    `);

    // 4. Recent audit logs
    const recentLogs = await query(`
      SELECT al.*, u.email as user_email, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `);

    // 5. Low stock alerts
    const lowStockAlerts = await query(`
      SELECT bi.*, f.name as facility_name, f.city
      FROM blood_inventory bi
      JOIN facilities f ON bi.facility_id = f.id
      WHERE bi.status IN ('Low Stock', 'Expiring Soon')
      ORDER BY bi.units ASC, bi.expiry_date ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        usersByRole: usersCountRes,
        facilitiesByVerification: facilitiesCountRes,
        requestsByStatus: requestsStatusRes,
        inventoryByComponent: inventoryByComp,
        inventoryByGroup: inventoryByGroup,
        recentLogs,
        lowStockAlerts
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin overview.' });
  }
});

// GET /api/admin/users - User management list
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let sql = `
      SELECT 
        u.id, u.email, u.role, u.status, u.created_at,
        d.full_name as donor_name, d.blood_group, d.city as donor_city,
        f.name as facility_name, f.facility_type, f.is_verified, f.city as facility_city
      FROM users u
      LEFT JOIN donors d ON u.id = d.user_id
      LEFT JOIN facilities f ON u.id = f.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (status && status !== 'All') {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (u.email LIKE ? OR d.full_name LIKE ? OR f.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = await query(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user status (active / suspended)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
    }

    await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    
    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'USER_STATUS_CHANGE', 'users', id, `Changed user ID ${id} status to ${status}`]
    );

    res.json({ success: true, message: `User status changed to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// PATCH /api/admin/facilities/:id/verify - Verify or unverify facility
router.patch('/facilities/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const verifyVal = is_verified ? 1 : 0;
    await query('UPDATE facilities SET is_verified = ? WHERE id = ?', [verifyVal, id]);

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'FACILITY_VERIFIED', 'facilities', id, `Facility ID ${id} verification set to ${verifyVal}`]
    );

    res.json({ success: true, message: `Facility verification updated to ${Boolean(verifyVal)}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update facility verification.' });
  }
});

module.exports = router;
