import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Heart, 
  ShieldCheck, 
  Building2, 
  Activity, 
  Clock, 
  Award, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-medical-700 text-xs font-semibold">
          <Droplet className="w-3.5 h-3.5 fill-medical-600" />
          <span>Academic Project BCC-351 • Healthcare Informatics</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          PULSE GRID — Blood Management System
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          A modern full-stack healthcare coordination platform developed to solve the critical problems of blood stock fragmentation, delayed emergency matching, and lack of real-time inventory visibility across medical facilities.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-medical-600 flex items-center justify-center font-bold text-xl">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">The Healthcare Challenge</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In medical emergencies such as trauma surgery, postpartum hemorrhage, and acute thrombocytopenia, patient outcomes depend directly on obtaining compatible blood units within minutes. Traditional systems rely on fragmented phone calls, physical legwork by anxious relatives, and unlinked inventories — leading to preventable delays and expired units.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 pt-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-medical-600"></span>
              <span>Disjointed inventories across regional hospitals and private blood banks</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-medical-600"></span>
              <span>Lack of geospatial tracking for nearest available compatible components</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-medical-600"></span>
              <span>Difficulties mobilizing voluntary donors during off-peak and night hours</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">The Pulse Grid Solution</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pulse Grid establishes a unified digital telemetry network linking accredited hospital blood centers and voluntary donors. It provides real-time stock dashboards by component (Whole Blood, PRBC, Platelets, FFP), automated geospatial mapping with Google Maps, and atomic stock reservation to prevent duplicate issues.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time component tracking with automated shelf-life & expiry monitoring</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Geospatial hospital locator with turn-by-turn routing for emergency ambulances</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Voluntary donor network respecting privacy and medical 90-day cooldown rules</span>
            </li>
          </ul>
        </div>

      </div>

      {/* System Architecture */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-medical-600 uppercase tracking-widest">
            Engineering Architecture
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            System Design & Relational Data Flow
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered with a responsive React frontend, modular RESTful Express API backend, and transactional relational database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto font-bold">
              UI
            </div>
            <h4 className="font-bold text-navy-900 text-sm">Frontend Presentation Tier</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              React 18 + Vite, Tailwind CSS light healthcare design system, Lucide icons, responsive navigation, and Google Maps JavaScript API integration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-bold">
              API
            </div>
            <h4 className="font-bold text-navy-900 text-sm">Application Logic Tier</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Node.js + Express REST API with role-based JWT authentication middleware, input validation, audit ledger logging, and transactional atomic reservations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">
              DB
            </div>
            <h4 className="font-bold text-navy-900 text-sm">Relational Persistence Tier</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Relational SQL database with foreign key integrity, index optimizations, dual MySQL 8 / SQLite support, and seed data generator.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Project Attribution Box */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-rose-300">
            Course Code: BCC-351 • B.Tech Mini Project
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Developed for B.Tech Mini Project Submission
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            This platform adheres to the technical curriculum requirements of BCC-351, featuring end-to-end full-stack integration, Google Maps APIs, relational schema normalization, and role-based access security.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/find-blood"
            className="px-6 py-3 rounded-xl bg-medical-600 hover:bg-medical-500 text-white font-bold text-xs shadow-md transition text-center"
          >
            Explore Live Platform
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition text-center"
          >
            Contact Department
          </Link>
        </div>
      </div>

    </div>
  );
}
