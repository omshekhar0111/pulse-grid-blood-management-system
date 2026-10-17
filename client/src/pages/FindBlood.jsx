import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import BloodCompatibilityModal from '../components/BloodCompatibilityModal';
import { 
  Search, 
  Filter, 
  Droplet, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../utils/bloodData';

export default function FindBlood() {
  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get('group') || 'All';

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState(initialGroup);
  const [component, setComponent] = useState('All');
  const [status, setStatus] = useState('All');
  const [city, setCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory', {
        blood_group: bloodGroup,
        component,
        status,
        city,
        search: searchQuery
      });
      if (res.success) {
        setInventory(res.inventory);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [bloodGroup, component, status, city]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="medical-badge-avail">Available</span>;
      case 'Low Stock':
        return <span className="medical-badge-low">Low Stock</span>;
      case 'Expiring Soon':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">Expiring Soon</span>;
      case 'Expired':
        return <span className="medical-badge-out">Expired</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
            <Droplet className="w-3.5 h-3.5 fill-medical-600" />
            <span>Central Blood Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Find Blood & Components
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verified inventory across hospital blood centers and regional storage facilities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-medical-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Compatibility Guide</span>
          </button>
          <Link
            to="/request-blood"
            className="px-4 py-2 text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Submit Blood Request</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Hospital, batch or city..."
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

          {/* Component */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Component Type
            </label>
            <select
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="All">All Components</option>
              {BLOOD_COMPONENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Stock Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Expiring Soon">Expiring Soon</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>

        </form>
      </div>

      {/* Results List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-semibold">
            Found {inventory.length} verified blood inventory batches
          </p>
          <span className="text-[11px] text-slate-400">
            * Units are strictly verified under cold-chain standards
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Droplet className="w-8 h-8 text-medical-600 animate-bounce mx-auto mb-2" />
            <p className="text-xs text-slate-500">Querying real-time blood inventory records...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base">No Matching Inventory Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hospital or blood bank currently has stock matching your exact filter criteria.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => { setBloodGroup('All'); setComponent('All'); setStatus('All'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Reset All Filters
              </button>
              <Link
                to="/request-blood"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-medical-600 text-white hover:bg-medical-700"
              >
                Submit Direct Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between p-5"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-medical-600 font-black text-xl">
                        {item.blood_group}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-navy-900 leading-tight">
                          {item.component_type}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Batch: {item.batch_number}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Units Count Metric */}
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-navy-900 tracking-tight">
                        {item.units}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1.5">
                        Units Available
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Storage Temp</div>
                      <span className="font-mono text-slate-700 font-semibold">{item.storage_temp || '2-6°C'}</span>
                    </div>
                  </div>

                  {/* Facility Details */}
                  <div className="space-y-1.5 py-3 border-t border-slate-100 text-xs">
                    <div className="flex items-start gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800 leading-snug">{item.facility_name}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{item.address}, {item.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-medical-600 shrink-0" />
                      <span>{item.facility_phone}</span>
                    </div>
                  </div>

                  {/* Expiry & Dates */}
                  <div className="pt-2 pb-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Collected: {item.collection_date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-700 font-semibold">
                      <Clock className="w-3 h-3 text-medical-600" />
                      <span>Expires: {item.expiry_date}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="pt-4 border-t border-slate-100 mt-2 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    to={`/request-blood?blood_group=${encodeURIComponent(item.blood_group)}&component=${encodeURIComponent(item.component_type)}&facility_id=${item.facility_id}&hospital_name=${encodeURIComponent(item.facility_name)}`}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-medical-600 hover:bg-medical-700 rounded-xl shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <Droplet className="w-3 h-3 fill-white" />
                    <span>Request Units</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blood Compatibility Guide Modal */}
      <BloodCompatibilityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
}
