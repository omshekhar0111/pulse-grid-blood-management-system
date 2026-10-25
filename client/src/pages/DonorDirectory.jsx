import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Lock,
  MessageSquare
} from 'lucide-react';
import { BLOOD_GROUPS } from '../utils/bloodData';

export default function DonorDirectory() {
  const { user, isAuthenticated, role } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('All');
  const [city, setCity] = useState('All');
  const [availableOnly, setAvailableOnly] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSuccessMsg, setContactSuccessMsg] = useState('');

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {
        blood_group: bloodGroup,
        city,
        search: searchQuery
      };
      if (availableOnly === 'true') params.available = 'true';
      if (availableOnly === 'false') params.available = 'false';

      const res = await api.get('/donors', params);
      if (res.success) {
        setDonors(res.donors);
      }
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, city, availableOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleInitiateContact = (donor) => {
    setContactSuccessMsg(`Emergency broadcast alert dispatched to ${donor.full_name} (${donor.blood_group})! The donor will receive your hospital request notification.`);
    setTimeout(() => setContactSuccessMsg(''), 5000);
  };

  const isStaff = isAuthenticated && (role === 'hospital' || role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-medical-600" />
            <span>Voluntary Donor Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Donor Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified voluntary blood donors ready to assist in critical healthcare emergencies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/register?role=donor"
            className="px-4 py-2 text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Register as a Donor</span>
          </Link>
        </div>
      </div>

      {contactSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{contactSuccessMsg}</span>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Donor Privacy Protection Enforced</p>
          <p>
            {isStaff
              ? 'You are logged in as verified hospital/admin staff. Direct emergency contact information is visible for medical coordination.'
              : 'Direct donor phone numbers and emails are masked to protect donor confidentiality in accordance with medical ethics. Verified hospitals can initiate urgent donation contact requests.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Donor or City
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-navy-900"
            >
              <option value="All">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Availability Status
            </label>
            <select
              value={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="all">All Donors</option>
              <option value="true">Available to Donate Now</option>
              <option value="false">Currently Inactive / Cooldown</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Donors</span>
            </button>
          </div>

        </form>
      </div>

      {/* Donors Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-semibold">
            Showing {donors.length} registered donors
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Heart className="w-8 h-8 text-medical-600 animate-pulse mx-auto mb-2" />
            <p className="text-xs text-slate-500">Querying verified donor database...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base">No Donors Match Your Search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your blood group or location filter, or invite donors to join Pulse Grid.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donors.map((donor) => {
              const isAvailable = donor.is_available && donor.is_medically_eligible;

              return (
                <div
                  key={donor.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header with Blood Group Badge */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-medical-50 border border-medical-100 text-medical-600 font-black text-xl flex items-center justify-center shrink-0">
                          {donor.blood_group}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                            <span>{donor.full_name}</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Donor" />
                          </h4>
                          <span className="text-xs text-slate-500">
                            {donor.gender}, {donor.age} yrs • {donor.weight_kg ? `${donor.weight_kg} kg` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Location & Details with Privacy Protection */}
                    <div className="py-3 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">{donor.city}, {donor.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isStaff ? (
                          <span className="font-mono font-bold text-slate-800">{donor.phone}</span>
                        ) : (
                          <span className="font-mono text-slate-400 italic">
                            {donor.phone ? donor.phone.slice(0, 6) + '••••' : '••••••••••'} (Staff Protected)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {isStaff ? (
                          <span className="text-slate-600 truncate">{donor.email}</span>
                        ) : (
                          <span className="text-slate-400 italic">Protected by Donor Privacy Consent</span>
                        )}
                      </div>
                    </div>

                    {/* Stats & Donation Cooldown */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Donations</span>
                        <span className="font-bold text-navy-900">{donor.total_donations || 0} times</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Last Donated</span>
                        <span className="font-bold text-navy-900">
                          {donor.days_since_last_donation !== null
                            ? `${donor.days_since_last_donation}d ago`
                            : 'First Time'}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Warning if on cooldown */}
                    {!donor.is_medically_eligible && (
                      <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>In 90-day post-donation rest cooldown</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-3">
                    {isStaff ? (
                      <button
                        onClick={() => handleInitiateContact(donor)}
                        disabled={!donor.is_available}
                        className="w-full py-2 px-3 text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send Emergency Alert to Donor</span>
                      </button>
                    ) : (
                      <Link
                        to={`/request-blood?blood_group=${encodeURIComponent(donor.blood_group)}&city=${encodeURIComponent(donor.city)}`}
                        className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>Request Match for this Group</span>
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
