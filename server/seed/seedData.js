const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function seedDatabase() {
  try {
    // Check if users table already has data
    const existingUsers = await query('SELECT count(*) as count FROM users');
    const userCount = existingUsers[0] ? (existingUsers[0].count || existingUsers[0]['count(*)']) : 0;
    
    if (userCount > 0) {
      console.log('ℹ️ Database already contains records. Skipping seed data insertion.');
      return;
    }

    console.log('🌱 Seeding PULSE GRID database with realistic healthcare demo data...');
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Insert Users
    // Admin
    const adminUser = await query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['admin@pulsegrid.org', defaultPassword, 'admin', 'active']
    );

    // Hospital users
    const h1User = await query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['apollo@hospital.org', defaultPassword, 'hospital', 'active']
    );
    const h2User = await query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['redcross@bloodbank.org', defaultPassword, 'hospital', 'active']
    );
    const h3User = await query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['max@hospital.org', defaultPassword, 'hospital', 'active']
    );
    const h4User = await query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      ['fortis@bloodbank.org', defaultPassword, 'hospital', 'active']
    );

    // Donor users
    const donorsData = [
      { email: 'rahul.sharma@donor.org', name: 'Rahul Sharma', blood: 'A+', phone: '+91 98111 23456', gender: 'Male', age: 28, weight: 68.5, city: 'New Delhi', state: 'Delhi', address: 'B-42 Connaught Place', available: 1, lastDonation: '2026-08-15', total: 4 },
      { email: 'priya.verma@donor.org', name: 'Priya Verma', blood: 'O+', phone: '+91 98222 34567', gender: 'Female', age: 26, weight: 56.0, city: 'New Delhi', state: 'Delhi', address: '12 Defence Colony', available: 1, lastDonation: '2026-06-10', total: 6 },
      { email: 'arjun.nair@donor.org', name: 'Arjun Nair', blood: 'B+', phone: '+91 98333 45678', gender: 'Male', age: 31, weight: 74.0, city: 'South Delhi', state: 'Delhi', address: '88 Saket Enclave', available: 0, lastDonation: '2026-10-02', total: 3 },
      { email: 'sneha.patel@donor.org', name: 'Sneha Patel', blood: 'O-', phone: '+91 98444 56789', gender: 'Female', age: 24, weight: 54.5, city: 'Noida', state: 'Uttar Pradesh', address: 'Sector 62, Green Valley', available: 1, lastDonation: '2026-05-20', total: 5 },
      { email: 'vikram.singh@donor.org', name: 'Vikram Singh', blood: 'AB+', phone: '+91 98555 67890', gender: 'Male', age: 34, weight: 81.0, city: 'Gurgaon', state: 'Haryana', address: 'DLF Phase 4', available: 1, lastDonation: '2026-07-14', total: 7 },
      { email: 'ananya.sen@donor.org', name: 'Ananya Sen', blood: 'A-', phone: '+91 98666 78901', gender: 'Female', age: 29, weight: 58.0, city: 'Central Delhi', state: 'Delhi', address: 'Karol Bagh, Block 3', available: 1, lastDonation: '2026-08-01', total: 2 },
      { email: 'mohammed.ali@donor.org', name: 'Mohammed Ali', blood: 'B-', phone: '+91 98777 89012', gender: 'Male', age: 27, weight: 70.0, city: 'South Delhi', state: 'Delhi', address: 'Hauz Khas Village', available: 1, lastDonation: '2026-04-18', total: 4 },
      { email: 'deepak.gupta@donor.org', name: 'Deepak Gupta', blood: 'AB-', phone: '+91 98888 90123', gender: 'Male', age: 32, weight: 76.5, city: 'West Delhi', state: 'Delhi', address: 'Janakpuri District Center', available: 1, lastDonation: '2026-03-12', total: 3 },
    ];

    const donorUserIds = [];
    for (const d of donorsData) {
      const uRes = await query(
        'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
        [d.email, defaultPassword, 'donor', 'active']
      );
      donorUserIds.push({ userId: uRes.insertId, ...d });
    }

    // 2. Insert Facilities
    const f1 = await query(
      `INSERT INTO facilities (user_id, name, facility_type, license_no, contact_person, phone, emergency_hotline, email, address, city, state, pincode, latitude, longitude, is_verified, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h1User.insertId, 'Apollo Multi-Specialty Hospital & Blood Bank', 'Hospital', 'DL-BB-2021-0941', 'Dr. Arvind Mehra', '+91 11 2692 5858', '1066', 'apollo@hospital.org', 'Sarita Vihar, Delhi Mathura Road', 'New Delhi', 'Delhi', '110076', 28.539300, 77.283400, 1, '24/7 Emergency & Blood Bank']
    );

    const f2 = await query(
      `INSERT INTO facilities (user_id, name, facility_type, license_no, contact_person, phone, emergency_hotline, email, address, city, state, pincode, latitude, longitude, is_verified, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h2User.insertId, 'Red Cross Regional Blood Center', 'Blood Bank', 'DL-BB-2018-0012', 'Dr. Sunita Rao', '+91 11 2371 6441', '+91 11 2371 6442', 'redcross@bloodbank.org', '1 Red Cross Road, Sansad Marg Area', 'New Delhi', 'Delhi', '110001', 28.621900, 77.208900, 1, '24/7 Dedicated Blood Bank']
    );

    const f3 = await query(
      `INSERT INTO facilities (user_id, name, facility_type, license_no, contact_person, phone, emergency_hotline, email, address, city, state, pincode, latitude, longitude, is_verified, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h3User.insertId, 'Max Super Speciality Hospital Trauma Unit', 'Trauma Center', 'DL-BB-2020-0433', 'Dr. Rajesh Khanna', '+91 11 2651 5050', '011 4055 4055', 'max@hospital.org', '1, 2 Press Enclave Marg, Saket', 'New Delhi', 'Delhi', '110017', 28.527300, 77.211900, 1, '24/7 Level 1 Trauma Care']
    );

    const f4 = await query(
      `INSERT INTO facilities (user_id, name, facility_type, license_no, contact_person, phone, emergency_hotline, email, address, city, state, pincode, latitude, longitude, is_verified, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h4User.insertId, 'Fortis Escorts Blood & Component Center', 'Blood Bank', 'DL-BB-2019-0782', 'Dr. Pooja Sharma', '+91 11 4713 5000', '+91 11 4713 5555', 'fortis@bloodbank.org', 'Okhla Road, Sukhdev Vihar', 'New Delhi', 'Delhi', '110025', 28.560300, 77.279800, 1, '24/7 Component Separation Center']
    );

    const facilityIds = [f1.insertId, f2.insertId, f3.insertId, f4.insertId];

    // 3. Insert Donor Profiles
    const insertedDonorIds = [];
    for (const d of donorUserIds) {
      const dRes = await query(
        `INSERT INTO donors (user_id, full_name, blood_group, phone, gender, age, weight_kg, city, state, address, is_available, last_donation_date, total_donations, emergency_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.userId, d.name, d.blood, d.phone, d.gender, d.age, d.weight, d.city, d.state, d.address, d.available, d.lastDonation, d.total, '+91 99999 11111']
      );
      insertedDonorIds.push(dRes.insertId);
    }

    // 4. Insert Realistic Blood Inventory
    const inventoryItems = [
      // Apollo
      { fId: facilityIds[0], bg: 'A+', comp: 'Packed Red Blood Cells', units: 14, col: '2026-10-01', exp: '2026-11-12', batch: 'APL-PRBC-2610-01', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[0], bg: 'A-', comp: 'Whole Blood', units: 5, col: '2026-10-05', exp: '2026-11-09', batch: 'APL-WB-2610-02', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[0], bg: 'B+', comp: 'Platelets', units: 8, col: '2026-10-14', exp: '2026-10-19', batch: 'APL-PLT-2610-03', temp: '20-24°C', status: 'Expiring Soon' },
      { fId: facilityIds[0], bg: 'O+', comp: 'Packed Red Blood Cells', units: 18, col: '2026-09-28', exp: '2026-11-02', batch: 'APL-PRBC-2610-04', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[0], bg: 'O-', comp: 'Packed Red Blood Cells', units: 2, col: '2026-10-08', exp: '2026-11-19', batch: 'APL-PRBC-2610-05', temp: '2-6°C', status: 'Low Stock' },
      { fId: facilityIds[0], bg: 'AB+', comp: 'Fresh Frozen Plasma', units: 9, col: '2026-09-15', exp: '2027-09-15', batch: 'APL-FFP-2609-06', temp: '-18°C', status: 'Available' },

      // Red Cross
      { fId: facilityIds[1], bg: 'O+', comp: 'Whole Blood', units: 24, col: '2026-10-10', exp: '2026-11-14', batch: 'RC-WB-2610-10', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[1], bg: 'O-', comp: 'Whole Blood', units: 4, col: '2026-10-11', exp: '2026-11-15', batch: 'RC-WB-2610-11', temp: '2-6°C', status: 'Low Stock' },
      { fId: facilityIds[1], bg: 'A+', comp: 'Platelets', units: 12, col: '2026-10-15', exp: '2026-10-20', batch: 'RC-PLT-2610-12', temp: '20-24°C', status: 'Available' },
      { fId: facilityIds[1], bg: 'B+', comp: 'Packed Red Blood Cells', units: 16, col: '2026-10-02', exp: '2026-11-06', batch: 'RC-PRBC-2610-13', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[1], bg: 'B-', comp: 'Packed Red Blood Cells', units: 3, col: '2026-10-04', exp: '2026-11-08', batch: 'RC-PRBC-2610-14', temp: '2-6°C', status: 'Low Stock' },
      { fId: facilityIds[1], bg: 'AB-', comp: 'Fresh Frozen Plasma', units: 6, col: '2026-08-20', exp: '2027-08-20', batch: 'RC-FFP-2608-15', temp: '-18°C', status: 'Available' },

      // Max Hospital
      { fId: facilityIds[2], bg: 'A+', comp: 'Whole Blood', units: 8, col: '2026-10-06', exp: '2026-11-10', batch: 'MAX-WB-2610-20', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[2], bg: 'O+', comp: 'Platelets', units: 7, col: '2026-10-14', exp: '2026-10-19', batch: 'MAX-PLT-2610-21', temp: '20-24°C', status: 'Expiring Soon' },
      { fId: facilityIds[2], bg: 'B+', comp: 'Whole Blood', units: 11, col: '2026-10-07', exp: '2026-11-11', batch: 'MAX-WB-2610-22', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[2], bg: 'O-', comp: 'Packed Red Blood Cells', units: 3, col: '2026-10-09', exp: '2026-11-13', batch: 'MAX-PRBC-2610-23', temp: '2-6°C', status: 'Low Stock' },
      { fId: facilityIds[2], bg: 'AB+', comp: 'Whole Blood', units: 6, col: '2026-10-03', exp: '2026-11-07', batch: 'MAX-WB-2610-24', temp: '2-6°C', status: 'Available' },

      // Fortis
      { fId: facilityIds[3], bg: 'O+', comp: 'Packed Red Blood Cells', units: 15, col: '2026-10-02', exp: '2026-11-06', batch: 'FOR-PRBC-2610-30', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[3], bg: 'A-', comp: 'Packed Red Blood Cells', units: 4, col: '2026-10-05', exp: '2026-11-09', batch: 'FOR-PRBC-2610-31', temp: '2-6°C', status: 'Low Stock' },
      { fId: facilityIds[3], bg: 'B-', comp: 'Whole Blood', units: 5, col: '2026-10-08', exp: '2026-11-12', batch: 'FOR-WB-2610-32', temp: '2-6°C', status: 'Available' },
      { fId: facilityIds[3], bg: 'AB-', comp: 'Cryoprecipitate', units: 7, col: '2026-09-10', exp: '2027-09-10', batch: 'FOR-CRYO-2609-33', temp: '-18°C', status: 'Available' }
    ];

    for (const inv of inventoryItems) {
      await query(
        `INSERT INTO blood_inventory (facility_id, blood_group, component_type, units, collection_date, expiry_date, batch_number, storage_temp, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [inv.fId, inv.bg, inv.comp, inv.units, inv.col, inv.exp, inv.batch, inv.temp, inv.status]
      );
    }

    // 5. Insert Realistic Blood Requests
    const requests = [
      {
        code: 'PG-REQ-84910',
        userId: donorUserIds[0].userId,
        patient: 'Kavita Sundaram',
        age: 38,
        gender: 'Female',
        hospital: 'Apollo Multi-Specialty Hospital',
        address: 'Sarita Vihar, Ward 4B',
        city: 'New Delhi',
        bg: 'O-',
        comp: 'Packed Red Blood Cells',
        units: 2,
        priority: 'Critical',
        reason: 'Postpartum hemorrhage emergency following caesarean section',
        reqDate: '2026-10-18',
        contactName: 'Sundaram Nathan',
        phone: '+91 98101 44552',
        email: 'sundaram.n@gmail.com',
        doctor: 'Dr. Neha Kapoor (Obs/Gyn)',
        status: 'Pending',
        facId: facilityIds[0],
        notes: null
      },
      {
        code: 'PG-REQ-84911',
        userId: donorUserIds[1].userId,
        patient: 'Harpreet Singh',
        age: 45,
        gender: 'Male',
        hospital: 'Max Super Speciality Hospital Trauma Unit',
        address: 'Press Enclave Marg, Saket',
        city: 'New Delhi',
        bg: 'A+',
        comp: 'Whole Blood',
        units: 3,
        priority: 'Urgent',
        reason: 'Scheduled coronary artery bypass grafting (CABG)',
        reqDate: '2026-10-20',
        contactName: 'Jasleen Kaur',
        phone: '+91 98202 55663',
        email: 'jasleen.singh@gmail.com',
        doctor: 'Dr. Vivek Tandon (Cardiothoracic)',
        status: 'Under Review',
        facId: facilityIds[2],
        notes: 'Under review by Max Blood Bank crossmatch lab.'
      },
      {
        code: 'PG-REQ-84912',
        userId: donorUserIds[2].userId,
        patient: 'Aarav Mehta',
        age: 8,
        gender: 'Male',
        hospital: 'Red Cross Regional Blood Center',
        address: '1 Red Cross Road',
        city: 'New Delhi',
        bg: 'B+',
        comp: 'Platelets',
        units: 4,
        priority: 'Urgent',
        reason: 'Dengue Hemorrhagic Fever with platelet count below 15,000/mcL',
        reqDate: '2026-10-17',
        contactName: 'Ritu Mehta',
        phone: '+91 98303 66774',
        email: 'ritu.mehta@yahoo.com',
        doctor: 'Dr. S. K. Gupta (Pediatrics)',
        status: 'Approved',
        facId: facilityIds[1],
        notes: 'Units reserved and ready for pickup.'
      },
      {
        code: 'PG-REQ-84913',
        userId: donorUserIds[3].userId,
        patient: 'Suresh Kumar',
        age: 52,
        gender: 'Male',
        hospital: 'Fortis Escorts Blood Center',
        address: 'Okhla Road',
        city: 'New Delhi',
        bg: 'O+',
        comp: 'Packed Red Blood Cells',
        units: 2,
        priority: 'Routine',
        reason: 'Monthly maintenance transfusion for Thalassemia Major patient',
        reqDate: '2026-10-15',
        contactName: 'Geeta Kumar',
        phone: '+91 98404 77885',
        email: 'geeta.k@hotmail.com',
        doctor: 'Dr. R. C. Mathur (Hematology)',
        status: 'Fulfilled',
        facId: facilityIds[3],
        notes: 'Transfusion completed successfully. Batch FOR-PRBC-2610-30 issued.'
      },
      {
        code: 'PG-REQ-84914',
        userId: null,
        patient: 'Manish Verma',
        age: 29,
        gender: 'Male',
        hospital: 'Apollo Multi-Specialty Hospital',
        address: 'Sarita Vihar, ICU-2',
        city: 'New Delhi',
        bg: 'AB+',
        comp: 'Fresh Frozen Plasma',
        units: 2,
        priority: 'Routine',
        reason: 'Severe acute pancreatitis with coagulopathy correction',
        reqDate: '2026-10-12',
        contactName: 'Anita Verma',
        phone: '+91 98505 88996',
        email: 'anita.verma@gmail.com',
        doctor: 'Dr. Arvind Mehra (Critical Care)',
        status: 'Fulfilled',
        facId: facilityIds[0],
        notes: 'Dispatched and transfused without adverse reaction.'
      }
    ];

    for (const r of requests) {
      await query(
        `INSERT INTO blood_requests (request_code, requester_user_id, patient_name, patient_age, patient_gender, hospital_name, hospital_address, city, blood_group, component_type, units_required, priority, reason, required_date, contact_name, contact_phone, contact_email, doctor_name, status, assigned_facility_id, fulfillment_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.code, r.userId, r.patient, r.age, r.gender, r.hospital, r.address, r.city, r.bg, r.comp, r.units, r.priority, r.reason, r.reqDate, r.contactName, r.phone, r.email, r.doctor, r.status, r.facId, r.notes]
      );
    }

    // 6. Insert Donations History
    const donationsData = [
      { dId: insertedDonorIds[0], fId: facilityIds[0], date: '2026-08-15', bg: 'A+', comp: 'Whole Blood', units: 1, cert: 'PULSE-CERT-2026-101' },
      { dId: insertedDonorIds[1], fId: facilityIds[1], date: '2026-06-10', bg: 'O+', comp: 'Packed Red Blood Cells', units: 1, cert: 'PULSE-CERT-2026-102' },
      { dId: insertedDonorIds[3], fId: facilityIds[1], date: '2026-05-20', bg: 'O-', comp: 'Whole Blood', units: 1, cert: 'PULSE-CERT-2026-103' },
      { dId: insertedDonorIds[4], fId: facilityIds[2], date: '2026-07-14', bg: 'AB+', comp: 'Platelets', units: 1, cert: 'PULSE-CERT-2026-104' },
      { dId: insertedDonorIds[5], fId: facilityIds[0], date: '2026-08-01', bg: 'A-', comp: 'Whole Blood', units: 1, cert: 'PULSE-CERT-2026-105' }
    ];

    for (const don of donationsData) {
      await query(
        `INSERT INTO donations (donor_id, facility_id, donation_date, blood_group, component_type, units, status, certificate_no, notes)
         VALUES (?, ?, ?, ?, ?, ?, 'Completed', ?, 'Donor cleared health screening. Post-donation vitals normal.')`,
        [don.dId, don.fId, don.date, don.bg, don.comp, don.units, don.cert]
      );
    }

    // 7. Insert Audit Logs
    const auditEvents = [
      { uId: adminUser.insertId, action: 'SYSTEM_INITIALIZED', entity: 'system', entityId: 1, details: 'Pulse Grid central blood management platform initialized' },
      { uId: h1User.insertId, action: 'FACILITY_VERIFIED', entity: 'facility', entityId: facilityIds[0], details: 'Apollo Blood Bank licensed and verified' },
      { uId: h2User.insertId, action: 'INVENTORY_ADDED', entity: 'inventory', entityId: 1, details: 'Batch RC-WB-2610-10 (24 units O+) stored in Cold Storage 1' },
      { uId: h1User.insertId, action: 'REQUEST_FULFILLED', entity: 'request', entityId: 4, details: 'Request PG-REQ-84913 fulfilled for Suresh Kumar' },
      { uId: donorUserIds[1].userId, action: 'DONOR_STATUS_UPDATE', entity: 'donor', entityId: insertedDonorIds[1], details: 'Priya Verma updated status to Available' }
    ];

    for (const evt of auditEvents) {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?)`,
        [evt.uId, evt.action, evt.entity, evt.entityId, evt.details]
      );
    }

    console.log('✅ Demo seed data created successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = { seedDatabase };
