const express = require('express');
const router = express.Router();
const { query, withTransaction } = require('../config/db');
const { authenticateToken, requireRole, optionalToken } = require('../middleware/auth');

// Helper to determine status dynamically based on units & expiry date
function calculateInventoryStatus(units, expiryDate) {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (units <= 0) return 'Out of Stock';
  if (diffDays <= 5) return 'Expiring Soon';
  if (units <= 5) return 'Low Stock';
  return 'Available';
}

// GET /api/inventory - Search and filter blood inventory
router.get('/', async (req, res) => {
  try {
    const { blood_group, component, status, city, facility_id, search } = req.query;
    
    let sql = `
      SELECT 
        bi.id,
        bi.facility_id,
        bi.blood_group,
        bi.component_type,
        bi.units,
        bi.collection_date,
        bi.expiry_date,
        bi.batch_number,
        bi.storage_temp,
        bi.status,
        bi.updated_at,
        f.name AS facility_name,
        f.facility_type,
        f.city,
        f.state,
        f.address,
        f.phone AS facility_phone,
        f.emergency_hotline,
        f.latitude,
        f.longitude,
        f.is_verified
      FROM blood_inventory bi
      JOIN facilities f ON bi.facility_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (blood_group && blood_group !== 'All') {
      sql += ' AND bi.blood_group = ?';
      params.push(blood_group);
    }
    if (component && component !== 'All') {
      sql += ' AND bi.component_type = ?';
      params.push(component);
    }
    if (status && status !== 'All') {
      sql += ' AND bi.status = ?';
      params.push(status);
    }
    if (city && city !== 'All') {
      sql += ' AND f.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (facility_id) {
      sql += ' AND bi.facility_id = ?';
      params.push(facility_id);
    }
    if (search) {
      sql += ' AND (f.name LIKE ? OR bi.batch_number LIKE ? OR f.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY bi.expiry_date ASC, bi.units DESC';

    const items = await query(sql, params);
    res.json({ success: true, count: items.length, inventory: items });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory records.' });
  }
});

// GET /api/inventory/summary - Aggregate group and component counts
router.get('/summary', async (req, res) => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const summarySql = `
      SELECT blood_group, SUM(units) as total_units, COUNT(*) as batch_count
      FROM blood_inventory
      WHERE status != 'Expired'
      GROUP BY blood_group
    `;
    const rows = await query(summarySql);
    
    // Map with zero fill
    const groupMap = {};
    bloodGroups.forEach(bg => {
      groupMap[bg] = { blood_group: bg, total_units: 0, batch_count: 0, status: 'Out of Stock' };
    });

    rows.forEach(r => {
      const units = parseInt(r.total_units || 0);
      groupMap[r.blood_group] = {
        blood_group: r.blood_group,
        total_units: units,
        batch_count: parseInt(r.batch_count || 0),
        status: units > 15 ? 'Available' : units > 0 ? 'Low Stock' : 'Out of Stock'
      };
    });

    res.json({ success: true, summary: Object.values(groupMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute inventory summary.' });
  }
});

// POST /api/inventory - Add new inventory batch (Hospital or Admin)
router.post('/', authenticateToken, requireRole(['hospital', 'admin']), async (req, res) => {
  try {
    let facilityId = req.body.facility_id;

    if (req.user.role === 'hospital') {
      const facs = await query('SELECT id FROM facilities WHERE user_id = ?', [req.user.id]);
      if (facs.length === 0) {
        return res.status(403).json({ success: false, message: 'No registered facility linked to this account.' });
      }
      facilityId = facs[0].id;
    }

    if (!facilityId) {
      return res.status(400).json({ success: false, message: 'Facility ID is required.' });
    }

    const {
      blood_group,
      component_type,
      units,
      collection_date,
      expiry_date,
      batch_number,
      storage_temp
    } = req.body;

    if (!blood_group || units === undefined || !collection_date || !expiry_date) {
      return res.status(400).json({ success: false, message: 'Blood group, units, collection date, and expiry date are required.' });
    }

    const numUnits = parseInt(units);
    if (isNaN(numUnits) || numUnits < 0) {
      return res.status(400).json({ success: false, message: 'Blood inventory units must be a non-negative number.' });
    }

    const genBatch = batch_number || `BATCH-${Date.now().toString().slice(-6)}`;
    const calcStatus = calculateInventoryStatus(numUnits, expiry_date);

    const result = await query(
      `INSERT INTO blood_inventory 
        (facility_id, blood_group, component_type, units, collection_date, expiry_date, batch_number, storage_temp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facilityId,
        blood_group,
        component_type || 'Whole Blood',
        numUnits,
        collection_date,
        expiry_date,
        genBatch,
        storage_temp || '2-6°C',
        calcStatus
      ]
    );

    // Record Inventory Transaction (IN)
    await query(
      `INSERT INTO inventory_transactions 
        (inventory_id, facility_id, transaction_type, units, previous_units, new_units, reason, performed_by_user_id)
       VALUES (?, ?, 'IN', ?, 0, ?, 'New inventory batch intake', ?)`,
      [result.insertId, facilityId, numUnits, numUnits, req.user.id]
    );

    // If initial units are low or expiring soon, create proactive notification
    if (numUnits <= 5) {
      await query(
        `INSERT INTO notifications (user_id, target_role, title, message, type, link)
         VALUES (?, 'hospital', 'Low Stock Alert', ?, 'warning', '/hospital-dashboard')`,
        [req.user.id, `Batch ${genBatch} (${blood_group} ${component_type || 'Whole Blood'}) added with only ${numUnits} units.`]
      );
    }

    // Audit Log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'INVENTORY_ADDED', 'blood_inventory', result.insertId, `Added ${units} units of ${blood_group} (${component_type})`]
    );

    res.status(201).json({
      success: true,
      message: 'Blood inventory batch added successfully.',
      batchId: result.insertId
    });
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add inventory.' });
  }
});

// PUT /api/inventory/:id - Update inventory batch (Hospital or Admin)
router.put('/:id', authenticateToken, requireRole(['hospital', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { units, expiry_date, storage_temp, status_override } = req.body;

    const existing = await query('SELECT * FROM blood_inventory WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory batch not found.' });
    }

    const batch = existing[0];

    // If hospital, verify ownership
    if (req.user.role === 'hospital') {
      const facs = await query('SELECT id FROM facilities WHERE user_id = ?', [req.user.id]);
      if (facs.length === 0 || facs[0].id !== batch.facility_id) {
        return res.status(403).json({ success: false, message: 'Permission denied: Not your facility batch.' });
      }
    }

    const newUnits = units !== undefined ? parseInt(units) : batch.units;
    if (isNaN(newUnits) || newUnits < 0) {
      return res.status(400).json({ success: false, message: 'Units must be non-negative.' });
    }
    const newExp = expiry_date || batch.expiry_date;
    const newTemp = storage_temp || batch.storage_temp;
    const newStatus = status_override || calculateInventoryStatus(newUnits, newExp);

    await query(
      `UPDATE blood_inventory 
       SET units = ?, expiry_date = ?, storage_temp = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newUnits, newExp, newTemp, newStatus, id]
    );

    // Record Transaction if units changed
    if (newUnits !== batch.units) {
      const diff = newUnits - batch.units;
      await query(
        `INSERT INTO inventory_transactions 
          (inventory_id, facility_id, transaction_type, units, previous_units, new_units, reason, performed_by_user_id)
         VALUES (?, ?, 'ADJUSTMENT', ?, ?, ?, 'Stock quantity updated by staff', ?)`,
        [id, batch.facility_id, Math.abs(diff), batch.units, newUnits, req.user.id]
      );
    }

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'INVENTORY_UPDATED', 'blood_inventory', id, `Updated batch ${batch.batch_number}: units=${newUnits}, status=${newStatus}`]
    );

    res.json({ success: true, message: 'Inventory batch updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inventory batch.' });
  }
});

// DELETE /api/inventory/:id - Remove or discard batch
router.delete('/:id', authenticateToken, requireRole(['hospital', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM blood_inventory WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    const batch = existing[0];
    if (req.user.role === 'hospital') {
      const facs = await query('SELECT id FROM facilities WHERE user_id = ?', [req.user.id]);
      if (facs.length === 0 || facs[0].id !== batch.facility_id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    // Record Disposal Transaction
    await query(
      `INSERT INTO inventory_transactions 
        (inventory_id, facility_id, transaction_type, units, previous_units, new_units, reason, performed_by_user_id)
       VALUES (?, ?, 'DISPOSAL', ?, ?, 0, 'Batch removed / discarded from inventory', ?)`,
      [id, batch.facility_id, batch.units, batch.units, req.user.id]
    );

    await query('DELETE FROM blood_inventory WHERE id = ?', [id]);

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'INVENTORY_DISPOSED', 'blood_inventory', id, `Discarded batch ${batch.batch_number} (${batch.units} units)`]
    );

    res.json({ success: true, message: 'Inventory batch removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete inventory.' });
  }
});

// GET /api/inventory/transactions - Transaction ledger
router.get('/transactions', authenticateToken, requireRole(['hospital', 'admin']), async (req, res) => {
  try {
    let sql = `
      SELECT 
        it.*,
        f.name as facility_name,
        bi.batch_number,
        bi.blood_group,
        bi.component_type,
        u.email as performed_by_email
      FROM inventory_transactions it
      JOIN facilities f ON it.facility_id = f.id
      LEFT JOIN blood_inventory bi ON it.inventory_id = bi.id
      LEFT JOIN users u ON it.performed_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'hospital') {
      const facs = await query('SELECT id FROM facilities WHERE user_id = ?', [req.user.id]);
      if (facs.length > 0) {
        sql += ' AND it.facility_id = ?';
        params.push(facs[0].id);
      }
    }

    sql += ' ORDER BY it.created_at DESC LIMIT 100';

    const transactions = await query(sql, params);
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory transactions.' });
  }
});

module.exports = router;
