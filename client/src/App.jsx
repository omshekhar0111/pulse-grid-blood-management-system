import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyBanner from './components/EmergencyBanner';

// Pages
import Home from './pages/Home';
import FindBlood from './pages/FindBlood';
import DonorDirectory from './pages/DonorDirectory';
import BloodBanksMap from './pages/BloodBanksMap';
import BloodRequest from './pages/BloodRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-medical-900">
          
          {/* Top Emergency Ticker */}
          <EmergencyBanner />

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1">
            <Routes>
              {/* 1. Home */}
              <Route path="/" element={<Home />} />

              {/* 2. Find Blood Units */}
              <Route path="/find-blood" element={<FindBlood />} />

              {/* 3. Donor Directory */}
              <Route path="/donors" element={<DonorDirectory />} />

              {/* 4. Blood Banks & Hospitals Map */}
              <Route path="/blood-banks" element={<BloodBanksMap />} />

              {/* 5. Blood Request Form */}
              <Route path="/request-blood" element={<BloodRequest />} />

              {/* 6. Login */}
              <Route path="/login" element={<Login />} />

              {/* 7. Registration */}
              <Route path="/register" element={<Register />} />

              {/* 8. Donor Dashboard */}
              <Route path="/donor-dashboard" element={<DonorDashboard />} />

              {/* 9. Hospital / Blood Bank Dashboard */}
              <Route path="/hospital-dashboard" element={<HospitalDashboard />} />

              {/* 10. Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* 11. About Us */}
              <Route path="/about" element={<AboutUs />} />

              {/* 12. Contact Us */}
              <Route path="/contact" element={<ContactUs />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}
