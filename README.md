# PULSE GRID — Blood Management System
### Full-Stack Healthcare Transfusion & Inventory Platform (B.Tech Mini-Project)

**PULSE GRID** is a centralized, responsive healthcare web application designed to connect voluntary blood donors, patients requesting blood, accredited hospital blood banks, and administrative authorities in one synchronized ecosystem.

---

## 🩸 Core Highlights & Capabilities

1. **Four Specialized User Roles & Dedicated Dashboards**:
   - **Voluntary Blood Donor**: Profile completeness gauge, donation cooldown tracker (mandatory 90-day rest interval), real-time availability toggle, and emergency matching alerts.
   - **Blood Requester (Patients & Attendants)**: Emergency requirement submission, live 4-step triage timeline (Pending → Under Review → Approved → Fulfilled), cancellation workflow, and assigned hospital pickup directions.
   - **Hospital & Blood Bank Staff**: Cold-chain inventory batch tracking (Whole Blood, PRBC, Platelets, FFP, Cryoprecipitate), expiry date warnings, atomic blood unit issuance, and an immutable transaction ledger.
   - **System Administrator**: Real-time national KPI telemetry, institutional license verification, user access governance, and a complete system audit trail.

2. **Leaflet & OpenStreetMap Geospatial Discovery**:
   - Interactive OpenStreetMap integration (100% free, no commercial API key required).
   - Real-time geolocation with user consent handling and manual city/address fallback.
   - Turn-by-turn routing links and live stock badges for nearby certified facilities.

3. **Critical Business Rules & Transaction Integrity**:
   - **Zero Overselling**: Prevents issuing more units than are verified and available in stock.
   - **Strict Non-Negative Check**: Database check constraints strictly enforce `units >= 0`.
   - **Atomic State Transitions**: Stock deduction and request fulfillment occur synchronously in a single transaction.
   - **Duplicate-Issue Prevention**: Blocks repeated processing of already fulfilled requirement cases.
   - **Privacy Protection**: Masks donor personal phone numbers and residential addresses from unauthorized public access.
   - **Clinical Safety Disclaimer**: Disclaims that ABO/Rh grouping matches require laboratory crossmatching and antibody screening by qualified clinical pathologists.

4. **In-App Notification Center**:
   - Real-time unread counter badge in top navigation.
   - Automated event triggers on request submission, status changes, approvals, low stock thresholds, and near-expiry advisories.
   - One-click "Mark All as Read" and direct action linking.

5. **Dual Database Architecture (Cloud Supabase + Local Zero-Config)**:
   - **Supabase Cloud (PostgreSQL)**: Complete SQL migration script (`supabase_schema.sql` and `supabase/migrations/20261024_pulsegrid_init.sql`) with Row Level Security (RLS) policies, UUID primary keys, and the `issue_blood_units` stored procedure.
   - **Embedded SQLite / MySQL Fallback**: Automatic local database initialization (`pulsegrid.sqlite`) with rich demo seed data for evaluation without cloud credentials.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React Icons |
| **Geospatial Maps** | Leaflet, OpenStreetMap Tile Layer |
| **Backend API** | Node.js, Express.js REST API, JSON Web Tokens (JWT), BCrypt.js |
| **Cloud Database** | Supabase (PostgreSQL with RLS, Triggers, & Stored Procedures) |
| **Local Database Engine**| SQLite 3 / MySQL 8.x with Transactional Driver |
| **Deployment** | Vercel (Frontend Client) & Supabase / Node.js (Backend Services) |

---

## 📂 Source Code Structure

```
pulsegrid/
├── client/                              # React 19 + Vite Frontend
│   ├── public/                          # Static assets and icons
│   ├── src/
│   │   ├── components/                  # Navbar, Footer, LeafletMapComponent, BloodCompatibilityModal...
│   │   ├── context/                     # AuthContext (Multi-role JWT state management)
│   │   ├── pages/                       # 13 Complete Responsive Pages
│   │   │   ├── Home.jsx                 # Public landing page with live telemetry & FAQs
│   │   │   ├── FindBlood.jsx            # Multi-filter inventory search
│   │   │   ├── DonorDirectory.jsx       # Privacy-protected donor search
│   │   │   ├── BloodBanksMap.jsx        # OpenStreetMap geospatial discovery
│   │   │   ├── BloodRequest.jsx         # Emergency patient requirement submission
│   │   │   ├── DonorDashboard.jsx       # Donor dashboard with cooldown & history
│   │   │   ├── RequesterDashboard.jsx   # Dedicated requester dashboard & live timeline
│   │   │   ├── HospitalDashboard.jsx    # Hospital command desk & transaction ledger
│   │   │   ├── AdminDashboard.jsx       # Governance, RLS status, & audit ledger
│   │   │   ├── Login.jsx                # Multi-role authentication & one-click demo
│   │   │   ├── Register.jsx             # Donor, Requester, and Hospital registration
│   │   │   ├── AboutUs.jsx              # Mission and clinical governance
│   │   │   └── ContactUs.jsx            # Emergency coordination desk
│   │   ├── utils/                       # API client, blood data matrices, & Supabase client
│   │   ├── App.jsx                      # Route definitions
│   │   └── index.css                    # Tailwind CSS & Leaflet animations
│   ├── .env.example                     # Example environment configuration
│   └── package.json
├── server/                              # Node.js + Express Backend
│   ├── config/                          # db.js (SQLite + MySQL relational driver)
│   ├── middleware/                      # auth.js (JWT authentication & role guards)
│   ├── routes/                          # auth, inventory, requests, donors, facilities, notifications, admin
│   ├── seed/                            # seedData.js (Realistic demo hospitals, donors, batches, requests)
│   ├── data/                            # Embedded SQLite database storage
│   ├── test_workflows.js                # Automated testing suite for business rules
│   └── server.js                        # Master HTTP server startup
├── supabase/
│   └── migrations/                      # 20261024_pulsegrid_init.sql (Full PostgreSQL DDL)
├── supabase_schema.sql                  # Standalone Supabase schema with RLS & functions
├── package.json                         # Root concurrent execution scripts
└── README.md                            # Comprehensive project documentation
```

---

## ⚡ Quick Start (Run Locally in 2 Steps)

### Step 1: Install Dependencies
```bash
# In the pulsegrid root directory:
npm install
npm --prefix server install
npm --prefix client install
```

### Step 2: Start Both Backend & Frontend Concurrently
```bash
# In the pulsegrid root directory:
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Running Automated Tests

Pulse Grid includes an automated workflow test suite verifying core business rules, overselling protection, negative quantity rejection, atomic transactions, and role authorization:

```bash
# Run tests from the root directory:
npm test

# Or directly in server directory:
cd server && node test_workflows.js
```

**Test Verification Checklist**:
- [x] All 8 core relational tables created in database
- [x] User registration & profile creation for all 4 roles
- [x] Rejection of negative inventory units
- [x] Blood requirement submission and tracking code generation
- [x] Prevention of issuing unavailable or insufficient stock
- [x] Atomic stock deduction and immutable `inventory_transactions` logging
- [x] In-app notification creation and read state updates
- [x] Requester request cancellation workflow
- [x] Privacy protection of donor contact details

---

## 🔑 Evaluator Demo Login Accounts

You can click any role in the **Demo Switcher** located in the top navigation bar, or enter these pre-seeded credentials:

| Role | Email Address | Password | Functionality |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@pulsegrid.org` | `password123` | National analytics, user access governance, facility license verification, and audit trail |
| **Hospital / Blood Bank**| `apollo@hospital.org` | `password123` | Apollo Hospital blood center desk, inventory batch intake, issue transactions, and stock adjustments |
| **Blood Requester** | `requester@pulsegrid.org`| `password123` | Patient Aditi Rao requirement desk, live status timeline, assigned hospital pickup info, and cancel option |
| **Voluntary Blood Donor**| `priya.verma@donor.org` | `password123` | O+ Voluntary Donor, availability toggle, 90-day donation cooldown counter, and appointment booking |

---

## ☁️ Connecting Supabase Cloud (PostgreSQL & RLS)

To deploy with Supabase backend services:

1. **Create a Supabase Project**:
   Sign in to [supabase.com](https://supabase.com) and create a new project.

2. **Execute the Database Migration**:
   In your Supabase Dashboard, open the **SQL Editor**, paste the contents of `supabase_schema.sql` (or `supabase/migrations/20261024_pulsegrid_init.sql`), and click **Run**. This will create:
   - 8 Relational Tables (`profiles`, `donors`, `blood_banks`, `blood_inventory`, `blood_requests`, `inventory_transactions`, `notifications`, `audit_logs`).
   - Indexes for fast querying.
   - Row Level Security (RLS) policies enforcing role boundaries.
   - The atomic stored procedure `issue_blood_units`.

3. **Configure Frontend Environment**:
   In `client/.env`, configure your Supabase project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_URL=/api
   ```
   When configured, the application navigation bar will display **Supabase Connected**.

---

## 🚀 Deploying on Vercel

1. **Push Code to GitHub**:
   Commit and push your project repository to GitHub.

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New Project**.
   - Select your `pulsegrid` repository.
   - Set **Root Directory** to `client`.
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**:
   In Vercel Project Settings → Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_API_URL`: Your deployed backend API URL (or leave empty if using Supabase client directly)

4. **Deploy**:
   Click **Deploy**. Your Pulse Grid web application will be live with high availability!

---

## 🔒 Creating a Secure Administrator Account

To preserve system security, public registration prevents users from self-assigning administrator privileges. Administrators can be provisioned via one of two methods:

### Method 1: Database Seed / Direct SQL
Run the following SQL statement in your database:
```sql
INSERT INTO users (email, password_hash, role, status) 
VALUES ('newadmin@pulsegrid.org', '$2a$10$hashed_password_string', 'admin', 'active');
```

### Method 2: Supabase SQL Editor
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## 🛠️ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 5000 in use** | Previous background node process | Run `npx kill-port 5000` or set `PORT=5001` in `server/.env`. |
| **Map pins not loading** | Offline / tile server delay | OpenStreetMap tiles require an internet connection. If offline, the manual search list provides full fallback. |
| **Registration error: Email already exists** | Duplicate registration | Use a different email address or use the One-Click Demo Switcher. |
| **Stock deduction rejected** | Insufficient units in batch | Check batch units before fulfilling. Pulse Grid strictly prevents negative stock. |

---

## 📜 Academic Viva & Evaluation Checklist

- [x] **Working Frontend & Backend**: Complete React 19 client + Express REST server + SQLite/Supabase engines.
- [x] **Authentication & Role Guards**: 4 roles (Donor, Requester, Hospital, Admin) with protected routes.
- [x] **Geospatial Discovery**: Leaflet + OpenStreetMap integration with GPS consent handling.
- [x] **Data Validation**: Strict non-negative inventory quantities, expiry date checks, and required field validation.
- [x] **In-App Notifications**: Notification center with unread badge counter and real-time alerts.
- [x] **Audit Ledger**: Comprehensive tracking of inventory movement and clinical triage decisions.
- [x] **Full-Stack Documentation**: Setup guide, SQL schemas, architecture diagrams, and deployment instructions.
