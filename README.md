# PULSE GRID — Blood Management System
### B.Tech Mini Project (Course Code: BCC-351)

**PULSE GRID** is a complete, modern, realistic, and responsive healthcare web application designed to connect voluntary blood donors, accredited hospital blood banks, and emergency trauma centers in one centralized ecosystem.

---

## 🩸 Key Highlights & Features

1. **Light Healthcare UI/UX**: Clean medical design in white, soft slate grey, medical red (`#e11d48`), and subtle dark navy (`#102a43`).
2. **Interactive Google Maps**: Real-time geolocation, distance calculation in km, labeled hospital & blood bank markers, directions link, and live stock view.
3. **Role-Based Authentication**: Dedicated flows and secure JWT authorization for:
   - **Voluntary Donors**: Profile management, donation cooldown counter (90-day interval), availability toggle, emergency request matches, appointment scheduling.
   - **Hospitals & Blood Banks**: Real-time inventory batch tracking (Whole Blood, PRBC, Platelets, FFP, Cryoprecipitate), expiry date warnings, request triage and atomic stock deduction upon fulfillment.
   - **System Administrators**: National KPIs, blood distribution charts, institutional license verification, user access control, and cryptographically logged audit trail.
4. **Blood Compatibility Clinical Guide**: Interactive RBC and Plasma compatibility matrices with clear NBTC / WHO clinical disclaimers.
5. **Dual Database Engine**:
   - Out-of-the-box **automatic SQLite fallback** (`pulsegrid.sqlite`) for immediate zero-friction local testing.
   - Full **MySQL 8.x** support via `mysql2` with included `pulsegrid_schema.sql`.
6. **One-Click Demo Switcher**: Instant login for examiners and evaluators without typing passwords!

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), BCrypt password hashing.
- **Database**: MySQL 8.x (or zero-config SQLite fallback), SQL transactions for atomic inventory deductions.
- **Maps**: Google Maps JavaScript API & Places API (`@react-google-maps/api`).

---

## 📂 Project Structure

```
pulsegrid/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, GoogleMapComponent, BloodCompatibilityModal, etc.
│   │   ├── pages/              # 12 complete pages (Home, FindBlood, Donors, Map, Dashboards...)
│   │   ├── context/            # AuthContext (JWT session management)
│   │   └── utils/              # API fetch client & clinical blood matrices
│   ├── .env                    # VITE_GOOGLE_MAPS_API_KEY & VITE_API_URL
│   └── package.json
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # db.js (Dual MySQL + SQLite driver with transactions)
│   ├── middleware/             # auth.js (JWT verify & role authorization)
│   ├── routes/                 # auth, inventory, requests, donors, facilities, stats, admin
│   ├── seed/                   # seedData.js (Realistic hospitals, donors, batches, requests)
│   ├── .env                    # DB_DRIVER, JWT_SECRET, PORT, DB_HOST...
│   └── server.js
├── pulsegrid_schema.sql        # Standalone MySQL schema definition
├── package.json                # Root concurrent scripts
└── README.md
```

---

## ⚡ Quick Start (Run Locally in 2 Steps)

The backend server is already pre-configured to automatically seed rich demo data into an embedded SQLite database if MySQL is not currently running, allowing instant zero-configuration testing!

### Step 1: Install Dependencies (if not already installed)
```bash
# In the pulsegrid root directory:
npm install
npm --prefix server install
npm --prefix client install
```

### Step 2: Start Both Backend & Frontend
```bash
# In the pulsegrid root directory:
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Accounts for Project Evaluation

You can use the **Demo Switcher** in the top navigation bar or enter the following pre-seeded credentials:

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@pulsegrid.org` | `password123` | Full admin dashboard, user management, audit ledger, and analytics |
| **Hospital / Blood Bank** | `apollo@hospital.org` | `password123` | Apollo Hospital blood center dashboard, inventory batches, request fulfillment |
| **Blood Donor** | `priya.verma@donor.org` | `password123` | O+ Voluntary Donor, availability toggle, appointment booking |

---

## 🗺️ Google Maps API Key Configuration

The Google Maps integration uses the provided key:
```
AIzaSyBzt79rm_ZIAD3rs_zVByCxGyg6tMa8GCQ
```

Configured in `client/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBzt79rm_ZIAD3rs_zVByCxGyg6tMa8GCQ
VITE_API_URL=/api
```
If the key has origin restrictions or is offline, the map gracefully displays verified facility coordinates, distance calculations, and directions links without throwing uncaught exceptions.

---

## 🗄️ MySQL Database Setup (Optional for Viva / Production)

If you have MySQL or XAMPP running:

1. Import `pulsegrid_schema.sql` into MySQL:
   ```bash
   mysql -u root -p < pulsegrid_schema.sql
   ```
2. Configure `server/.env`:
   ```env
   DB_DRIVER=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=pulsegrid_db
   ```
3. Restart the backend server. The database layer will seamlessly connect to MySQL.

---

## 📑 Required Pages Implemented

1. **Home (`/`)**: Hero section, real database KPI stats, 8 blood group live availability cards, workflow explanation, emergency request callout, Google Maps preview.
2. **Find Blood (`/find-blood`)**: Filter by blood group, component, city, and status; batch expiry info; direct request button.
3. **Donor Directory (`/donors`)**: Filterable directory with privacy-masked contact numbers, cooldown indicators, and emergency notification triggers.
4. **Blood Banks Map (`/blood-banks`)**: Interactive Google Map with GPS geolocation, custom SVG pins, distance calculator, and turn-by-turn routing.
5. **Blood Request Form (`/request-blood`)**: Clinical requirement intake, urgency triage, auto-generated tracking code (`PG-REQ-XXXXX`).
6. **Login (`/login`)**: Role-based authentication and one-click demo access.
7. **Register (`/register`)**: Dual tabs for Voluntary Donor and Hospital/Blood Bank enrollment.
8. **Donor Dashboard (`/donor-dashboard`)**: Profile stats, live availability switch, donation history, urgent local matches, appointment scheduling.
9. **Hospital Dashboard (`/hospital-dashboard`)**: Shelf-life batch management, add new inventory modal, request review & atomic fulfillment.
10. **Admin Dashboard (`/admin`)**: National KPIs, real database distribution charts, user access controls (suspend/activate), audit ledger.
11. **About Us (`/about`)**: Healthcare problem statement, architectural diagram, and B.Tech Mini Project BCC-351 credit.
12. **Contact Us (`/contact`)**: 24/7 emergency dispatch numbers, contact form, and FAQ accordion.

---

## ⚕️ Medical Transfusion Disclaimer

> The compatibility matrices and stock indicators provided on Pulse Grid are strictly for emergency coordination and clinical guidance. Actual transfusion compatibility, crossmatching, antibody screening, and final donor eligibility MUST always be validated by qualified pathology laboratory personnel in compliance with National Blood Transfusion Council (NBTC) regulations.
