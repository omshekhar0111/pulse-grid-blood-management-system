-- ==============================================================
-- PULSE GRID — Blood Management System (BCC-351)
-- Relational Database Schema (MySQL Compatible)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS pulsegrid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pulsegrid_db;

-- 1. Users Table (Core Auth & Roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'hospital', 'admin') NOT NULL DEFAULT 'donor',
    status ENUM('active', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Donor Profiles
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(30) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    age INT NOT NULL,
    weight_kg DECIMAL(5, 2) DEFAULT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE DEFAULT NULL,
    total_donations INT DEFAULT 0,
    emergency_contact VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donor_blood_group (blood_group),
    INDEX idx_donor_city (city),
    INDEX idx_donor_availability (is_available)
) ENGINE=InnoDB;

-- 3. Facilities (Hospitals & Blood Banks)
CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    facility_type ENUM('Blood Bank', 'Hospital', 'Trauma Center', 'Research Center') NOT NULL DEFAULT 'Blood Bank',
    license_no VARCHAR(100) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    emergency_hotline VARCHAR(30),
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    operating_hours VARCHAR(100) DEFAULT '24/7 Service',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_facility_city (city),
    INDEX idx_facility_type (facility_type),
    INDEX idx_facility_verified (is_verified)
) ENGINE=InnoDB;

-- 4. Blood Inventory Table
CREATE TABLE IF NOT EXISTS blood_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component_type ENUM('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL DEFAULT 'Whole Blood',
    units INT NOT NULL DEFAULT 0,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    storage_temp VARCHAR(50) DEFAULT '2-6°C',
    status ENUM('Available', 'Low Stock', 'Expiring Soon', 'Expired', 'Reserved') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    INDEX idx_inv_group (blood_group),
    INDEX idx_inv_facility (facility_id),
    INDEX idx_inv_status (status),
    INDEX idx_inv_expiry (expiry_date)
) ENGINE=InnoDB;

-- 5. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(30) NOT NULL UNIQUE,
    requester_user_id INT DEFAULT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_age INT,
    patient_gender ENUM('Male', 'Female', 'Other'),
    hospital_name VARCHAR(200) NOT NULL,
    hospital_address TEXT,
    city VARCHAR(100) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component_type ENUM('Whole Blood', 'Packed Red Blood Cells', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL DEFAULT 'Whole Blood',
    units_required INT NOT NULL DEFAULT 1,
    priority ENUM('Critical', 'Urgent', 'Routine') NOT NULL DEFAULT 'Urgent',
    reason TEXT NOT NULL,
    required_date DATE NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(255),
    doctor_name VARCHAR(150),
    status ENUM('Pending', 'Under Review', 'Approved', 'Fulfilled', 'Rejected') NOT NULL DEFAULT 'Pending',
    assigned_facility_id INT DEFAULT NULL,
    fulfillment_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_facility_id) REFERENCES facilities(id) ON DELETE SET NULL,
    INDEX idx_req_blood_group (blood_group),
    INDEX idx_req_status (status),
    INDEX idx_req_priority (priority),
    INDEX idx_req_code (request_code)
) ENGINE=InnoDB;

-- 6. Donations History Table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    facility_id INT NOT NULL,
    donation_date DATE NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component_type ENUM('Whole Blood', 'Platelets', 'Plasma') DEFAULT 'Whole Blood',
    units INT DEFAULT 1,
    status ENUM('Completed', 'Scheduled', 'Deferred') DEFAULT 'Completed',
    certificate_no VARCHAR(100) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Audit & Activity Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Contact & Inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
