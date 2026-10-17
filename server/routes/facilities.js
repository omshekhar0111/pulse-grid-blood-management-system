const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// GET /api/facilities - List all facilities with coordinates and inventory counts
router.get('/', async (req, res) => {
  try {
    const { facility_type, city, blood_group } = req.query;

    let sql = `
      SELECT 
        f.*,
        COUNT(bi.id) AS total_batches,
        COALESCE(SUM(bi.units), 0) AS total_units_available
      FROM facilities f
      LEFT JOIN blood_inventory bi ON f.id = bi.facility_id AND bi.status != 'Expired'
      WHERE f.is_verified = 1
    `;
    const params = [];

    if (facility_type && facility_type !== 'All') {
      sql += ' AND f.facility_type = ?';
      params.push(facility_type);
    }
    if (city && city !== 'All') {
      sql += ' AND f.city LIKE ?';
      params.push(`%${city}%`);
    }

    sql += ' GROUP BY f.id ORDER BY total_units_available DESC';

    let facilities = await query(sql, params);

    // If blood_group filter requested, attach stock info
    for (let fac of facilities) {
      const stock = await query(
        `SELECT blood_group, SUM(units) as units 
         FROM blood_inventory 
         WHERE facility_id = ? AND status != 'Expired' 
         GROUP BY blood_group`,
        [fac.id]
      );
      fac.blood_stock = stock;
    }

    if (blood_group && blood_group !== 'All') {
      facilities = facilities.filter(f => 
        f.blood_stock.some(s => s.blood_group === blood_group && s.units > 0)
      );
    }

    res.json({ success: true, count: facilities.length, facilities });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve facilities.' });
  }
});

// GET /api/facilities/:id - Facility details & current inventory breakdown
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const facilities = await query('SELECT * FROM facilities WHERE id = ?', [id]);
    if (facilities.length === 0) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }

    const facility = facilities[0];
    const inventory = await query(
      `SELECT * FROM blood_inventory 
       WHERE facility_id = ? AND status != 'Expired' 
       ORDER BY expiry_date ASC`,
      [id]
    );

    res.json({ success: true, facility, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch facility details.' });
  }
});

module.exports = router;
