const express = require('express');
const router = express.Router();
const { query, withTransaction } = require('../config/db');
const { authenticateToken, requireRole, optionalToken } = require('../middleware/auth');

// GET /api/requests - List requests with filters
router.get('/', optionalToken, async (req, res) => {
  try {
    const { status, blood_group, priority, facility_id, user_only, search } = req.query;

    let sql = `
      SELECT 
        br.*,
        f.name AS assigned_facility_name,
        f.phone AS assigned_facility_phone
      FROM blood_requests br
      LEFT JOIN facilities f ON br.assigned_facility_id = f.id
      WHERE 1=1
    `;
    const params = [];

    // If regular donor/requester queries "my requests"
    if (user_only === 'true' && req.user) {
      sql += ' AND br.requester_user_id = ?';
      params.push(req.user.id);
    }

    if (status && status !== 'All') {
      sql += ' AND br.status = ?';
      params.push(status);
    }
    if (blood_group && blood_group !== 'All') {
      sql += ' AND br.blood_group = ?';
      params.push(blood_group);
    }
    if (priority && priority !== 'All') {
      sql += ' AND br.priority = ?';
      params.push(priority);
    }
    if (facility_id) {
      sql += ' AND br.assigned_facility_id = ?';
      params.push(facility_id);
    }
    if (search) {
      sql += ' AND (br.patient_name LIKE ? OR br.hospital_name LIKE ? OR br.request_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Order by Priority (Critical first, then Urgent, then Routine) and Date
    sql += `
      ORDER BY 
        CASE br.priority 
          WHEN 'Critical' THEN 1 
          WHEN 'Urgent' THEN 2 
          WHEN 'Routine' THEN 3 
          ELSE 4 
        END ASC,
        br.created_at DESC
    `;

    const requests = await query(sql, params);
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blood requests.' });
  }
});

// GET /api/requests/:codeOrId - Single request by code or ID
router.get('/:codeOrId', async (req, res) => {
  try {
    const { codeOrId } = req.params;
    const isNum = /^\d+$/.test(codeOrId);
    
    const sql = `
      SELECT br.*, f.name AS assigned_facility_name, f.phone AS assigned_facility_phone, f.address as assigned_facility_address
      FROM blood_requests br
      LEFT JOIN facilities f ON br.assigned_facility_id = f.id
      WHERE ${isNum ? 'br.id = ?' : 'br.request_code = ?'}
    `;
    const rows = await query(sql, [codeOrId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    res.json({ success: true, request: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve request details.' });
  }
});

// POST /api/requests - Submit new blood request
router.post('/', optionalToken, async (req, res) => {
  try {
    const {
      patient_name,
      patient_age,
      patient_gender,
      hospital_name,
      hospital_address,
      city,
      blood_group,
      component_type,
      units_required,
      priority,
      reason,
      required_date,
      contact_name,
      contact_phone,
      contact_email,
      doctor_name,
      preferred_facility_id
    } = req.body;

    if (!patient_name || !hospital_name || !city || !blood_group || !units_required || !contact_phone || !reason || !required_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient name, hospital name, city, blood group, units, contact phone, required date, and reason are required fields.' 
      });
    }

    // Generate unique Tracking Code: PG-REQ-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestCode = `PG-REQ-${randomSuffix}`;

    const requesterId = req.user ? req.user.id : null;

    const result = await query(
      `INSERT INTO blood_requests 
        (request_code, requester_user_id, patient_name, patient_age, patient_gender, hospital_name, hospital_address, city, blood_group, component_type, units_required, priority, reason, required_date, contact_name, contact_phone, contact_email, doctor_name, status, assigned_facility_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        requestCode,
        requesterId,
        patient_name,
        parseInt(patient_age) || null,
        patient_gender || 'Other',
        hospital_name,
        hospital_address || '',
        city,
        blood_group,
        component_type || 'Whole Blood',
        parseInt(units_required) || 1,
        priority || 'Urgent',
        reason,
        required_date,
        contact_name || patient_name,
        contact_phone,
        contact_email || null,
        doctor_name || null,
        preferred_facility_id || null
      ]
    );

    // In-App Notification for requester
    if (requesterId) {
      await query(
        `INSERT INTO notifications (user_id, target_role, title, message, type, link)
         VALUES (?, 'requester', ?, ?, 'info', '/requester-dashboard')`,
        [requesterId, `Request Submitted: ${requestCode}`, `Your blood requirement for ${patient_name} (${units_required} units of ${blood_group}) was submitted successfully.`]
      );
    }

    // Broadcast Notification for hospital desks
    await query(
      `INSERT INTO notifications (target_role, title, message, type, link)
       VALUES ('hospital', ?, ?, ?, '/hospital-dashboard')`,
      [
        `New ${priority} Blood Requirement: ${requestCode}`,
        `Requirement for ${units_required} units of ${blood_group} (${component_type || 'Whole Blood'}) at ${hospital_name}, ${city}.`,
        priority === 'Critical' ? 'alert' : 'info'
      ]
    );

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [requesterId, 'REQUEST_CREATED', 'blood_requests', result.insertId, `New ${priority} request ${requestCode} for ${units_required} units of ${blood_group}`]
    );

    res.status(201).json({
      success: true,
      message: 'Blood request registered successfully. Our dispatch system has notified nearby medical blood banks.',
      requestCode,
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit blood request.' });
  }
});

// PATCH /api/requests/:id/status - Update request status with atomic inventory deduction when fulfilled
router.patch('/:id/status', authenticateToken, requireRole(['hospital', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, facility_id, inventory_batch_id } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Partially Fulfilled', 'Fulfilled', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const reqRows = await query('SELECT * FROM blood_requests WHERE id = ?', [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    const currentReq = reqRows[0];

    // Determine acting facility ID
    let actingFacId = facility_id;
    let actingFacName = 'Medical Blood Center';
    if (req.user.role === 'hospital') {
      const facs = await query('SELECT id, name FROM facilities WHERE user_id = ?', [req.user.id]);
      if (facs.length > 0) {
        actingFacId = facs[0].id;
        actingFacName = facs[0].name;
      }
    }

    // Atomic transaction for state transition and inventory update
    await withTransaction(async (trxQuery) => {
      // If updating to Fulfilled, atomically deduct inventory!
      if ((status === 'Fulfilled' || status === 'Partially Fulfilled') && currentReq.status !== 'Fulfilled') {
        const unitsNeeded = currentReq.units_required;
        const bloodGroup = currentReq.blood_group;

        let targetBatchId = inventory_batch_id;
        
        // If no specific batch provided, pick the earliest expiring available batch from this facility
        if (!targetBatchId && actingFacId) {
          const availBatches = await trxQuery(
            `SELECT id, units, batch_number FROM blood_inventory 
             WHERE facility_id = ? AND blood_group = ? AND units >= ? AND status != 'Expired'
             ORDER BY expiry_date ASC LIMIT 1`,
            [actingFacId, bloodGroup, unitsNeeded]
          );

          if (availBatches.length > 0) {
            targetBatchId = availBatches[0].id;
          } else {
            throw new Error(`Insufficient inventory: No batch in this facility currently has ${unitsNeeded} available units of ${bloodGroup}.`);
          }
        }

        if (targetBatchId) {
          const batchRows = await trxQuery('SELECT * FROM blood_inventory WHERE id = ?', [targetBatchId]);
          if (batchRows.length === 0) {
            throw new Error('Target inventory batch not found.');
          }
          const batch = batchRows[0];
          if (batch.units < unitsNeeded) {
            throw new Error(`Insufficient stock: Batch ${batch.batch_number} only has ${batch.units} units available, but ${unitsNeeded} units are required.`);
          }

          const updatedUnits = batch.units - unitsNeeded;
          const newBatchStatus = updatedUnits <= 0 ? 'Out of Stock' : (updatedUnits <= 5 ? 'Low Stock' : 'Available');

          await trxQuery(
            'UPDATE blood_inventory SET units = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [updatedUnits, newBatchStatus, targetBatchId]
          );

          // Record Inventory Transaction (OUT)
          await trxQuery(
            `INSERT INTO inventory_transactions 
              (inventory_id, facility_id, request_id, transaction_type, units, previous_units, new_units, reason, performed_by_user_id)
             VALUES (?, ?, ?, 'OUT', ?, ?, ?, ?, ?)`,
            [targetBatchId, actingFacId, id, unitsNeeded, batch.units, updatedUnits, `Fulfillment for Request ${currentReq.request_code} (${currentReq.patient_name})`, req.user.id]
          );

          console.log(`[Transaction OUT] Deducted ${unitsNeeded} units of ${bloodGroup} from batch ${batch.batch_number}. Remaining: ${updatedUnits}`);
        }
      }

      // Update the request record
      await trxQuery(
        `UPDATE blood_requests 
         SET status = ?, 
             assigned_facility_id = COALESCE(?, assigned_facility_id), 
             fulfillment_notes = COALESCE(?, fulfillment_notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, actingFacId, notes, id]
      );

      // Create Notification for the Requester if user ID exists
      if (currentReq.requester_user_id) {
        let notifTitle = `Request ${currentReq.request_code}: Status Updated to ${status}`;
        let notifType = status === 'Fulfilled' || status === 'Approved' ? 'success' : (status === 'Rejected' ? 'alert' : 'info');
        let notifMsg = `Your blood requirement request for ${currentReq.patient_name} (${currentReq.units_required}u of ${currentReq.blood_group}) was marked as ${status} by ${actingFacName}.`;
        
        await trxQuery(
          `INSERT INTO notifications (user_id, target_role, title, message, type, link)
           VALUES (?, 'requester', ?, ?, ?, '/requester-dashboard')`,
          [currentReq.requester_user_id, notifTitle, notifMsg, notifType]
        );
      }

      // Audit Log
      await trxQuery(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'REQUEST_STATUS_UPDATED', 'blood_requests', id, `Status updated to ${status} by user ${req.user.email}. Notes: ${notes || 'None'}`]
      );
    });

    res.json({
      success: true,
      message: `Request status successfully updated to ${status}.`
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update request status.' });
  }
});

// PATCH /api/requests/:id/cancel - Requester can cancel pending requests
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reqRows = await query('SELECT * FROM blood_requests WHERE id = ?', [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    const currentReq = reqRows[0];

    // Verify ownership (unless admin)
    if (req.user.role !== 'admin' && currentReq.requester_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this request.' });
    }

    if (currentReq.status === 'Fulfilled' || currentReq.status === 'Approved') {
      return res.status(400).json({ success: false, message: `Cannot cancel request that is already ${currentReq.status}. Please contact the facility directly.` });
    }

    await query(
      `UPDATE blood_requests 
       SET status = 'Cancelled', fulfillment_notes = 'Cancelled by requester', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id]
    );

    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'REQUEST_CANCELLED', 'blood_requests', id, `Request ${currentReq.request_code} cancelled by requester`]
    );

    res.json({ success: true, message: 'Blood request has been cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel request.' });
  }
});

module.exports = router;
