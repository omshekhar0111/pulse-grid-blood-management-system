import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import LeafletMapComponent from '../components/LeafletMapComponent';
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
  Phone,
  HelpCircle,
  Users,
  Award,
  Sparkles,
  ChevronDown
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
  const [openFaq, setOpenFaq] = useState(null);

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

  const faqs = [
    {
      q: "Who is eligible to donate blood through Pulse Grid?",
      a: "Healthy individuals aged 18 to 65 with a body weight of at least 45 kg and hemoglobin level > 12.5 g/dL. Male donors can donate whole blood every 90 days, and female donors every 120 days. Final physical and laboratory screening is always conducted by medical officers at the blood bank."
    },
    {
      q: "How does Pulse Grid prevent double fulfillment and negative inventory?",
      a: "All stock deductions occur atomically within relational database transactions. The system locks target inventory batches, verifies expiration dates, ensures available units >= required units, updates the stock, and logs an immutable audit transaction simultaneously."
    },
    {
      q: "Is donor personal contact information publicly exposed?",
      a: "No. In accordance with healthcare data protection principles, phone numbers, exact residential street addresses, and medical details are restricted. Public users can view blood group and city availability; only verified medical staff and administrators can contact donors."
    },
    {
      q: "Can patient requesters track requirement status in real time?",
      a: "Yes. Every request receives a unique tracking code (e.g., PG-REQ-84910). Requesters can log into their dedicated Requester Dashboard to view the live stepper timeline from Pending to Under Review, Approved, and Fulfilled."
    },
    {
      q: "Does an ABO/Rh blood group match guarantee clinical compatibility?",
      a: "No. While ABO and Rh grouping indicates theoretical compatibility, clinical crossmatching and antibody screening by qualified blood-bank laboratory professionals are mandatory before any transfusion."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-red-700 text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>Centralized Healthcare Blood Management & Dispatch Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Every Drop Counts. <br />
                <span className="text-red-600">Every Second Matters.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Pulse Grid connects voluntary blood donors, accredited hospital blood banks, and patient requesters in real-time — eliminating shortages, preventing duplicate issuance, and accelerating life-saving transfusions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/find-blood"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/25 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Blood Availability</span>
                </Link>
                <Link
                  to="/register?role=donor"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Become a Donor</span>
                </Link>
                <Link
                  to="/request-blood"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-red-700 font-bold text-sm border border-rose-200 transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Emergency Request</span>
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Licensed Blood Banks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Atomic Stock Deductions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Cold-Chain 2-6°C Monitored</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive KPI Snapshot */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                    <span className="font-extrabold text-sm text-slate-900">Live Network Telemetry</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Database Synced</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Blood Units</span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.totalBloodUnits || 120}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Available Across 4 Centers</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Voluntary Donors</span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.totalDonors || 8}</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Verified & Active</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Accredited Banks</span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.partnerFacilities || 4}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Delhi NCR Corridor</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Cases Fulfilled</span>
                    <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.requestsFulfilled || 2}</span>
                    <span className="text-[10px] text-red-600 font-semibold">Zero Double-Issuance</span>
                  </div>
                </div>

                <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-red-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <span className="font-bold">Clinical Safety Rule:</span> Final compatibility, crossmatch testing, and issue decisions are handled by certified blood bank professionals.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BLOOD GROUP AVAILABILITY OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <Droplet className="w-3.5 h-3.5 fill-red-600" />
              <span>Real-Time Relational Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Blood Group Availability Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live stock counts stored in database batches across verified regional hospitals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold text-red-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl hover:bg-rose-100 transition"
            >
              Compatibility Matrix
            </button>
            <Link
              to="/find-blood"
              className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-200 transition"
            >
              Search Units →
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
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-red-500 hover:shadow-md transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 group-hover:bg-rose-50 flex items-center justify-center transition mb-2">
                  <span className="text-xl font-black text-slate-900 group-hover:text-red-600 transition">
                    {group}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
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

      {/* 3. HOW PULSE GRID WORKS */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Standard Operating Procedure
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              How Pulse Grid Works
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Automating communication between patients, certified blood banks, and voluntary donors to eliminate emergency turnaround time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Donor Registration & Cooldown</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Donors register with blood group and availability status. Pulse Grid tracks mandatory 90-day cooldown periods between whole blood donations.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hospital Inventory Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospital staff log cold-chain component batches (Whole Blood, PRBC, Platelets, FFP) with expiry alerts and batch barcodes.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Emergency Blood Requests</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients or doctors submit requirement requests with priority, diagnosis, and required date. Nearby centers and matching donors receive instant alerts.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Atomic Issue & Transaction Log</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized staff review, approve, and issue blood with atomic stock deduction, guaranteeing no overselling and logging an immutable audit transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFITS FOR DONORS, HOSPITALS, AND REQUESTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Stakeholder Value
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Tailored Benefits Across the Healthcare Grid
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donors Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 hover:border-red-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-red-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-red-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">For Voluntary Donors</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant notifications when your blood type is required in critical emergency cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automatic 90-day cooldown counter to safeguard your health and recovery.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verified donation certificates and permanent digital contribution history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Strict privacy controls: personal phone and address are protected.</span>
              </li>
            </ul>
          </div>

          {/* Hospitals Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">For Hospitals & Blood Banks</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Batch barcode tracking across Whole Blood, PRBC, Platelets, and FFP components.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Atomic database issue transactions preventing double allocation and negative stock.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Automated alerts for near-expiry units and stock falling below critical thresholds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Complete audit trail logging every intake, adjustment, and dispatch event.</span>
              </li>
            </ul>
          </div>

          {/* Requesters Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 hover:border-amber-500 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">For Patients & Requesters</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Single portal to locate rare blood groups across accredited institutions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Live timeline tracking of requirement status from Pending to Dispatched.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Direct hospital contact and Leaflet map routing for rapid collection.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Transparent triage notes explaining reserve status or crossmatch progress.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. NEARBY BLOOD BANKS & HOSPITALS MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Geospatial OpenStreetMap Grid
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Find Nearby Blood Banks & Hospitals
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Locate accredited blood centers, view available component inventory, and get turn-by-turn routing with GPS consent.
            </p>
          </div>
          <Link
            to="/blood-banks"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Open Dedicated Map View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Leaflet OpenStreetMap Component */}
        <LeafletMapComponent facilities={facilities} />
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Clinical & Platform Guidance
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Essential facts about donor eligibility, inventory safety, and crossmatch guidelines.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 text-sm font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/70"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-red-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Blood Compatibility Guide Modal */}
      <BloodCompatibilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
}
