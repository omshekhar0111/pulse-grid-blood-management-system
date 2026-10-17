import React from 'react';

export default function StatCard({ title, value, label, icon: Icon, color = 'medical' }) {
  const colorMap = {
    medical: 'bg-rose-50 text-medical-600 border-rose-100',
    navy: 'bg-slate-100 text-navy-900 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-navy-900 mt-1 tracking-tight">{value}</h3>
        {label && <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.medical}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
