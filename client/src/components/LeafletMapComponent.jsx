import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Droplet, 
  Search, 
  Building2, 
  Clock, 
  Compass,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Center: New Delhi medical corridor coordinates
const DEFAULT_CENTER = [28.6139, 77.2090];

// Custom Leaflet DivIcon Generators for healthcare pins
const createCustomIcon = (type = 'Blood Bank') => {
  const isBloodBank = type === 'Blood Bank';
  const isTrauma = type === 'Trauma Center';
  const color = isBloodBank ? '#dc2626' : (isTrauma ? '#4f46e5' : '#0f172a');
  const innerSymbol = isBloodBank ? '🩸' : (isTrauma ? '⚡' : '🏥');

  return L.divIcon({
    className: 'pulsegrid-map-pin',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg viewBox="0 0 24 32" width="38" height="48" style="position: absolute; top: 0; left: 0;">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
        </svg>
        <span style="position: relative; z-index: 2; margin-top: -12px; font-size: 14px;">${innerSymbol}</span>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -44],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'pulsegrid-user-pin',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(37,99,235,0.35);
        animation: pulse-ring 1.5s infinite;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export default function LeafletMapComponent({ facilities = [], initialSelectedId = null }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');

  // Handle initial selection
  useEffect(() => {
    if (initialSelectedId && facilities.length > 0) {
      const match = facilities.find(f => f.id === parseInt(initialSelectedId));
      if (match) setSelectedFacility(match);
    }
  }, [initialSelectedId, facilities]);

  // Calculate distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const matchesType = typeFilter === 'All' || f.facility_type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q);
      
      let matchesBlood = true;
      if (bloodFilter !== 'All') {
        matchesBlood = f.blood_stock && f.blood_stock.some(s => s.blood_group === bloodFilter && s.units > 0);
      }
      return matchesType && matchesSearch && matchesBlood;
    });
  }, [facilities, typeFilter, searchQuery, bloodFilter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      // OpenStreetMap Tiles (100% Free, no API keys, compliant with OpenStreetMap Foundation policy)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Pulse Grid'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when filtered facilities change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredFacilities.forEach(fac => {
      if (fac.latitude && fac.longitude) {
        const icon = createCustomIcon(fac.facility_type);
        const marker = L.marker([fac.latitude, fac.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            setSelectedFacility(fac);
            map.flyTo([fac.latitude, fac.longitude], 14, { duration: 0.8 });
          });

        // Popup Content
        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #1e293b; min-width: 180px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${fac.name}</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #dc2626; margin-bottom: 4px;">
              ${fac.facility_type} • Verified
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${fac.address}, ${fac.city}</div>
            <div style="font-weight: 700; color: #059669; font-size: 11px; margin-bottom: 6px;">
              Units Available: ${fac.total_units_available || 0}
            </div>
            <div style="display: flex; gap: 4px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}" 
                 target="_blank" rel="noopener noreferrer" 
                 style="display: inline-block; padding: 4px 8px; background: #dc2626; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 11px;">
                Get Directions
              </a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      }
    });

    // Fit bounds if facilities exist
    if (filteredFacilities.length > 0 && !selectedFacility && !userLocation) {
      const validPoints = filteredFacilities
        .filter(f => f.latitude && f.longitude)
        .map(f => [f.latitude, f.longitude]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [filteredFacilities]);

  // Pan to selected facility if changed externally
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedFacility && selectedFacility.latitude && selectedFacility.longitude) {
      map.flyTo([selectedFacility.latitude, selectedFacility.longitude], 14, { duration: 0.8 });
    }
  }, [selectedFacility]);

  // Handle GPS Geolocation with User Consent
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setLocatingUser(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setLocatingUser(false);
        setLocationNotice({ type: 'success', text: 'Your location was detected successfully.' });

        const map = mapInstanceRef.current;
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: createUserIcon() })
            .addTo(map)
            .bindPopup('<b>Your Current Location</b>')
            .openPopup();

          map.flyTo([coords.lat, coords.lng], 13, { duration: 1 });
        }
      },
      (err) => {
        setLocatingUser(false);
        if (err.code === 1) {
          setLocationNotice({
            type: 'warning',
            text: 'Location access was denied. You can manually search facilities by city or name above.'
          });
        } else {
          setLocationNotice({
            type: 'error',
            text: 'Unable to retrieve GPS coordinates. Using manual search fallback.'
          });
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm">
      
      {/* Left Filter & Facility List Sidebar */}
      <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
        
        {/* Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search facility name, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Facility Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="All">All Facilities</option>
                <option value="Blood Bank">Blood Banks</option>
                <option value="Hospital">Hospitals</option>
                <option value="Trauma Center">Trauma Centers</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Blood Stock
              </label>
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-rose-50 text-red-700 font-bold"
              >
                <option value="All">Any Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Location Detection Button */}
          <button
            onClick={handleDetectLocation}
            disabled={locatingUser}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
          >
            <Compass className={`w-4 h-4 text-red-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Requesting GPS access...' : 'Locate Facilities Near Me'}</span>
          </button>

          {locationNotice && (
            <div className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 ${
              locationNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : locationNotice.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locationNotice.text}</span>
            </div>
          )}
        </div>

        {/* Results Counter & OpenStreetMap Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>{filteredFacilities.length} centers found</span>
          <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>OpenStreetMap</span>
          </span>
        </div>

        {/* Facilities List Scrollable */}
        <div className="max-h-[380px] lg:max-h-[440px] overflow-y-auto space-y-2.5 pr-1">
          {filteredFacilities.map((fac) => {
            const isSelected = selectedFacility && selectedFacility.id === fac.id;
            let distanceStr = null;
            if (userLocation) {
              distanceStr = calculateDistance(userLocation.lat, userLocation.lng, fac.latitude, fac.longitude);
            }

            return (
              <div
                key={fac.id}
                onClick={() => {
                  setSelectedFacility(fac);
                  if (mapInstanceRef.current && fac.latitude && fac.longitude) {
                    mapInstanceRef.current.flyTo([fac.latitude, fac.longitude], 14, { duration: 0.8 });
                  }
                }}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                  isSelected
                    ? 'border-red-500 bg-red-50/50 shadow-sm ring-1 ring-red-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {fac.name}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    fac.facility_type === 'Blood Bank' 
                      ? 'bg-rose-100 text-rose-800' 
                      : fac.facility_type === 'Trauma Center'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {fac.facility_type}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{fac.address}, {fac.city}</span>
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-600 font-semibold">
                    <Droplet className="w-3.5 h-3.5 text-red-600" />
                    <span>{fac.total_units_available || 0} units</span>
                  </div>
                  {distanceStr && (
                    <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                      {distanceStr} km away
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredFacilities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No facilities match your search criteria.</p>
            </div>
          )}
        </div>

      </div>

      {/* Right Map Canvas & Details Overlay */}
      <div className="flex-1 flex flex-col relative min-h-[500px] rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Leaflet Map Div */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full min-h-[500px] z-0"
        />

        {/* Selected Facility Floating Bottom Card */}
        {selectedFacility && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl z-[1000] transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm md:text-base text-slate-900">{selectedFacility.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    Lic: {selectedFacility.license_no}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                  <span className="flex items-center gap-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>{selectedFacility.phone}</span>
                  </span>
                  <span className="flex items-center gap-1 text-red-700 font-bold">
                    <span>Emergency Hotline: {selectedFacility.emergency_hotline || '1066'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedFacility.operating_hours || '24/7 Service'}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-slate-900" />
                  <span>Directions</span>
                </a>
                <Link
                  to={`/request-blood?facility_id=${selectedFacility.id}&hospital_name=${encodeURIComponent(selectedFacility.name)}`}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5 fill-white" />
                  <span>Request Units</span>
                </Link>
              </div>

            </div>

            {/* Blood Stock Pills Preview */}
            {selectedFacility.blood_stock && selectedFacility.blood_stock.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Stock Units:
                </span>
                <div className="flex items-center gap-1.5">
                  {selectedFacility.blood_stock.map((stock, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        stock.units > 5 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {stock.blood_group}: {stock.units}u
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
