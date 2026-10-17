const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole, optionalToken } = require('../middleware/auth');

// GET /api/donors - Searchable directory with privacy protection
router.get('/', optionalToken, async (req, res) => {
  try {
    const { blood_group, city, available, search } = req.query;

    let sql = `
      SELECT 
        d.id,
        d.user_id,
        d.full_name,
        d.blood_group,
        d.gender,
        d.age,
        d.weight_kg,
        d.city,
        d.state,
        d.is_available,
        d.last_donation_date,
        d.total_donations,
        d.phone,
        u.email
      FROM donors d
      JOIN users u ON d.user_id = u.id
      WHERE u.status = 'active'
    `;
    const params = [];

    if (blood_group && blood_group !== 'All') {
      sql += ' AND d.blood_group = ?';
      params.push(blood_group);
    }
    if (city && city !== 'All') {
      sql += ' AND d.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (available === 'true') {
      sql += ' AND d.is_available = 1';
    } else if (available === 'false') {
      sql += ' AND d.is_available = 0';
    }
    if (search) {
      sql += ' AND (d.full_name LIKE ? OR d.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY d.is_available DESC, d.last_donation_date ASC';

    const donors = await query(sql, params);

    // Apply privacy masking if not authorized staff
    const isAuthorized = req.user && (req.user.role === 'admin' || req.user.role === 'hospital');

    const sanitizedDonors = donors.map(d => {
      // Calculate cooldown / eligibility
      let daysSinceLast = null;
      let isEligible = true;
      if (d.last_donation_date) {
        const last = new Date(d.last_donation_date);
        const now = new Date();
        daysSinceLast = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        // Medical cooldown is 90 days for whole blood
        if (daysSinceLast < 90) {
          isEligible = false;
        }
      }

      return {
        id: d.id,
        full_name: d.full_name,
        blood_group: d.blood_group,
        gender: d.gender,
        age: d.age,
        weight_kg: d.weight_kg,
        city: d.city,
        state: d.state,
        is_available: Boolean(d.is_available),
        last_donation_date: d.last_donation_date,
        days_since_last_donation: daysSinceLast,
        is_medically_eligible: isEligible,
        total_donations: d.total_donations,
        // Mask phone & email for public users to protect donor privacy
        phone: isAuthorized ? d.phone : d.phone.replace(/(\+\d{2}\s\d{2})\d{4}(\d{4})/, '$1****$2'),
        email: isAuthorized ? d.email : d.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      };
    });

    res.json({ success: true, count: sanitizedDonors.length, donors: sanitizedDonors });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donors.' });
  }
});

// GET /api/donors/my-profile - Current donor profile & stats
router.get('/my-profile', authenticateToken, requireRole('donor'), async (req, res) => {
  try {
    const donors = await query('SELECT * FROM donors WHERE user_id = ?', [req.user.id]);
    if (donors.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    const donor = donors[0];

    // Fetch donation history
    const history = await query(
      `SELECT d.*, f.name AS facility_name, f.city AS facility_city 
       FROM donations d 
       LEFT JOIN facilities f ON d.facility_id = f.id 
       WHERE d.donor_id = ? 
       ORDER BY d.donation_date DESC`,
      [donor.id]
    );

    // Calculate days until next eligible donation (90-day cooldown)
    let nextEligibleDays = 0;
    if (donor.last_donation_date) {
      const last = new Date(donor.last_donation_date);
      const now = new Date();
      const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diff < 90) {
        nextEligibleDays = 90 - diff;
      }
    }

    res.json({
      success: true,
      donor: {
        ...donor,
        is_available: Boolean(donor.is_available),
        next_eligible_in_days: nextEligibleDays,
        can_donate_today: nextEligibleDays === 0
      },
      donation_history: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch donor profile.' });
  }
});

// PATCH /api/donors/availability - Toggle donor availability
router.patch('/availability', authenticateToken, requireRole('donor'), async (req, res) => {
  try {
    const { is_available } = req.body;
    const availVal = is_available ? 1 : 0;

    await query('UPDATE donors SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [availVal, req.user.id]);

    res.json({
      success: true,
      message: `Availability updated to ${is_available ? 'Available to Donate' : 'Unavailable'}.`,
      is_available: Boolean(availVal)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
});

// POST /api/donors/schedule - Schedule appointment to donate at a hospital/blood bank
router.post('/schedule', authenticateToken, requireRole('donor'), async (req, res) => {
  try {
    const { facility_id, appointment_date, component_type, notes } = req.body;
    if (!facility_id || !appointment_date) {
      return res.status(400).json({ success: false, message: 'Facility and appointment date are required.' });
    }

    const donors = await query('SELECT id, blood_group FROM donors WHERE user_id = ?', [req.user.id]);
    if (donors.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }
    const donor = donors[0];

    const certCode = `SCHED-${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO donations (donor_id, facility_id, donation_date, blood_group, component_type, units, status, certificate_no, notes)
       VALUES (?, ?, ?, ?, ?, 1, 'Scheduled', ?, ?)`,
      [donor.id, facility_id, appointment_date, donor.blood_group, component_type || 'Whole Blood', certCode, notes || 'Scheduled via Pulse Grid app']
    );

    res.status(201).json({
      success: true,
      message: 'Donation appointment successfully scheduled!',
      appointmentId: result.insertId,
      bookingCode: certCode
    });
  } catch (error) {
    console.error('Error scheduling donation:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule donation.' });
  }
});

module.exports = router;
