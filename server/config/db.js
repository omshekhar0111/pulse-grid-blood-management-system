const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = process.env.DB_DRIVER || 'auto';
let pool = null;
let sqliteDb = null;

// Initialize SQLite database
function initSqlite() {
  const sqlite3 = require('sqlite3').verbose();
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'pulsegrid.sqlite');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Failed to open SQLite database:', err.message);
        reject(err);
      } else {
        console.log(`✅ PULSE GRID SQLite Database active at: ${dbPath}`);
        db.run('PRAGMA foreign_keys = ON');
        resolve(db);
      }
    });
  });
}

// Initialize MySQL pool
async function tryInitMysql() {
  const mysql = require('mysql2/promise');
  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'pulsegrid_db';
    const port = process.env.DB_PORT || 3306;

    // First test connection to host
    const connection = await mysql.createConnection({ host, user, password, port });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();

    const newPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true
    });

    // Test pool connection
    const testConn = await newPool.getConnection();
    testConn.release();
    console.log(`✅ Connected to MySQL database [${database}] on ${host}:${port}`);
    return newPool;
  } catch (error) {
    console.warn(`⚠️ MySQL connection unavailable (${error.message}). Falling back to embedded SQLite.`);
    return null;
  }
}

// Unified query wrapper
async function query(sql, params = []) {
  if (pool) {
    const [rows, fields] = await pool.query(sql, params);
    // If it's an INSERT query, normalize insertId
    if (rows && typeof rows.insertId !== 'undefined') {
      return { insertId: rows.insertId, affectedRows: rows.affectedRows, rows };
    }
    return rows;
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim();
      const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA');
      
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } else {
        sqliteDb.run(sql, params, function(err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    });
  } else {
    throw new Error('Database not initialized');
  }
}

// Unified Transaction Helper
async function withTransaction(callback) {
  if (pool) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const trxQuery = async (sql, params = []) => {
        const [rows] = await conn.query(sql, params);
        if (rows && typeof rows.insertId !== 'undefined') {
          return { insertId: rows.insertId, affectedRows: rows.affectedRows, rows };
        }
        return rows;
      };
      const result = await callback(trxQuery);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } else if (sqliteDb) {
    await query('BEGIN TRANSACTION');
    try {
      const result = await callback(query);
      await query('COMMIT');
      return result;
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
}

// Initialize tables in SQLite if running on SQLite
async function setupTablesIfSqlite() {
  if (!sqliteDb) return;

  const createStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'donor',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT DEFAULT 'Male',
      age INTEGER NOT NULL,
      weight_kg REAL DEFAULT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      address TEXT,
      is_available INTEGER DEFAULT 1,
      last_donation_date DATE DEFAULT NULL,
      total_donations INTEGER DEFAULT 0,
      emergency_contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      facility_type TEXT NOT NULL DEFAULT 'Blood Bank',
      license_no TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT NOT NULL,
      emergency_hotline TEXT,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      is_verified INTEGER DEFAULT 1,
      operating_hours TEXT DEFAULT '24/7 Service',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS blood_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      blood_group TEXT NOT NULL,
      component_type TEXT NOT NULL DEFAULT 'Whole Blood',
      units INTEGER NOT NULL DEFAULT 0,
      collection_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      batch_number TEXT NOT NULL UNIQUE,
      storage_temp TEXT DEFAULT '2-6°C',
      status TEXT NOT NULL DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS blood_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      requester_user_id INTEGER DEFAULT NULL,
      patient_name TEXT NOT NULL,
      patient_age INTEGER,
      patient_gender TEXT,
      hospital_name TEXT NOT NULL,
      hospital_address TEXT,
      city TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      component_type TEXT NOT NULL DEFAULT 'Whole Blood',
      units_required INTEGER NOT NULL DEFAULT 1,
      priority TEXT NOT NULL DEFAULT 'Urgent',
      reason TEXT NOT NULL,
      required_date DATE NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_email TEXT,
      doctor_name TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      assigned_facility_id INTEGER DEFAULT NULL,
      fulfillment_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_facility_id) REFERENCES facilities(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      facility_id INTEGER NOT NULL,
      donation_date DATE NOT NULL,
      blood_group TEXT NOT NULL,
      component_type TEXT DEFAULT 'Whole Blood',
      units INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Completed',
      certificate_no TEXT UNIQUE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS requesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      address TEXT,
      emergency_contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER,
      facility_id INTEGER NOT NULL,
      request_id INTEGER DEFAULT NULL,
      transaction_type TEXT NOT NULL,
      units INTEGER NOT NULL,
      previous_units INTEGER NOT NULL,
      new_units INTEGER NOT NULL,
      reason TEXT,
      performed_by_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      target_role TEXT DEFAULT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      link TEXT DEFAULT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const stmt of createStatements) {
    await query(stmt);
  }
}

// Master init function
async function initDatabase() {
  if (dbType === 'mysql') {
    pool = await tryInitMysql();
    if (!pool) {
      console.warn('⚠️ Explicit MySQL requested but failed. Fallback to SQLite.');
      sqliteDb = await initSqlite();
      await setupTablesIfSqlite();
    }
  } else if (dbType === 'sqlite') {
    sqliteDb = await initSqlite();
    await setupTablesIfSqlite();
  } else {
    // Auto detect: try MySQL first, fallback to SQLite
    pool = await tryInitMysql();
    if (!pool) {
      sqliteDb = await initSqlite();
      await setupTablesIfSqlite();
    }
  }
  return { pool, sqliteDb };
}

module.exports = {
  initDatabase,
  query,
  withTransaction
};
