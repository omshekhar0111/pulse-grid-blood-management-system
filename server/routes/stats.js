const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /api/stats - Live database statistics
router.get('/', async (req, res) => {
  try {
    // 1. Total registered donors
    const donorRes = await query('SELECT COUNT(*) as count FROM donors');
    const totalDonors = donorRes[0].count || donorRes[0]['COUNT(*)'] || 0;

    // 2. Total blood units in inventory (non-expired)
    const unitRes = await query("SELECT COALESCE(SUM(units), 0) as total FROM blood_inventory WHERE status != 'Expired'");
    const totalBloodUnits = unitRes[0].total || unitRes[0]['COALESCE(SUM(units), 0)'] || 0;

    // 3. Partner facilities (blood banks & hospitals)
    const facRes = await query('SELECT COUNT(*) as count FROM facilities WHERE is_verified = 1');
    const partnerFacilities = facRes[0].count || facRes[0]['COUNT(*)'] || 0;

    // 4. Requests fulfilled
    const reqRes = await query("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'Fulfilled'");
    const requestsFulfilled = reqRes[0].count || reqRes[0]['COUNT(*)'] || 0;

    // 5. Active pending/urgent requests
    const pendingReqRes = await query("SELECT COUNT(*) as count FROM blood_requests WHERE status IN ('Pending', 'Under Review')");
    const activeRequests = pendingReqRes[0].count || pendingReqRes[0]['COUNT(*)'] || 0;

    // 6. Blood group availability breakdown
    const bgList = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bgStockRes = await query(`
      SELECT blood_group, COALESCE(SUM(units), 0) as units, COUNT(id) as batches
      FROM blood_inventory
      WHERE status != 'Expired'
      GROUP BY blood_group
    `);

    const availabilityByGroup = {};
    bgList.forEach(bg => {
      availabilityByGroup[bg] = { blood_group: bg, units: 0, batches: 0, status: 'Out of Stock' };
    });

    bgStockRes.forEach(r => {
      const u = parseInt(r.units || 0);
      availabilityByGroup[r.blood_group] = {
        blood_group: r.blood_group,
        units: u,
        batches: parseInt(r.batches || 0),
        status: u > 15 ? 'Available' : (u > 0 ? 'Low Stock' : 'Out of Stock')
      };
    });

    res.json({
      success: true,
      stats: {
        totalDonors: parseInt(totalDonors),
        totalBloodUnits: parseInt(totalBloodUnits),
        partnerFacilities: parseInt(partnerFacilities),
        requestsFulfilled: parseInt(requestsFulfilled),
        activeRequests: parseInt(activeRequests),
        bloodGroupAvailability: availabilityByGroup
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve platform statistics.' });
  }
});

module.exports = router;
