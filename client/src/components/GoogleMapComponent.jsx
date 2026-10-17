import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Droplet, 
  Filter, 
  Search, 
  Building2,
  Clock,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  minHeight: '520px',
  borderRadius: '0.75rem',
};

// Default center: New Delhi medical corridor
const DEFAULT_CENTER = {
  lat: 28.5800,
  lng: 77.2400,
};

// Subtle light healthcare theme for Google Maps
const LIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
  { featureType: "poi.medical", elementType: "geometry", stylers: [{ color: "#fee2e2" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fde8e8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] }
];

export default function GoogleMapComponent({ facilities = [], onSelectFacility, initialSelectedId = null }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState(null);
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

  // Calculate distance in km between two lat/lng pairs
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      const matchesType = typeFilter === 'All' || f.facility_type === typeFilter;
      const matchesSearch = 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesBlood = true;
      if (bloodFilter !== 'All') {
        matchesBlood = f.blood_stock && f.blood_stock.some(s => s.blood_group === bloodFilter && s.units > 0);
      }
      return matchesType && matchesSearch && matchesBlood;
    });
  }, [facilities, typeFilter, searchQuery, bloodFilter]);

  // Current Location Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setLocatingUser(false);
        if (map) {
          map.panTo(coords);
          map.setZoom(13);
        }
      },
      (err) => {
        setLocatingUser(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Please allow location access in your browser settings.');
        } else {
          setLocationError('Unable to retrieve your current location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // SVG Pin Icons for Google Maps Markers
  const getMarkerIcon = (type) => {
    const isBloodBank = type === 'Blood Bank';
    const color = isBloodBank ? '%23e11d48' : '%23102a43'; // Medical Red vs Navy
    return {
      url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 24 30"><path fill="${color}" stroke="%23ffffff" stroke-width="1.5" d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12zm0 16a4 4 0 110-8 4 4 0 010 8z"/><circle cx="12" cy="12" r="3" fill="%23ffffff"/></svg>`,
      scaledSize: window.google ? new window.google.maps.Size(34, 42) : null,
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Left Filter & Facility List Sidebar */}
      <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
        
        {/* Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search facility name, area, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Facility Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
              >
                <option value="All">All Facilities</option>
                <option value="Blood Bank">Blood Banks</option>
                <option value="Hospital">Hospitals</option>
                <option value="Trauma Center">Trauma Centers</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Blood Group Filter
              </label>
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
              >
                <option value="All">Any Blood Group</option>
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-navy-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
          >
            <Compass className={`w-4 h-4 text-medical-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Detecting your GPS location...' : 'Find Facilities Near Me'}</span>
          </button>

          {locationError && (
            <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing {filteredFacilities.length} verified centers</span>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            ● GPS Verified
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
                  if (onSelectFacility) onSelectFacility(fac);
                  if (map) {
                    map.panTo({ lat: fac.latitude, lng: fac.longitude });
                    map.setZoom(14);
                  }
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? 'border-medical-500 bg-rose-50/40 shadow-sm ring-1 ring-medical-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-navy-900 leading-snug">
                    {fac.name}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    fac.facility_type === 'Blood Bank' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {fac.facility_type}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{fac.address}, {fac.city}</span>
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Droplet className="w-3.5 h-3.5 text-medical-600" />
                    <span>{fac.total_units_available || 0} units available</span>
                  </div>
                  {distanceStr && (
                    <span className="text-[11px] font-semibold text-medical-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      {distanceStr} km away
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredFacilities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No facilities match your search criteria.</p>
            </div>
          )}
        </div>

      </div>

      {/* Right Map Canvas & Details Overlay */}
      <div className="flex-1 flex flex-col relative min-h-[500px] rounded-xl overflow-hidden border border-slate-200">
        
        {/* Real Google Maps JavaScript API Rendering */}
        {isLoaded && !loadError ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={
              selectedFacility 
                ? { lat: selectedFacility.latitude, lng: selectedFacility.longitude }
                : (userLocation || DEFAULT_CENTER)
            }
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: LIGHT_MAP_STYLES,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User GPS Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Your Current Location"
                icon={{
                  path: window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
                  scale: 8,
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Verified Facilities Markers */}
            {filteredFacilities.map((fac) => (
              <Marker
                key={fac.id}
                position={{ lat: fac.latitude, lng: fac.longitude }}
                title={fac.name}
                icon={getMarkerIcon(fac.facility_type)}
                onClick={() => setSelectedFacility(fac)}
              />
            ))}

            {/* Info Window for Selected Marker */}
            {selectedFacility && (
              <InfoWindow
                position={{ lat: selectedFacility.latitude, lng: selectedFacility.longitude }}
                onCloseClick={() => setSelectedFacility(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                    <span>{selectedFacility.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{selectedFacility.address}</p>
                  <div className="mt-2 text-[11px] font-semibold text-medical-600">
                    Units available: {selectedFacility.total_units_available || 0}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-white bg-medical-600 px-2 py-1 rounded inline-flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          /* Graceful Interactive Fallback if Google Maps API key has domain restriction or offline */
          <div className="w-full h-full min-h-[500px] bg-slate-100 flex flex-col items-center justify-center p-6 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-medical-600 mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-navy-900 mb-1">Interactive Facility Map</h4>
            <p className="text-sm text-slate-500 max-w-md mb-4">
              {loadError 
                ? `Google Maps API notice: ${loadError.message}. Verified facility coordinates and routing links remain fully functional below.`
                : 'Connecting to Google Maps JavaScript service...'}
            </p>

            {/* Interactive Grid of Facilities in Fallback */}
            <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {filteredFacilities.map(fac => (
                <div 
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-medical-500 cursor-pointer shadow-sm"
                >
                  <div className="font-semibold text-xs text-navy-900">{fac.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{fac.city} ({fac.facility_type})</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-medical-600">{fac.total_units_available || 0} units</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Facility Bottom Details Panel */}
        {selectedFacility && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl z-10 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm md:text-base text-navy-900">{selectedFacility.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Lic: {selectedFacility.license_no}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-medical-600" />
                    <span>{selectedFacility.phone}</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 font-semibold">
                    <span>Emergency Hotline: {selectedFacility.emergency_hotline || '1066'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedFacility.operating_hours || '24/7 Service'}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-navy-900" />
                  <span>Open Directions</span>
                </a>
                <Link
                  to={`/request-blood?facility_id=${selectedFacility.id}&hospital_name=${encodeURIComponent(selectedFacility.name)}`}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-white bg-medical-600 hover:bg-medical-700 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5 fill-white" />
                  <span>Request from Here</span>
                </Link>
              </div>

            </div>

            {/* Blood Stock Pills Preview */}
            {selectedFacility.blood_stock && selectedFacility.blood_stock.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Stock Units:
                </span>
                <div className="flex items-center gap-1.5">
                  {selectedFacility.blood_stock.map((stock, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
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
