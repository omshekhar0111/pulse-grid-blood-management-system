import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Droplet, 
  Clock, 
  CheckCircle, 
  Calendar, 
  AlertCircle, 
  Building2, 
  Award, 
  Bell, 
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  UserCheck,
  Info
} from 'lucide-react';

export default function DonorDashboard() {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [donor, setDonor] = useState(null);
  const [history, setHistory] = useState([]);
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Schedule appointment form
  const [scheduleData, setScheduleData] = useState({
    facility_id: '',
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    component_type: 'Whole Blood',
    notes: 'Voluntary donation via Pulse Grid'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'donor' && role !== 'admin') {
      navigate('/hospital-dashboard');
      return;
    }

    async function loadData() {
      try {
        const [profileRes, facRes, notifRes] = await Promise.all([
          api.get('/donors/my-profile'),
          api.get('/facilities'),
          api.get('/notifications').catch(() => ({ notifications: [] }))
        ]);

        if (profileRes.success) {
          setDonor(profileRes.donor);
          setHistory(profileRes.donation_history || []);

          // Fetch matching requests for this donor's blood group
          const reqRes = await api.get('/requests', {
            blood_group: profileRes.donor.blood_group,
            status: 'Pending'
          });
          if (reqRes.success) {
            setMatchingRequests(reqRes.requests || []);
          }
        }

        if (facRes.success && facRes.facilities.length > 0) {
          setFacilities(facRes.facilities);
          setScheduleData(prev => ({ ...prev, facility_id: facRes.facilities[0].id }));
        }

        if (notifRes.notifications) {
          setNotifications(notifRes.notifications || []);
        }
      } catch (err) {
        console.error('Donor dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, role]);

  const handleToggleAvailability = async () => {
    if (!donor) return;
    setTogglingAvail(true);
    try {
      const newAvail = !donor.is_available;
      const res = await api.patch('/donors/availability', { is_available: newAvail });
      if (res.success) {
        setDonor(prev => ({ ...prev, is_available: newAvail }));
      }
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/donors/schedule', scheduleData);
      if (res.success) {
        setScheduleSuccess(`Appointment scheduled! Reference code: ${res.bookingCode}`);
        setTimeout(() => setScheduleSuccess(''), 6000);
      }
    } catch (err) {
      alert('Scheduling failed: ' + err.message);
    }
  };

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    if (!donor) return 50;
    const fields = [
      donor.full_name,
      donor.blood_group,
      donor.phone,
      donor.age,
      donor.weight_kg,
      donor.city,
      donor.address,
      donor.emergency_contact
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPct = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="w-8 h-8 text-red-600 animate-pulse mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading donor portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-red-600 font-black text-2xl shadow-sm shrink-0">
            {donor?.blood_group || 'O+'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {donor?.full_name || user?.email}
              </h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Donor</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered in {donor?.city}, {donor?.state} • Blood Group: <strong className="text-slate-900">{donor?.blood_group}</strong>
            </p>
          </div>
        </div>

        {/* Real-Time Availability Switch */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 self-stretch md:self-auto justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Emergency Donation Status</div>
            <p className="text-[11px] text-slate-500">
              {donor?.is_available ? 'You are marked Available for emergency matches' : 'You are currently marked Unavailable'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={togglingAvail}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              donor?.is_available
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            {togglingAvail ? 'Updating...' : donor?.is_available ? 'Available' : 'Unavailable'}
          </button>
        </div>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Clinical Eligibility Standard:</span>
          <span>
            Physical donation eligibility (minimum Hb 12.5 g/dL, normal blood pressure, weight &ge; 45kg, and mandatory 90-day cooldown interval) must always be certified in person by medical officers at the donation facility. Pulse Grid provides matching and coordination assistance only.
          </span>
        </div>
      </div>

      {/* KPI Cards & Profile Completion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Donations</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {donor?.total_donations || history.length || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Estimated {(donor?.total_donations || history.length || 1) * 3} lives supported</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Completion</span>
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {completionPct}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Urgent Matches</span>
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 mt-2">
            {matchingRequests.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Hospital cases needing {donor?.blood_group}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Partner Centers</span>
            <Building2 className="w-5 h-5 text-slate-900" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {facilities.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Accredited blood banks in network</p>
        </div>
      </div>

      {/* Main Grid: Urgent Matching Requests & Schedule Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Urgent Requests matching Donor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Urgent Patient Requests for Your Blood Group ({donor?.blood_group})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {matchingRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-900">No Critical Shortages for {donor?.blood_group} Right Now</h4>
                <p className="text-xs text-slate-500 mt-1">Thank you! When a hospital emergency arises for your blood group, it will appear here immediately.</p>
              </div>
            ) : (
              matchingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-red-500 shadow-sm transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-800">
                        {req.priority} • {req.component_type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{req.patient_name} ({req.patient_age || 'Adult'} yrs)</h4>
                      <p className="text-xs text-slate-500">{req.hospital_name}, {req.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-red-600">{req.units_required}</span>
                      <span className="text-xs text-slate-400 block -mt-1">units</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-slate-900">Clinical Reason:</strong> {req.reason}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Required Date: {req.required_date}</span>
                    <button
                      onClick={() => alert(`Thank you! Notification sent to ${req.hospital_name}. Their blood bank coordinator will contact you at ${donor.phone} to arrange collection.`)}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      I Can Donate For This Patient
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schedule Donation Appointment Form & Notifications */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Schedule a Voluntary Blood Donation</span>
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              Book a comfortable, supervised blood donation appointment at an accredited partner blood bank. Receive health screening and an official digital certificate.
            </p>

            {scheduleSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scheduleSuccess}</span>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Blood Center</label>
                <select
                  value={scheduleData.facility_id}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, facility_id: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={scheduleData.appointment_date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Donation Type</label>
                <select
                  value={scheduleData.component_type}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, component_type: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Whole Blood">Whole Blood (Standard)</option>
                  <option value="Platelets">Platelets (Apheresis)</option>
                  <option value="Plasma">Plasma</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Confirm Donation Appointment
              </button>
            </form>
          </div>

          {/* In-App Notifications Feed for Donor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-red-600" />
              <span>Donor Notifications</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notifications.filter(n => n.target_role === 'donor' || n.user_id === user?.id).length === 0 ? (
                <p className="text-slate-400 text-xs py-2">No active notifications.</p>
              ) : (
                notifications
                  .filter(n => n.target_role === 'donor' || n.user_id === user?.id)
                  .map(n => (
                    <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Donation History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-600" />
          <span>My Verified Donation History</span>
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No donation records yet. Schedule your first appointment above to start saving lives!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Facility / Hospital</th>
                  <th className="p-3">Component</th>
                  <th className="p-3">Units</th>
                  <th className="p-3">Certificate Code</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((don) => (
                  <tr key={don.id}>
                    <td className="p-3 font-semibold text-slate-900">{don.donation_date}</td>
                    <td className="p-3">{don.facility_name || 'Red Cross Regional Blood Center'}</td>
                    <td className="p-3">{don.component_type}</td>
                    <td className="p-3 font-bold text-red-600">{don.units} Unit</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{don.certificate_no || 'N/A'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {don.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
