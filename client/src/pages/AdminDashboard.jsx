import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Droplet, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Search, 
  UserX, 
  UserCheck, 
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [notice, setNotice] = useState('');

  const loadAdminData = async () => {
    try {
      const [ovRes, uRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users')
      ]);

      if (ovRes.success) setOverview(ovRes.data);
      if (uRes.success) setUsersList(uRes.users);
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [isAuthenticated, role]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.success) {
        setNotice(`User status updated to ${nextStatus}.`);
        setTimeout(() => setNotice(''), 4000);
        loadAdminData();
      }
    } catch (err) {
      alert('Error updating user status: ' + err.message);
    }
  };

  const handleToggleFacilityVerify = async (facilityId, currentVerify) => {
    try {
      const nextVal = currentVerify ? false : true;
      const res = await api.patch(`/admin/facilities/${facilityId}/verify`, { is_verified: nextVal });
      if (res.success) {
        setNotice('Facility verification updated.');
        setTimeout(() => setNotice(''), 4000);
        loadAdminData();
      }
    } catch (err) {
      alert('Error verifying facility: ' + err.message);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.donor_name && u.donor_name.toLowerCase().includes(q)) ||
      (u.facility_name && u.facility_name.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-8 h-8 text-indigo-600 animate-pulse mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading system administration console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-navy-900 tracking-tight">
                System Administration & Governance
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase">
                National Oversight
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Platform health monitoring, institutional licensing verification, user access control, and audit logs.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total System Users</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-navy-900 mt-2">
            {usersList.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Donors, facilities, and staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Facilities</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {overview?.facilitiesByVerification?.[0]?.count || 4}
          </div>
          <p className="text-xs text-slate-500 mt-1">Licensed hospital blood banks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Warnings</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {overview?.lowStockAlerts?.length || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Batches needing replenishment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Trail Events</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {overview?.recentLogs?.length || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Cryptographically logged events</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Using Real Database Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Blood Group Distribution Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-medical-600" />
                <span>Live National Blood Stock Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time units stored across network</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {overview?.inventoryByGroup?.map((item) => {
              const maxUnits = 70;
              const pct = Math.min(100, Math.round(((item.total_units || 0) / maxUnits) * 100));

              return (
                <div key={item.blood_group} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-navy-900 font-bold">{item.blood_group}</span>
                    <span className="text-medical-600 font-extrabold">{item.total_units} units</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-medical-500 to-rose-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Component Inventory & Request Status Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Blood Component Inventory Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution by component type</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {overview?.inventoryByComponent?.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block truncate">{comp.component_type}</span>
                  <span className="text-xl font-black text-navy-900 mt-1 block">{comp.total_units} units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Request Status Distribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {overview?.requestsByStatus?.map((st, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-medical-600"></span>
                  <span>{st.status}: {st.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>User & Facility Account Governance</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review registered users, manage access suspensions, and verify healthcare institution credentials.
            </p>
          </div>
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Profile Identity</th>
                <th className="p-3">Location</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-400 font-bold">{u.id}</td>
                  <td className="p-3 font-semibold text-navy-900">{u.email}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.role === 'admin' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : u.role === 'hospital' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium">
                    {u.donor_name ? (
                      <span>{u.donor_name} ({u.blood_group})</span>
                    ) : u.facility_name ? (
                      <span className="flex items-center gap-1">
                        <span>{u.facility_name}</span>
                        {u.is_verified ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" title="Verified" />
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-slate-400">System Admin</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{u.donor_city || u.facility_city || 'HQ'}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Trail Logs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <span>System Audit Ledger & Event Trail</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Action</th>
                <th className="p-3">Triggered By</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {overview?.recentLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{log.created_at}</td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{log.user_email || 'System Daemon'}</td>
                  <td className="p-3 text-slate-500">{log.entity_type} #{log.entity_id}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
