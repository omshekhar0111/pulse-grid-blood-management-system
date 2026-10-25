import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Droplet, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Building2, 
  Calendar, 
  Phone, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
  Bell,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export default function RequesterDashboard() {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, notifRes] = await Promise.all([
        api.get('/requests', { user_only: 'true' }),
        api.get('/notifications').catch(() => ({ notifications: [] }))
      ]);

      if (reqRes.success) {
        setRequests(reqRes.requests || []);
      }
      if (notifRes.notifications) {
        setNotifications(notifRes.notifications || []);
      }
    } catch (err) {
      console.error('Requester dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const handleCancelRequest = async (requestId, requestCode) => {
    if (!window.confirm(`Are you sure you want to cancel request ${requestCode}? This cannot be undone.`)) {
      return;
    }
    setCancellingId(requestId);
    try {
      const res = await api.patch(`/requests/${requestId}/cancel`);
      if (res.success) {
        setActionNotice(`Request ${requestCode} was successfully cancelled.`);
        setTimeout(() => setActionNotice(''), 4000);
        loadData();
      }
    } catch (err) {
      alert('Failed to cancel request: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Compute status metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const fulfilledCount = requests.filter(r => r.status === 'Fulfilled').length;

  const filteredRequests = requests.filter(r => {
    const matchesTab = activeTab === 'All' || r.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      r.request_code.toLowerCase().includes(q) ||
      r.patient_name.toLowerCase().includes(q) ||
      r.hospital_name.toLowerCase().includes(q) ||
      r.blood_group.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const getTimelineSteps = (status) => {
    const isCancelled = status === 'Cancelled';
    const isRejected = status === 'Rejected';

    if (isCancelled || isRejected) {
      return [
        { label: 'Submitted', done: true, current: false },
        { label: 'Reviewed', done: true, current: false },
        { label: isCancelled ? 'Cancelled' : 'Rejected', done: false, failed: true, current: true }
      ];
    }

    const order = ['Pending', 'Under Review', 'Approved', 'Fulfilled'];
    const currentIndex = order.indexOf(status);

    return [
      { label: 'Submitted', done: currentIndex >= 0, current: currentIndex === 0 },
      { label: 'Under Review', done: currentIndex >= 1, current: currentIndex === 1 },
      { label: 'Approved & Allocated', done: currentIndex >= 2, current: currentIndex === 2 },
      { label: 'Fulfilled & Issued', done: currentIndex >= 3, current: currentIndex === 3 },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 shadow-red-500/20">
            <Droplet className="w-7 h-7 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Patient & Requester Command Center
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-red-700 border border-rose-200 uppercase">
                Requester
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active User: <span className="font-semibold text-slate-700">{user?.profile?.full_name || user?.email}</span> • Real-time hospital dispatch and crossmatch tracking.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/request-blood"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Emergency Request</span>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Requests</span>
            <Droplet className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalCount}</div>
          <p className="text-xs text-slate-500 mt-1">All submitted requirement cases</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Active Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</div>
          <p className="text-xs text-slate-500 mt-1">Being reviewed by crossmatch labs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved & Reserved</span>
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">{approvedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Allocated, awaiting hospital pickup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fulfilled & Transfused</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{fulfilledCount}</div>
          <p className="text-xs text-slate-500 mt-1">Units safely issued from stock</p>
        </div>
      </div>

      {/* Main Content: Requests Timeline & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Requests Feed */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 w-full sm:w-auto">
              {['All', 'Pending', 'Under Review', 'Approved', 'Fulfilled', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Requests Cards List */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <Droplet className="w-8 h-8 text-red-600 animate-pulse mx-auto mb-2" />
              <p className="text-xs text-slate-500">Retrieving your blood requirement cases...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No blood requests match this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need blood components urgently? Submit a verified requirement form to notify nearby hospital blood banks.
              </p>
              <Link
                to="/request-blood"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Blood Request</span>
              </Link>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const timelineSteps = getTimelineSteps(req.status);
              const canCancel = req.status === 'Pending' || req.status === 'Under Review';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <span>{req.request_code}</span>
                        <button
                          onClick={() => copyCode(req.request_code)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy tracking code"
                        >
                          {copiedCode === req.request_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        req.priority === 'Critical' 
                          ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                          : req.priority === 'Urgent'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {req.priority} Priority
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        req.status === 'Fulfilled' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Approved'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : req.status === 'Cancelled'
                          ? 'bg-slate-100 text-slate-600'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        ● {req.status}
                      </span>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelRequest(req.id, req.request_code)}
                          disabled={cancellingId === req.id}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                        >
                          {cancellingId === req.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patient & Requirement Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Patient Name</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">{req.patient_name}</span>
                      <span className="text-[11px] text-slate-500">{req.patient_age ? `${req.patient_age} yrs` : ''} {req.patient_gender || ''}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Requirement</span>
                      <span className="font-black text-red-600 text-sm mt-0.5 block">
                        {req.blood_group} ({req.units_required} {req.units_required === 1 ? 'Unit' : 'Units'})
                      </span>
                      <span className="text-[11px] text-slate-500">{req.component_type}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Hospital / Center</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block truncate">{req.hospital_name}</span>
                      <span className="text-[11px] text-slate-500">{req.city}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Required By</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">{req.required_date}</span>
                      <span className="text-[11px] text-slate-400">Doctor: {req.doctor_name || 'Attending Physician'}</span>
                    </div>
                  </div>

                  {/* Medical Reason */}
                  {req.reason && (
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
                      <span className="font-bold text-slate-700">Clinical Reason: </span>
                      <span>{req.reason}</span>
                    </div>
                  )}

                  {/* Request Status Stepper Timeline */}
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Live Triage Status Timeline
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {timelineSteps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                            step.failed 
                              ? 'bg-rose-600 text-white' 
                              : step.done 
                              ? 'bg-emerald-600 text-white' 
                              : step.current 
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100' 
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {step.failed ? '✕' : step.done ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold ${
                            step.failed ? 'text-rose-700' : step.done ? 'text-emerald-700' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Facility Info (if allocated) */}
                  {req.assigned_facility_name && (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Assigned Facility: {req.assigned_facility_name}</span>
                        </span>
                        {req.assigned_facility_phone && (
                          <span className="text-slate-600 text-[11px] mt-0.5 block">
                            Direct Contact: {req.assigned_facility_phone}
                          </span>
                        )}
                        {req.fulfillment_notes && (
                          <p className="text-[11px] text-blue-800 italic mt-1 font-medium">
                            "{req.fulfillment_notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.assigned_facility_phone && (
                          <a
                            href={`tel:${req.assigned_facility_phone}`}
                            className="px-3 py-1.5 rounded-xl bg-white text-blue-700 font-bold border border-blue-200 hover:bg-blue-50 transition flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Facility</span>
                          </a>
                        )}
                        <Link
                          to={`/blood-banks?id=${req.assigned_facility_id}`}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View on Map</span>
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

        {/* Right 1 Column: Requester Sidebar */}
        <div className="space-y-6">
          
          {/* Notifications Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-600" />
                <span>Status Notifications</span>
              </h3>
              <span className="text-[11px] text-slate-400">Live Feed</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notifications.filter(n => n.target_role === 'requester' || n.user_id === user?.id).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active status notifications.
                </div>
              ) : (
                notifications
                  .filter(n => n.target_role === 'requester' || n.user_id === user?.id)
                  .slice(0, 5)
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        notif.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : notif.type === 'alert'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="font-bold">{notif.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Blood Match Check Card */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-6 shadow-lg shadow-red-600/20 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-base leading-snug">Emergency Blood Advisory</h4>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                Pulse Grid connects you directly with accredited blood banks. Transfusion decisions, ABO/Rh crossmatching, and release testing must be performed by certified clinical lab staff.
              </p>
            </div>
            <Link
              to="/find-blood"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-white px-4 py-2 rounded-xl hover:bg-rose-50 transition"
            >
              <span>Search Available Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Emergency Helpline Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">National Medical Helplines</h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Emergency Ambulance</span>
                <span className="font-bold text-red-600">108 / 102</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Red Cross Central Desk</span>
                <span className="font-bold text-slate-800">+91 11 2371 6441</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pulse Grid Dispatch Desk</span>
                <span className="font-bold text-slate-800">1800-PULSE-GRID</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
