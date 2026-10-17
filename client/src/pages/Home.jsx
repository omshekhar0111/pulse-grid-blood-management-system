import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import GoogleMapComponent from '../components/GoogleMapComponent';
import BloodCompatibilityModal from '../components/BloodCompatibilityModal';
import { 
  Droplet, 
  Heart, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Search, 
  MapPin, 
  FileText,
  UserCheck,
  ChevronRight,
  Phone
} from 'lucide-react';
import { BLOOD_GROUPS } from '../utils/bloodData';

export default function Home() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalBloodUnits: 0,
    partnerFacilities: 0,
    requestsFulfilled: 0,
    bloodGroupAvailability: {},
  });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, facRes] = await Promise.all([
          api.get('/stats'),
          api.get('/facilities'),
        ]);

        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        if (facRes.success) {
          setFacilities(facRes.facilities);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-medical-700 text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-medical-600 animate-pulse"></span>
                <span>Centralized Healthcare Blood Dispatch System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
                Every Drop Counts. <br />
                <span className="text-medical-600">Every Second Matters.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Pulse Grid seamlessly connects voluntary blood donors, accredited hospital blood banks, and critical emergency trauma care centers in real-time — eliminating shortages and expediting life-saving transfusions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/find-blood"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm shadow-md shadow-medical-600/25 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Blood Now</span>
                </Link>
                <Link
                  to="/register?role=donor"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-navy-900 font-bold text-sm border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-medical-600" />
                  <span>Become a Donor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified Blood Banks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-medical-600" />
                  <span>Live Cold-Chain Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Emergency Automated Matching</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Healthcare Interactive Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Visual Medical Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 relative">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-navy-900">National Blood Grid Monitor</h4>
                        <p className="text-[11px] text-slate-400">Live Telemetry & Emergency Sync</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      ONLINE
                    </span>
                  </div>

                  {/* Real-time Inventory Snapshot */}
                  <div className="mt-5 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Regional Blood Stock Level
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['A+', 'B+', 'O+', 'AB+'].map((group) => (
                        <div key={group} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-xs font-black text-navy-900">{group}</span>
                          <div className="text-[10px] font-bold text-medical-600 mt-0.5">
                            {stats.bloodGroupAvailability[group]?.units || 24} units
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Urgent Dispatch Card */}
                  <div className="mt-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-medical-600" />
                        Active Emergency Dispatch
                      </span>
                      <span className="text-[10px] bg-medical-600 text-white px-2 py-0.5 rounded-full uppercase">Critical</span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1">
                      O-Negative PRBC requested for Trauma OT at Apollo Hospital. 2 matching donors notified within 3.2 km radius.
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-rose-700 pt-2 border-t border-rose-200/60 font-semibold">
                      <span>Response time: &lt; 8 mins</span>
                      <Link to="/request-blood" className="text-medical-700 hover:underline">View Dispatch →</Link>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="font-semibold text-medical-600 hover:text-medical-700 flex items-center gap-1"
                    >
                      <span>Transfusion Compatibility Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono">BCC-351</span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. REAL DATABASE STATISTICS CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Registered Donors"
            value={stats.totalDonors}
            label="Verified voluntary donors ready to respond"
            icon={Heart}
            color="medical"
          />
          <StatCard
            title="Blood Units in Stock"
            value={stats.totalBloodUnits}
            label="Tested & cold-chain verified units available"
            icon={Droplet}
            color="emerald"
          />
          <StatCard
            title="Partner Blood Banks"
            value={stats.partnerFacilities}
            label="Licensed hospitals and regional blood centers"
            icon={Building2}
            color="navy"
          />
          <StatCard
            title="Requests Fulfilled"
            value={stats.requestsFulfilled}
            label="Life-saving emergency deliveries completed"
            icon={CheckCircle2}
            color="blue"
          />
        </div>
      </section>

      {/* 3. BLOOD GROUP AVAILABILITY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
              <Droplet className="w-3.5 h-3.5 fill-medical-600" />
              <span>Real-Time Inventory State</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              Blood Group Live Availability
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Aggregated stock across all verified hospital blood centers in the network.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold text-medical-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl hover:bg-rose-100 transition"
            >
              Compatibility Matrix
            </button>
            <Link
              to="/find-blood"
              className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-200 transition"
            >
              Detailed Search →
            </Link>
          </div>
        </div>

        {/* 8 Blood Group Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BLOOD_GROUPS.map((group) => {
            const groupData = stats.bloodGroupAvailability[group] || { units: 0, status: 'Out of Stock' };
            const isAvailable = groupData.units > 15;
            const isLow = groupData.units > 0 && groupData.units <= 15;

            return (
              <div
                key={group}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-medical-500 hover:shadow-md transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 group-hover:bg-rose-50 flex items-center justify-center transition mb-2">
                  <span className="text-xl font-black text-navy-900 group-hover:text-medical-600 transition">
                    {group}
                  </span>
                </div>
                <div className="text-2xl font-black text-navy-900 tracking-tight">
                  {groupData.units}
                  <span className="text-xs font-semibold text-slate-400 ml-1">units</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isLow
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {groupData.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW PULSE GRID WORKS */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-medical-600 uppercase tracking-widest">
              Emergency Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 mt-2">
              How Pulse Grid Connects The Care Ecosystem
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Designed to eliminate delays between patient blood requests, verified inventory allocation, and voluntary donor dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Donor Registration & Vetting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Donors enroll with blood group, geographic location, and medical donation intervals. Automated eligibility checks track 90-day cooldown periods.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Real-Time Inventory Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospital blood banks maintain verified stock by blood group and component type (Whole Blood, PRBC, Platelets, FFP) with expiry alerts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Automated Emergency Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a hospital submits a blood requirement, our geospatial engine maps nearest blood centers and sends prioritized alerts to matching donors.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="font-bold text-navy-900 text-base mb-2">Atomic Reservation & Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allocated units are verified via batch barcode, reserved atomically in the database to prevent duplicate issues, and dispatched for transfusion.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. EMERGENCY BLOOD REQUEST CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-medical-600 via-rose-600 to-rose-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-medical-600/20 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Emergency Transfusion Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              In Need of Urgent Blood for Surgery or Critical Care?
            </h2>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
              Submit your patient requirements immediately. Our system flags critical emergencies to nearby licensed blood banks and matching voluntary donors in seconds.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/request-blood"
                className="px-6 py-3 rounded-xl bg-white text-medical-700 font-bold text-sm hover:bg-slate-100 shadow-md transition flex items-center gap-2"
              >
                <span>Submit Emergency Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:1066"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline 1066</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEARBY BLOOD BANKS & HOSPITALS MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-medical-600 uppercase tracking-wider">
              Interactive Google Maps
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
              Find Nearby Blood Banks & Hospitals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real-time map showing verified medical centers with available inventory, contact details, and directions.
            </p>
          </div>
          <Link
            to="/blood-banks"
            className="text-xs font-bold text-medical-600 hover:text-medical-700 flex items-center gap-1"
          >
            <span>Open Fullscreen Map View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Map Preview */}
        <GoogleMapComponent facilities={facilities} />
      </section>

      {/* Blood Compatibility Guide Modal */}
      <BloodCompatibilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
}
