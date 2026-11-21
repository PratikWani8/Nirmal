import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { getAqiColor } from '../common/AqiBadge';
import { Layers, MapPin, AlertCircle, Info } from 'lucide-react';

// Fix for default Leaflet icon paths in React Vite
const customIcon = (color, text) => L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="background-color: ${color}; color: white; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
      ${text}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function AirMap({
  center = [28.6139, 77.2090], // [lat, lng]
  zoom = 12,
  stations = [],
  reports = [],
  activeAqi = 150,
}) {
  const [showStations, setShowStations] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRadius, setShowRadius] = useState(true);

  const centerStyle = getAqiColor(activeAqi);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-forest-100 dark:border-white/10 shadow-soft">
      {/* Map Layer Filter Bar */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-[#1D2421]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-forest-100 dark:border-white/10 shadow-card flex items-center gap-3 text-xs">
        <span className="font-semibold text-forest-900 dark:text-white flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-forest-700 dark:text-forest-300" />
          Map Layers
        </span>

        <label className="flex items-center gap-1.5 cursor-pointer text-forest-800 dark:text-forest-200">
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="rounded text-forest-700"
          />
          Stations ({stations.length})
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-forest-800 dark:text-forest-200">
          <input
            type="checkbox"
            checked={showReports}
            onChange={(e) => setShowReports(e.target.checked)}
            className="rounded text-forest-700"
          />
          Reports ({reports.length})
        </label>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected / User Location Center Marker */}
        <Marker position={center} icon={customIcon(centerStyle.hex, activeAqi)}>
          <Popup>
            <div className="p-1 text-xs">
              <p className="font-bold text-forest-900 text-sm">Selected Location</p>
              <p className="text-forest-700 mt-0.5">CPCB AQI: <strong style={{ color: centerStyle.hex }}>{activeAqi} ({centerStyle.label})</strong></p>
              <p className="text-[10px] text-gray-500 mt-1">Coordinates: {center[0].toFixed(4)}, {center[1].toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>

        {showRadius && (
          <Circle
            center={center}
            radius={3500}
            pathOptions={{
              color: centerStyle.hex,
              fillColor: centerStyle.hex,
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        )}

        {/* Monitoring Stations */}
        {showStations && stations.map((st) => {
          const lat = st.coordinates?.[1];
          const lng = st.coordinates?.[0];
          if (!lat || !lng) return null;
          const stStyle = getAqiColor(st.aqi || 120);

          return (
            <Marker
              key={st.id || `${lat}-${lng}`}
              position={[lat, lng]}
              icon={customIcon(stStyle.hex, st.aqi || '--')}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">{st.stationType || 'Monitoring Station'}</span>
                  <p className="font-bold text-forest-900">{st.name}</p>
                  <p className="mt-1">AQI: <strong style={{ color: stStyle.hex }}>{st.aqi} ({st.category})</strong></p>
                  <p>PM2.5: <strong>{st.pm25} µg/m³</strong></p>
                  <span className="text-[9px] text-emerald-600 block mt-1">Status: Verified Station</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Community Incident Reports */}
        {showReports && reports.map((rep) => {
          const lat = rep.location?.coordinates?.[1];
          const lng = rep.location?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={rep._id || `${lat}-${lng}`}
              position={[lat, lng]}
              icon={customIcon('#DC2626', '!')}
            >
              <Popup>
                <div className="p-1 text-xs max-w-[200px]">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide block">
                    Citizen Incident Report
                  </span>
                  <p className="font-bold text-forest-900 capitalize mt-0.5">
                    {rep.category?.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-gray-700 leading-snug mt-1">
                    {rep.description}
                  </p>
                  <div className="mt-2 pt-1 border-t flex items-center justify-between text-[10px]">
                    <span className="capitalize font-semibold text-amber-600">
                      Status: {rep.verificationStatus}
                    </span>
                    <span className="text-gray-500">
                      Upvotes: {rep.upvotes || 0}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend Card */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#1D2421]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-forest-100 dark:border-white/10 shadow-card text-[10px]">
        <span className="font-bold text-forest-900 dark:text-white block mb-1.5">
          CPCB Indian NAQI Standard
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> 0-50 Good</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#84CC16]" /> 51-100 Satisfactory</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 101-200 Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> 201-300 Poor</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> 301-400 Very Poor</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#7F1D1D]" /> 401+ Severe</span>
        </div>
      </div>
    </div>
  );
}
