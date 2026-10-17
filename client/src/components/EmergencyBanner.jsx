import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Phone } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="bg-gradient-to-r from-red-600 via-medical-600 to-rose-600 text-white py-2.5 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs md:text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-white/20 text-white font-extrabold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            Urgent Dispatch
          </span>
          <span>Critical Shortage: O-Negative and Platelets required for trauma centers in New Delhi NCR.</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/request-blood"
            className="font-bold underline hover:text-white/90 flex items-center gap-1 text-xs"
          >
            <span>Submit Emergency Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-white/40">|</span>
          <a
            href="tel:1066"
            className="font-bold bg-white text-medical-700 px-2.5 py-0.5 rounded text-xs flex items-center gap-1 hover:bg-slate-100 transition"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1066</span>
          </a>
        </div>
      </div>
    </div>
  );
}
