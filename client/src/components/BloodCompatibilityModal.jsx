import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Check, 
  HelpCircle, 
  Droplet, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BLOOD_GROUPS, 
  RBC_COMPATIBILITY, 
  PLASMA_COMPATIBILITY, 
  CLINICAL_DISCLAIMER 
} from '../utils/bloodData';

export default function BloodCompatibilityModal({ isOpen, onClose }) {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [tab, setTab] = useState('rbc'); // 'rbc' or 'plasma'

  if (!isOpen) return null;

  const currentInfo = RBC_COMPATIBILITY[selectedGroup];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center shadow-md shadow-medical-600/20">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-navy-900">Clinical Blood Compatibility Guide</h3>
              <p className="text-xs text-slate-500">Transfusion donor-recipient matching standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Prominent Medical Warning Alert */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Critical Medical Disclaimer</p>
              <p>{CLINICAL_DISCLAIMER}</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTab('rbc')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'rbc'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Red Blood Cell (RBC) Compatibility
            </button>
            <button
              onClick={() => setTab('plasma')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'plasma'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Plasma & Platelet Compatibility
            </button>
          </div>

          {tab === 'rbc' ? (
            <div className="space-y-6">
              {/* Blood Group Picker */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Blood Group to Inspect:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setSelectedGroup(bg)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition border ${
                        selectedGroup === bg
                          ? 'bg-medical-600 text-white border-medical-600 shadow-md shadow-medical-600/20 scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-medical-500'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Result Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-medical-600">{selectedGroup}</span>
                    <span className="text-xs font-bold text-slate-500">Classification</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-medical-50 text-medical-700 border border-medical-200">
                    {currentInfo.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Can Donate To */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Can Donate RBC To:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentInfo.canDonateTo.map((target) => (
                        <span
                          key={target}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{target}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Can Receive From */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Can Safely Receive RBC From:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentInfo.canReceiveFrom.map((src) => (
                        <span
                          key={src}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>{src}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary Reference */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="font-bold text-rose-900">Universal RBC Donor: O Negative (O-)</div>
                  <p className="text-rose-700 text-[11px] mt-0.5">Their red cells lack A, B, and Rh antigens and can be given in extreme emergencies to all blood groups.</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="font-bold text-blue-900">Universal RBC Recipient: AB Positive (AB+)</div>
                  <p className="text-blue-700 text-[11px] mt-0.5">They have A, B, and Rh antigens, and can receive red cells from any ABO/Rh blood group.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Plasma compatibility is the <strong className="text-navy-900">reverse</strong> of red blood cell compatibility because plasma contains antibodies against antigens that are not present on the person's own red blood cells.
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Plasma Type</th>
                      <th className="p-3">Can Donate Plasma To</th>
                      <th className="p-3">Can Receive Plasma From</th>
                      <th className="p-3">Clinical Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-bold text-medical-600">AB</td>
                      <td className="p-3 font-semibold text-emerald-700">O, A, B, AB (All)</td>
                      <td className="p-3">AB only</td>
                      <td className="p-3 text-slate-500">Universal Plasma Donor</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-900">A</td>
                      <td className="p-3">O, A</td>
                      <td className="p-3">A, AB</td>
                      <td className="p-3 text-slate-500">Standard Plasma Transfusion</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-900">B</td>
                      <td className="p-3">O, B</td>
                      <td className="p-3">B, AB</td>
                      <td className="p-3 text-slate-500">Standard Plasma Transfusion</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-900">O</td>
                      <td className="p-3">O only</td>
                      <td className="p-3 font-semibold text-blue-700">O, A, B, AB (All)</td>
                      <td className="p-3 text-slate-500">Universal Plasma Recipient</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl transition"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
