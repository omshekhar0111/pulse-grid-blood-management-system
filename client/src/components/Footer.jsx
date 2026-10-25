import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Phone, Mail, MapPin, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Emergency Strip */}
        <div className="bg-red-950/60 border border-red-800/40 rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/30">
              <Phone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">24/7 National Emergency Blood Dispatch Helpline</h4>
              <p className="text-slate-400 text-sm">Direct institutional coordination with licensed regional blood banks & trauma units</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="tel:1066"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 1066 / 1800-PULSE-GRID</span>
            </a>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">PULSE<span className="text-red-500">GRID</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A centralized healthcare blood management ecosystem connecting voluntary blood donors, accredited hospital blood banks, and patient requesters to minimize emergency response delays.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                College Mini-Project (Full-Stack Architecture)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Navigation</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">Home Page</Link>
              </li>
              <li>
                <Link to="/find-blood" className="hover:text-white transition">Find Blood Units</Link>
              </li>
              <li>
                <Link to="/donors" className="hover:text-white transition">Donor Directory</Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-white transition">Nearby Blood Banks & Map</Link>
              </li>
              <li>
                <Link to="/request-blood" className="hover:text-white transition">Submit Blood Requirement</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Pulse Grid</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact & Support</Link>
              </li>
            </ul>
          </div>

          {/* Clinical & Compliance */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Medical Standards</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WHO Blood Transfusion Norms</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NBTC Guidelines Compliant</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cold Chain 2-6°C Monitored</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PostgreSQL Row Level Security</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Contact Coordination</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Central Medical Hub, Sansad Marg, New Delhi, 110001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>support@pulsegrid.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+91 11 2692 5858 / +91 11 2371 6441</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left max-w-3xl leading-relaxed">
            Medical Disclaimer: Pulse Grid connects patients and hospitals with registered inventory and voluntary donors. Final compatibility must be verified through laboratory crossmatch and screening tests performed by licensed transfusion pathologists. Never rely solely on ABO/Rh grouping.
          </p>
          <div className="text-center md:text-right shrink-0">
            <p>© {new Date().getFullYear()} PULSE GRID. All rights reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
