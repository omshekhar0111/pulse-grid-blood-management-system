import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Droplet, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit, 
  Trash2,
  TrendingUp,
  FileText,
  ShieldCheck,
  Package
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/bloodData';

export default function HospitalDashboard() {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState(null);

  // Add Inventory Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    blood_group: 'O+',
    component_type: 'Packed Red Blood Cells',
    units: 10,
    collection_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
    batch_number: '',
    storage_temp: '2-6°C'
  });

  // Action message
  const [actionNotice, setActionNotice] = useState('');

  const loadData = async () => {
    try {
      const [invRes, reqRes, facRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/requests'),
        api.get('/facilities')
      ]);

      if (invRes.success) setInventory(invRes.inventory);
      if (reqRes.success) setRequests(reqRes.requests);
      if (facRes.success && facRes.facilities.length > 0) {
        // If logged in as specific facility, match; else default to first facility
        const myFac = user?.profile?.id 
          ? facRes.facilities.find(f => f.id === user.profile.id)
          : facRes.facilities[0];
        setFacility(myFac || facRes.facilities[0]);
      }
    } catch (err) {
      console.error('Hospital dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'hospital' && role !== 'admin') {
      navigate('/donor-dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, role]);

  // Handle Add Inventory Batch
  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBatch,
        facility_id: facility?.id
      };
      const res = await api.post('/inventory', payload);
      if (res.success) {
        setShowAddModal(false);
        setActionNotice('New blood inventory batch added successfully.');
        setTimeout(() => setActionNotice(''), 4000);
        loadData();
      }
    } catch (err) {
      alert('Failed to add batch: ' + err.message);
    }
  };

  // Handle Request Status Update (Approve, Fulfill with atomic deduction, Reject)
  const handleUpdateRequestStatus = async (requestId, newStatus, reason = '') => {
    try {
      const res = await api.patch(`/requests/${requestId}/status`, {
        status: newStatus,
        notes: reason || `Updated to ${newStatus} by ${facility?.name || 'Blood Bank desk'}`,
        facility_id: facility?.id
      });
      if (res.success) {
        setActionNotice(`Request ${newStatus} successfully! Inventory adjusted.`);
        setTimeout(() => setActionNotice(''), 4000);
        loadData();
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to discard or delete this inventory batch?')) return;
    try {
      const res = await api.delete(`/inventory/${batchId}`);
      if (res.success) {
        setActionNotice('Inventory batch discarded.');
        setTimeout(() => setActionNotice(''), 4000);
        loadData();
      }
    } catch (err) {
      alert('Failed to delete batch: ' + err.message);
    }
  };

  // Compute facility specific stats
  const facilityInventory = facility 
    ? inventory.filter(i => i.facility_id === facility.id) 
    : inventory;
  
  const totalUnits = facilityInventory.reduce((acc, curr) => acc + (curr.units || 0), 0);
  const lowStockBatches = facilityInventory.filter(i => i.status === 'Low Stock' || i.status === 'Expiring Soon');
  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Building2 className="w-8 h-8 text-medical-600 animate-pulse mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading facility dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-navy-900 tracking-tight">
                {facility?.name || 'Hospital Blood Bank Command Desk'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                {facility?.facility_type || 'Blood Bank'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              License: <span className="font-mono text-slate-700">{facility?.license_no}</span> • {facility?.address}, {facility?.city}
            </p>
          </div>
        </div>

        {/* Quick Add Batch Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-sm shadow-medical-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inventory Batch</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Recorded Units</span>
            <Droplet className="w-5 h-5 text-medical-600" />
          </div>
          <div className="text-3xl font-extrabold text-navy-900 mt-2">
            {totalUnits}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {facilityInventory.length} cold-chain batches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock / Expiring</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {lowStockBatches.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Batches needing replenishment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">
            {pendingRequests.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Require triage & fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Operating Status</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>24/7 Transfusion Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Cold chain verified</p>
        </div>
      </div>

      {/* Incoming Blood Requests Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-medical-600" />
              <span>Incoming Blood Requests</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, approve, and fulfill patient transfusion requests. Fulfilling atomically decrements local stock.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tracking Code</th>
                <th className="p-3">Patient & Hospital</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Units</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Required Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono font-bold text-navy-900">{r.request_code}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800">{r.patient_name}</span>
                    <span className="text-[11px] text-slate-400 block">{r.hospital_name}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-medical-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {r.blood_group} ({r.component_type})
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-navy-900">{r.units_required}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.priority === 'Critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.required_date}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.status === 'Fulfilled' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : r.status === 'Approved' 
                        ? 'bg-blue-100 text-blue-800'
                        : r.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {r.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'Under Review')}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-semibold"
                      >
                        Review
                      </button>
                    )}
                    {(r.status === 'Pending' || r.status === 'Under Review') && (
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'Approved')}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                      >
                        Approve & Reserve
                      </button>
                    )}
                    {r.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'Fulfilled', 'Dispatched and transfused safely.')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold shadow-sm"
                        title="Fulfill and atomically deduct stock"
                      >
                        Fulfill & Dispatch
                      </button>
                    )}
                    {r.status !== 'Fulfilled' && r.status !== 'Rejected' && (
                      <button
                        onClick={() => handleUpdateRequestStatus(r.id, 'Rejected', 'Insufficient matching stock.')}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blood Inventory Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-medical-600" />
              <span>Blood Component Inventory Batches</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current shelf stock with batch barcodes, storage temperatures, and expiry monitors.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Batch Number</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Component Type</th>
                <th className="p-3">Units In Stock</th>
                <th className="p-3">Storage Temp</th>
                <th className="p-3">Collection Date</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {facilityInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono font-bold text-navy-900">{item.batch_number}</td>
                  <td className="p-3">
                    <span className="font-extrabold text-medical-600 text-sm">{item.blood_group}</span>
                  </td>
                  <td className="p-3 font-semibold">{item.component_type}</td>
                  <td className="p-3 font-black text-navy-900 text-sm">{item.units} Units</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{item.storage_temp}</td>
                  <td className="p-3 text-slate-600">{item.collection_date}</td>
                  <td className="p-3 font-semibold text-rose-700">{item.expiry_date}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : item.status === 'Expiring Soon'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteBatch(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Discard batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BATCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-medical-600" />
                <span>Register New Blood Inventory Batch</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Blood Group</label>
                  <select
                    value={newBatch.blood_group}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, blood_group: e.target.value }))}
                    className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 bg-rose-50 text-medical-600"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Component Type</label>
                  <select
                    value={newBatch.component_type}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, component_type: e.target.value }))}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {BLOOD_COMPONENTS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Units (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newBatch.units}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, units: e.target.value }))}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Storage Temperature</label>
                  <input
                    type="text"
                    value={newBatch.storage_temp}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, storage_temp: e.target.value }))}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Collection Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.collection_date}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, collection_date: e.target.value }))}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiry_date}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Batch / Barcode Code (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={newBatch.batch_number}
                  onChange={(e) => setNewBatch(prev => ({ ...prev, batch_number: e.target.value }))}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 shadow-sm"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
