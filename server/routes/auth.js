const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, withTransaction } = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register Donor or Facility
router.post('/register', async (req, res) => {
  try {
    const { role, email, password, ...profileData } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    if (!['donor', 'hospital'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified for public registration.' });
    }

    // Check existing user
    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await withTransaction(async (trxQuery) => {
      // 1. Create User
      const userRes = await trxQuery(
        'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
        [email.toLowerCase().trim(), passwordHash, role, 'active']
      );
      const userId = userRes.insertId;

      // 2. Create specific profile
      if (role === 'donor') {
        const {
          fullName, bloodGroup, phone, gender, age, weight, city, state, address, isAvailable, lastDonationDate
        } = profileData;

        if (!fullName || !bloodGroup || !phone || !city) {
          throw new Error('Full name, blood group, phone number, and city are required for donor registration.');
        }

        await trxQuery(
          `INSERT INTO donors (user_id, full_name, blood_group, phone, gender, age, weight_kg, city, state, address, is_available, last_donation_date, total_donations)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            fullName,
            bloodGroup,
            phone,
            gender || 'Male',
            parseInt(age) || 25,
            parseFloat(weight) || 60,
            city,
            state || 'Delhi',
            address || '',
            isAvailable !== false ? 1 : 0,
            lastDonationDate || null,
            0
          ]
        );
      } else if (role === 'hospital') {
        const {
          facilityName, facilityType, licenseNo, contactPerson, phone, emergencyHotline, address, city, state, pincode, latitude, longitude
        } = profileData;

        if (!facilityName || !licenseNo || !phone || !city) {
          throw new Error('Facility name, license number, phone, and city are required for hospital registration.');
        }

        await trxQuery(
          `INSERT INTO facilities (user_id, name, facility_type, license_no, contact_person, phone, emergency_hotline, email, address, city, state, pincode, latitude, longitude, is_verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            facilityName,
            facilityType || 'Hospital',
            licenseNo,
            contactPerson || '',
            phone,
            emergencyHotline || phone,
            email.toLowerCase().trim(),
            address || '',
            city,
            state || 'Delhi',
            pincode || '',
            parseFloat(latitude) || 28.6139,
            parseFloat(longitude) || 77.2090,
            1 // Default verified for demo smooth flow
          ]
        );
      }

      // Audit Log
      await trxQuery(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [userId, 'USER_REGISTERED', role, userId, `New ${role} registration for ${email}`]
      );

      return { userId, role, email };
    });

    // Generate JWT
    const token = jwt.sign(
      { id: result.userId, email: result.email, role: result.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: result.userId,
        email: result.email,
        role: result.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, message: error.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const user = users[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    // Fetch related profile details
    let profile = null;
    if (user.role === 'donor') {
      const donors = await query('SELECT * FROM donors WHERE user_id = ?', [user.id]);
      profile = donors[0] || null;
    } else if (user.role === 'hospital') {
      const facilities = await query('SELECT * FROM facilities WHERE user_id = ?', [user.id]);
      profile = facilities[0] || null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, profileId: profile ? profile.id : null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Demo Instant Login (for examiners / evaluators / fast testing)
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'admin', 'hospital', 'donor'
    let targetEmail = 'admin@pulsegrid.org';
    if (role === 'hospital') targetEmail = 'apollo@hospital.org';
    if (role === 'donor') targetEmail = 'priya.verma@donor.org';

    const users = await query('SELECT * FROM users WHERE email = ?', [targetEmail]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Demo account not found in database.' });
    }

    const user = users[0];
    let profile = null;
    if (user.role === 'donor') {
      const donors = await query('SELECT * FROM donors WHERE user_id = ?', [user.id]);
      profile = donors[0] || null;
    } else if (user.role === 'hospital') {
      const facilities = await query('SELECT * FROM facilities WHERE user_id = ?', [user.id]);
      profile = facilities[0] || null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, profileId: profile ? profile.id : null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}`,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Demo login failed.' });
  }
});

// Get Current Logged In User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, email, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];
    let profile = null;
    if (user.role === 'donor') {
      const donors = await query('SELECT * FROM donors WHERE user_id = ?', [user.id]);
      profile = donors[0] || null;
    } else if (user.role === 'hospital') {
      const facilities = await query('SELECT * FROM facilities WHERE user_id = ?', [user.id]);
      profile = facilities[0] || null;
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
