import React, { useState, useEffect } from 'react';
import { useAqi } from '../context/AqiContext';
import Card from '../components/common/Card';
import AirMap from '../components/maps/AirMap';
import AqiBadge, { getAqiColor } from '../components/common/AqiBadge';
import { communityAPI } from '../services/api';
import { MapPin, Layers, Radio, AlertTriangle } from 'lucide-react';

export default function MapPage() {
  const { currentLocation, aqiData, nearbyStations } = useAqi();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await communityAPI.getReports();
        if (res.data?.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load community reports for map:', err.message);
      }
    };
    fetchReports();
  }, []);

  const centerCoords = [
    currentLocation.coordinates?.[1] || 28.6139,
    currentLocation.coordinates?.[0] || 77.2090,
  ];

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Urban Air Quality Spatial Intelligence
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Real-time monitoring stations, spatial dispersion radius, and citizen pollution reports around <strong>{currentLocation.city}</strong>.
          </p>
        </div>

        <AqiBadge aqi={aqiData?.cpcbAqi || 150} label={aqiData?.category} size="lg" />
      </div>

      {/* Full Interactive Map Container */}
      <AirMap
        center={centerCoords}
        stations={nearbyStations}
        reports={reports}
        activeAqi={aqiData?.cpcbAqi || 150}
        zoom={12}
      />

      {/* Station List and Community Incident Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={`Active Monitoring Stations (${nearbyStations.length})`}
          subtitle="Real-time continuous ambient air quality stations"
        >
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {nearbyStations.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-forest-900 dark:text-white">
                    {st.name}
                  </p>
                  <span className="text-[10px] text-forest-600 dark:text-forest-400">
                    {st.stationType} · PM2.5: {st.pm25} µg/m³
                  </span>
                </div>
                <AqiBadge aqi={st.aqi} label={st.category} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={`Citizen Reported Incidents (${reports.length})`}
          subtitle="Community observed pollution hotspots"
        >
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div
                key={rep._id}
                className="p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                    {rep.category?.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-forest-900 dark:text-gray-200 mt-0.5 leading-snug">
                    {rep.description}
                  </p>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    {rep.location?.address}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 capitalize shrink-0">
                  {rep.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
