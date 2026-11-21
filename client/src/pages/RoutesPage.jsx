import React, { useState, useEffect } from 'react';
import { routesAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Navigation,
  Car,
  Bike,
  Footprints,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const PRESET_CORRIDORS = [
  {
    name: 'Connaught Place to Cyber City (Gurugram)',
    origin: [77.2197, 28.6328],
    destination: [77.0878, 28.4950],
  },
  {
    name: 'India Gate to Noida Sector 62',
    origin: [77.2295, 28.6129],
    destination: [77.3639, 28.6280],
  },
  {
    name: 'South Delhi (Saket) to Delhi Airport (T3)',
    origin: [77.2065, 28.5244],
    destination: [77.0850, 28.5562],
  },
];

export default function RoutesPage() {
  const { currentLocation, aqiData } = useAqi();

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [transportMode, setTransportMode] = useState('car');
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRouteComparison = async (corridorIdx, mode) => {
    setLoading(true);
    try {
      const corridor = PRESET_CORRIDORS[corridorIdx || selectedPreset];
      const res = await routesAPI.compare({
        origin: corridor.origin,
        destination: corridor.destination,
        transportMode: mode || transportMode,
      });
      if (res.data?.success) {
        setRouteResult(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to compare routes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteComparison(selectedPreset, transportMode);
  }, [selectedPreset, transportMode]);

  const highwayRoute = routeResult?.routes?.find(r => r.id === 'route_highway');
  const cleanRoute = routeResult?.routes?.find(r => r.id === 'route_clean');

  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
  const highwayPolyline = (highwayRoute?.coordinates || []).map(([lng, lat]) => [lat, lng]);
  const cleanPolyline = (cleanRoute?.coordinates || []).map(([lng, lat]) => [lat, lng]);

  const mapCenter = highwayPolyline[0] || [28.6139, 77.2090];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Pollution Escape Commute Navigator
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Compare peak arterial highway exposure against lower-exposure green buffer corridors.
          </p>
        </div>

        {/* Transport Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-forest-50 dark:bg-forest-900/40 border border-forest-100 dark:border-white/5">
          <button
            onClick={() => setTransportMode('car')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              transportMode === 'car'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Car / Taxi
          </button>
          <button
            onClick={() => setTransportMode('cycling')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              transportMode === 'cycling'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Bicycle
          </button>
          <button
            onClick={() => setTransportMode('walking')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              transportMode === 'walking'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Walking
          </button>
        </div>
      </div>

      {/* Preset Corridors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-forest-700/60 dark:text-forest-300/60 uppercase tracking-wider shrink-0 mr-1">
          Urban Corridors:
        </span>
        {PRESET_CORRIDORS.map((c, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPreset(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedPreset === idx
                ? 'bg-forest-800 text-white border-forest-800 dark:bg-forest-700'
                : 'bg-white dark:bg-[#1D2421] text-forest-900 dark:text-gray-300 border-forest-100 dark:border-white/10 hover:bg-forest-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Side-by-Side Route Comparison Cards */}
      {routeResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Fast Highway */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                {highwayRoute?.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                {highwayRoute?.tag}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-forest-100/60 dark:border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block">Distance</span>
                <strong className="text-forest-900 dark:text-white">{highwayRoute?.distanceKm} km</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Travel Time</span>
                <strong className="text-forest-900 dark:text-white">{highwayRoute?.durationMinutes} mins</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Inhaled Dose</span>
                <strong className="text-red-600">{highwayRoute?.estimatedInhaledDoseUg} µg</strong>
              </div>
            </div>

            <p className="text-xs text-forest-700/80 dark:text-forest-300/80 leading-relaxed">
              {highwayRoute?.description}
            </p>
          </div>

          {/* Option B: Clean Air Corridor */}
          <div className="p-5 rounded-2xl bg-forest-50/60 dark:bg-forest-900/30 border-2 border-forest-500 dark:border-forest-600 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {cleanRoute?.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {cleanRoute?.tag}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-forest-100 dark:border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block">Distance</span>
                <strong className="text-forest-900 dark:text-white">{cleanRoute?.distanceKm} km</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Travel Time</span>
                <strong className="text-forest-900 dark:text-white">{cleanRoute?.durationMinutes} mins</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Inhaled Dose</span>
                <strong className="text-emerald-600">{cleanRoute?.estimatedInhaledDoseUg} µg</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <TrendingDown className="w-4 h-4" />
              <span>{cleanRoute?.exposureComparison}</span>
            </div>

            <p className="text-xs text-forest-700/80 dark:text-forest-300/80 leading-relaxed">
              {cleanRoute?.description}
            </p>
          </div>
        </div>
      )}

      {/* Map Visualization of the Two Routes */}
      <div className="h-96 rounded-2xl overflow-hidden border border-forest-100 dark:border-white/10 shadow-soft">
        <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Red Highway Polyline */}
          {highwayPolyline.length > 0 && (
            <Polyline
              positions={highwayPolyline}
              pathOptions={{ color: '#EF4444', weight: 4, opacity: 0.8 }}
            />
          )}

          {/* Green Clean Corridor Polyline */}
          {cleanPolyline.length > 0 && (
            <Polyline
              positions={cleanPolyline}
              pathOptions={{ color: '#10B981', weight: 5, opacity: 0.9, dashArray: '6, 6' }}
            />
          )}

          {highwayPolyline[0] && (
            <Marker position={highwayPolyline[0]}>
              <Popup>Origin</Popup>
            </Marker>
          )}

          {highwayPolyline[highwayPolyline.length - 1] && (
            <Marker position={highwayPolyline[highwayPolyline.length - 1]}>
              <Popup>Destination</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Scientific Transparency Disclaimer */}
      <div className="p-4 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 flex items-start gap-2.5 text-xs text-forest-700/80 dark:text-forest-300/80">
        <Info className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
        <p leading-relaxed>
          {routeResult?.scientificDisclaimer || 'Route comparison calculations are approximations based on proximity buffers to major arterial links and minute ventilation rates.'}
        </p>
      </div>
    </div>
  );
}
