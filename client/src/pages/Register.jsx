import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Building2, 
  Droplet, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  Users
} from 'lucide-react';
import { BLOOD_GROUPS } from '../utils/bloodData';

export default function Register() {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const initialRole = requestedRole === 'hospital' ? 'hospital' : (requestedRole === 'requester' ? 'requester' : 'donor');
  const [role, setRole] = useState(initialRole);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Donor Form State
  const [donorData, setDonorData] = useState({
    email: '',
    password: '',
    fullName: '',
    bloodGroup: 'O+',
    phone: '',
    gender: 'Male',
    age: '24',
    weight: '62',
    city: 'New Delhi',
    state: 'Delhi',
    address: '',
    isAvailable: true,
    lastDonationDate: '',
  });

  // Requester Form State
  const [requesterData, setRequesterData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: 'New Delhi',
    state: 'Delhi',
    address: '',
    emergencyContact: '',
  });

  // Hospital Form State
  const [hospitalData, setHospitalData] = useState({
    email: '',
    password: '',
    facilityName: '',
    facilityType: 'Blood Bank',
    licenseNo: '',
    contactPerson: '',
    phone: '',
    emergencyHotline: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    latitude: 28.6139,
    longitude: 77.2090,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDonorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRequesterChange = (e) => {
    const { name, value } = e.target;
    setRequesterData(prev => ({ ...prev, [name]: value }));
  };

  const handleHospitalChange = (e) => {
    const { name, value } = e.target;
    setHospitalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let payload;
      if (role === 'donor') payload = { role: 'donor', ...donorData };
      else if (role === 'requester') payload = { role: 'requester', ...requesterData };
      else payload = { role: 'hospital', ...hospitalData };

      const res = await register(payload);
      if (res.success) {
        if (role === 'donor') navigate('/donor-dashboard');
        else if (role === 'requester') navigate('/requester-dashboard');
        else navigate('/hospital-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please review the form fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Brand Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md shadow-red-600/30">
          <Droplet className="w-6 h-6 fill-white" />
        </div>
        <h1 className="mt-4 text-3xl font-black text-slate-900 tracking-tight">
          Join the PULSE GRID Network
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Select your registration profile to access verified blood matching and donation workflows
        </p>
      </div>

      {/* Role Tabs - 3 Public Roles */}
      <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-2xl border border-slate-200 gap-1">
        <button
          type="button"
          onClick={() => setRole('donor')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            role === 'donor'
              ? 'bg-white text-red-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Voluntary Blood Donor</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('requester')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            role === 'requester'
              ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient / Requester</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('hospital')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            role === 'hospital'
              ? 'bg-white text-blue-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital / Blood Bank</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {role === 'donor' && (
            /* DONOR FORM */
            <>
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={donorData.email}
                      onChange={handleDonorChange}
                      placeholder="your.email@example.com"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      name="password"
                      minLength={6}
                      value={donorData.password}
                      onChange={handleDonorChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Medical Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Donor Health & Contact Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={donorData.fullName}
                      onChange={handleDonorChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blood Group <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      required
                      value={donorData.bloodGroup}
                      onChange={handleDonorChange}
                      className="w-full text-xs font-bold text-red-600 py-2.5 px-3 rounded-xl border border-slate-200 bg-rose-50"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={donorData.phone}
                      onChange={handleDonorChange}
                      placeholder="+91 98111 23456"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age (18-65) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      name="age"
                      min="18"
                      max="65"
                      value={donorData.age}
                      onChange={handleDonorChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Weight (kg) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      name="weight"
                      min="45"
                      max="150"
                      value={donorData.weight}
                      onChange={handleDonorChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={donorData.city}
                      onChange={handleDonorChange}
                      placeholder="New Delhi"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={donorData.state}
                      onChange={handleDonorChange}
                      placeholder="Delhi"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Donation Date (if any)
                    </label>
                    <input
                      type="date"
                      name="lastDonationDate"
                      value={donorData.lastDonationDate}
                      onChange={handleDonorChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={donorData.isAvailable}
                      onChange={handleDonorChange}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      I am currently in good health and agree to receive voluntary emergency donation alerts.
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {role === 'requester' && (
            /* REQUESTER FORM */
            <>
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Requester Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={requesterData.email}
                      onChange={handleRequesterChange}
                      placeholder="aditi.rao@example.com"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      name="password"
                      minLength={6}
                      value={requesterData.password}
                      onChange={handleRequesterChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Contact Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Personal & Emergency Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={requesterData.fullName}
                      onChange={handleRequesterChange}
                      placeholder="e.g. Aditi Rao"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={requesterData.phone}
                      onChange={handleRequesterChange}
                      placeholder="+91 98999 55555"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={requesterData.city}
                      onChange={handleRequesterChange}
                      placeholder="New Delhi"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={requesterData.state}
                      onChange={handleRequesterChange}
                      placeholder="Delhi"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address / Locality
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={requesterData.address}
                      onChange={handleRequesterChange}
                      placeholder="A-14 Hauz Khas Enclave"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alternate / Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={requesterData.emergencyContact}
                      onChange={handleRequesterChange}
                      placeholder="+91 98999 55556"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'hospital' && (
            /* HOSPITAL FORM */
            <>
              {/* Facility Account */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Facility Admin Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Facility Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={hospitalData.email}
                      onChange={handleHospitalChange}
                      placeholder="bloodbank@hospital.org"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      name="password"
                      minLength={6}
                      value={hospitalData.password}
                      onChange={handleHospitalChange}
                      placeholder="••••••••••••"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Healthcare Institution Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital / Blood Bank Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="facilityName"
                      value={hospitalData.facilityName}
                      onChange={handleHospitalChange}
                      placeholder="e.g. City Central Blood Bank"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facility Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="facilityType"
                      value={hospitalData.facilityType}
                      onChange={handleHospitalChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      <option value="Blood Bank">Dedicated Blood Bank</option>
                      <option value="Hospital">Multi-Specialty Hospital</option>
                      <option value="Trauma Center">Trauma Center (Level 1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medical License Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="licenseNo"
                      value={hospitalData.licenseNo}
                      onChange={handleHospitalChange}
                      placeholder="e.g. DL-BB-2024-0192"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person / Lab In-Charge
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={hospitalData.contactPerson}
                      onChange={handleHospitalChange}
                      placeholder="Dr. S. K. Gupta"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Desk Phone <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={hospitalData.phone}
                      onChange={handleHospitalChange}
                      placeholder="+91 11 2371 6441"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      24/7 Emergency Transfusion Hotline
                    </label>
                    <input
                      type="tel"
                      name="emergencyHotline"
                      value={hospitalData.emergencyHotline}
                      onChange={handleHospitalChange}
                      placeholder="1066 / +91 11 2371 6442"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={hospitalData.city}
                      onChange={handleHospitalChange}
                      placeholder="New Delhi"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physical Street Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="address"
                      value={hospitalData.address}
                      onChange={handleHospitalChange}
                      placeholder="1 Red Cross Road, Sansad Marg Area"
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Latitude (for Leaflet Maps GPS)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="latitude"
                      value={hospitalData.latitude}
                      onChange={handleHospitalChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Longitude (for Leaflet Maps GPS)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      name="longitude"
                      value={hospitalData.longitude}
                      onChange={handleHospitalChange}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-red-600 hover:underline">
                Sign in
              </Link>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
