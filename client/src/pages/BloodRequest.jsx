import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  AlertCircle, 
  Droplet, 
  CheckCircle, 
  Clock, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  ShieldAlert,
  ArrowRight,
  Copy,
  Info
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/bloodData';

export default function BloodRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'Male',
    hospital_name: searchParams.get('hospital_name') || '',
    hospital_address: '',
    city: searchParams.get('city') || 'New Delhi',
    blood_group: searchParams.get('blood_group') || 'O+',
    component_type: searchParams.get('component') || 'Whole Blood',
    units_required: 1,
    priority: 'Urgent',
    reason: '',
    required_date: new Date().toISOString().split('T')[0],
    contact_name: user?.profile?.full_name || '',
    contact_phone: user?.profile?.phone || '',
    contact_email: user?.email || '',
    doctor_name: '',
    preferred_facility_id: searchParams.get('facility_id') || ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/requests', formData);
      if (res.success) {
        setSubmittedRequest({
          code: res.requestCode,
          id: res.requestId,
          ...formData
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit blood request. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (submittedRequest?.code) {
      navigator.clipboard.writeText(submittedRequest.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
          <Droplet className="w-3.5 h-3.5 fill-medical-600" />
          <span>Rapid Hospital & Patient Dispatch</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Emergency Blood Requirement Request
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit required blood groups and components to initiate instant broadcast to local blood banks and matching registered donors.
        </p>
      </div>

      {/* Success Confirmation View */}
      {submittedRequest ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              Request Dispatched Successfully
            </span>
            <h2 className="text-2xl font-black text-navy-900">
              Tracking Code: <span className="text-medical-600">{submittedRequest.code}</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Your request has been prioritized and routed to accredited blood banks in {submittedRequest.city}. Save your tracking code to view live status updates.
            </p>
          </div>

          {/* Code Copy Box */}
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl">
            <span className="font-mono font-bold text-lg text-navy-900">{submittedRequest.code}</span>
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-200 transition"
              title="Copy Tracking Code"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && <span className="text-xs text-emerald-600 font-bold">Copied!</span>}
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left max-w-lg mx-auto grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Patient:</span>
              <span className="font-bold text-slate-800">{submittedRequest.patient_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Required Blood:</span>
              <span className="font-bold text-medical-600">{submittedRequest.units_required} units of {submittedRequest.blood_group} ({submittedRequest.component_type})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Hospital Location:</span>
              <span className="font-bold text-slate-800">{submittedRequest.hospital_name}, {submittedRequest.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Urgency Level:</span>
              <span className="font-bold text-rose-700">{submittedRequest.priority} Priority</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSubmittedRequest(null);
                setFormData(prev => ({ ...prev, patient_name: '', reason: '' }));
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Submit Another Request
            </button>
            <Link
              to="/find-blood"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-sm transition flex items-center gap-1.5"
            >
              <span>Check Live Bank Inventories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          
          {/* Medical Notice */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Clinical Protocol Notice</p>
              <p>
                Submission initiates rapid matching against licensed blood bank databases and local voluntary donor rosters. Final compatibility must be verified with sample crossmatching by the attending clinical pathology team.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-medical-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Patient & Medical Details */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-medical-600" />
                <span>Patient Clinical Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Patient Full Name <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    required
                    value={formData.patient_name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    name="patient_age"
                    min="1"
                    max="110"
                    value={formData.patient_age}
                    onChange={handleChange}
                    placeholder="e.g. 42"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    name="patient_gender"
                    value={formData.patient_gender}
                    onChange={handleChange}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Attending Physician / Doctor Name
                  </label>
                  <input
                    type="text"
                    name="doctor_name"
                    value={formData.doctor_name}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Rajesh Khanna (Cardiology)"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 2. Blood & Component Requirement */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-medical-600" />
                <span>Required Blood & Priority</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Blood Group <span className="text-medical-600">*</span>
                  </label>
                  <select
                    name="blood_group"
                    required
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full text-xs font-bold text-medical-600 py-2.5 px-3 rounded-xl border border-slate-200 bg-rose-50"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Component Type <span className="text-medical-600">*</span>
                  </label>
                  <select
                    name="component_type"
                    required
                    value={formData.component_type}
                    onChange={handleChange}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {BLOOD_COMPONENTS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Units Required <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="units_required"
                    required
                    min="1"
                    max="10"
                    value={formData.units_required}
                    onChange={handleChange}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Urgency Priority <span className="text-medical-600">*</span>
                  </label>
                  <select
                    name="priority"
                    required
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Critical">Critical (Immediate / Emergency)</option>
                    <option value="Urgent">Urgent (&lt; 24 Hours)</option>
                    <option value="Routine">Routine / Scheduled Surgery</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Clinical Reason / Medical Indication <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="reason"
                    required
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. Major orthopedic trauma, post-partum hemorrhage, Dengue thrombocytopenia..."
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Required Date <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="required_date"
                    required
                    value={formData.required_date}
                    onChange={handleChange}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* 3. Hospital & Contact Location */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-medical-600" />
                <span>Hospital & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Hospital Name <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="hospital_name"
                    required
                    value={formData.hospital_name}
                    onChange={handleChange}
                    placeholder="e.g. Apollo Multi-Specialty Hospital"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    City <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. New Delhi"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Hospital Ward / Delivery Location
                  </label>
                  <input
                    type="text"
                    name="hospital_address"
                    value={formData.hospital_address}
                    onChange={handleChange}
                    placeholder="e.g. ICU Wing B, Room 204, Sarita Vihar"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Contact Person Name <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="e.g. Ankit Sharma"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Emergency Phone Number <span className="text-medical-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    required
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98111 23456"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                * All entries are logged in the national audit ledger
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-md shadow-medical-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Droplet className="w-4 h-4 fill-white" />
                <span>{loading ? 'Transmitting Request...' : 'Submit Blood Request'}</span>
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
