import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { Building2, MapPin, Phone, ShieldCheck, Compass, Info, Droplet } from 'lucide-react';

export default function BloodBanksMap() {
  const [searchParams] = useSearchParams();
  const initialFacilityId = searchParams.get('id');

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await api.get('/facilities');
        if (res.success) {
          setFacilities(res.facilities);
        }
      } catch (err) {
        console.error('Error loading facilities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Interactive Healthcare Geospatial Grid</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Blood Banks & Hospital Map
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Locate accredited blood centers, view available component inventory, and get turn-by-turn routing.
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Verified Medical Facilities Only</p>
          <p>
            All blood banks and hospital trauma centers shown on this map are verified medical institutions with licensed storage facilities compliant with cold-chain transfusion standards.
          </p>
        </div>
      </div>

      {/* Map Component */}
      <GoogleMapComponent 
        facilities={facilities} 
        initialSelectedId={initialFacilityId} 
      />

    </div>
  );
}
