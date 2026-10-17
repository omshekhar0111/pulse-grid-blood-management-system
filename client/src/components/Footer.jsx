import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Phone, Mail, MapPin, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Emergency Strip */}
        <div className="bg-medical-950/60 border border-medical-800/40 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-medical-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-medical-600/30">
              <Phone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">24/7 National Emergency Blood Dispatch Helpline</h4>
              <p className="text-slate-400 text-sm">Direct coordination with licensed regional blood banks & trauma units</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="tel:1066"
              className="px-5 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
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
              <div className="w-9 h-9 rounded-lg bg-medical-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">PULSE<span className="text-medical-500">GRID</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A centralized healthcare platform bridging voluntary blood donors, licensed blood banks, and hospital trauma centers to minimize critical response times.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                B.Tech Mini Project BCC-351
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">Home Page</Link>
              </li>
              <li>
                <Link to="/find-blood" className="hover:text-white transition">Find Blood Units</Link>
              </li>
              <li>
                <Link to="/donors" className="hover:text-white transition">Search Donors</Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-white transition">Nearby Blood Banks</Link>
              </li>
              <li>
                <Link to="/request-blood" className="hover:text-white transition">Emergency Blood Request</Link>
              </li>
            </ul>
          </div>

          {/* Clinical & Compliance */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Medical & Standards</h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
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
                <span>Cold Chain Protocol Monitored</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted Health Records</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Contact Coordination</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-medical-500 shrink-0 mt-0.5" />
                <span>Central Medical Hub, Sansad Marg, New Delhi, 110001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-medical-500 shrink-0" />
                <span>emergency@pulsegrid.org</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-medical-500 shrink-0" />
                <span>+91 11 2692 5858 / +91 11 2371 6441</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left max-w-3xl leading-relaxed">
            Medical Disclaimer: Pulse Grid connects patients and hospitals with registered inventory and voluntary donors. Final compatibility must be verified through laboratory crossmatch and screening tests performed by licensed transfusion pathologists.
          </p>
          <div className="text-center md:text-right shrink-0">
            <p>© {new Date().getFullYear()} PULSE GRID. BCC-351 Mini Project.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
