import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAqi } from '../context/AqiContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AqiGauge from '../components/dashboard/AqiGauge';
import PollutantCard from '../components/dashboard/PollutantCard';
import WeatherCard from '../components/dashboard/WeatherCard';
import HourlyTrendChart from '../components/dashboard/HourlyTrendChart';
import AqiBadge, { getAqiColor } from '../components/common/AqiBadge';
import {
  MapPin,
  CalendarCheck,
  TrendingUp,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { aqiData, weatherData, currentLocation, nearbyStations, loading } = useAqi();
  const { t } = useLanguage();

  const aqi = aqiData?.cpcbAqi || 165;
  const category = aqiData?.category || 'Moderate';
  const pollutants = aqiData?.pollutants || {};
  const subIndices = aqiData?.subIndices || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white">
              {currentLocation.city} Air Intelligence Dashboard
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>Coordinates: {currentLocation.coordinates?.[1]?.toFixed(4)}°N, {currentLocation.coordinates?.[0]?.toFixed(4)}°E</span>
            <span>·</span>
            <span>Standard: <strong>CPCB Indian NAQI</strong></span>
            <span>·</span>
            <span>Last Updated: {aqiData?.recordedAt ? new Date(aqiData.recordedAt).toLocaleTimeString() : 'Just now'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink to="/planner">
            <Button size="sm" variant="secondary" icon={CalendarCheck}>
              Daily Routine
            </Button>
          </NavLink>
          <NavLink to="/simulator">
            <Button size="sm" variant="primary" icon={Sliders}>
              What-If Simulator
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Primary KPI Row: Gauge + Health Advisory + Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CPCB AQI Gauge (4 cols) */}
        <div className="lg:col-span-4">
          <Card
            title="Real-Time CPCB AQI"
            subtitle="Central Pollution Control Board sub-index"
            className="h-full flex flex-col justify-between"
          >
            <AqiGauge
              aqi={aqi}
              category={category}
              primaryPollutant={aqiData?.primaryPollutant || 'PM2.5'}
            />

            <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 mt-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-forest-700/60 dark:text-forest-300/60 block">
                Official CPCB Health Statement
              </span>
              <p className="text-xs text-forest-800 dark:text-gray-200 leading-relaxed">
                {aqiData?.healthAdvice || 'Air quality is within acceptable bounds. Sensitive groups should monitor exertion.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Center: Meteorological Dispersion & Smog Inversion (4 cols) */}
        <div className="lg:col-span-4">
          <Card
            title="Atmospheric Dispersion Conditions"
            subtitle="Weather variables influencing ground stagnation"
            className="h-full"
          >
            <WeatherCard weather={weatherData || {}} />
          </Card>
        </div>

        {/* Right: GenAI Quick Environmental Routine (4 cols) */}
        <div className="lg:col-span-4">
          <Card
            title="AI Exposure Advisory"
            subtitle="Real-time lifestyle optimization"
            action={
              <NavLink to="/planner" className="text-xs font-semibold text-forest-700 dark:text-forest-300 hover:underline">
                View Full →
              </NavLink>
            }
            className="h-full flex flex-col justify-between"
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-forest-600 dark:text-forest-400">
                  Outdoor Cardio Recommendation
                </span>
                <p className="text-forest-800 dark:text-gray-200">
                  {aqi > 200
                    ? 'Avoid strenuous outdoor cardio. Nocturnal inversion keeps PM2.5 near ground level. Opt for indoor workouts.'
                    : 'Moderate outdoor activity is permissible. Prefer park corridors away from diesel traffic.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-forest-600 dark:text-forest-400">
                  Optimal Window Ventilation
                </span>
                <p className="text-forest-800 dark:text-gray-200">
                  Safest ventilation window: <strong>12:30 PM — 03:00 PM</strong> when solar heating lifts the planetary boundary layer.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-forest-600 dark:text-forest-400">
                  Respirator Recommendation
                </span>
                <p className="text-forest-800 dark:text-gray-200">
                  {aqi > 150 ? 'Wear a certified N95/FFP2 respirator when traversing busy arterial corridors.' : 'Cloth or surgical masks provide minimal particulate filtration.'}
                </p>
              </div>
            </div>

            <NavLink to="/assistant" className="mt-4 block">
              <Button variant="secondary" size="sm" className="w-full text-xs font-semibold" icon={Sparkles}>
                Ask Nirmal AI Assistant
              </Button>
            </NavLink>
          </Card>
        </div>
      </div>

      {/* Criteria Pollutants Breakout Grid (6 cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-forest-900 dark:text-white">
            Criteria Air Pollutants & CPCB Sub-Indices
          </h2>
          <span className="text-xs text-forest-700/60 dark:text-forest-300/60">
            Micrograms per cubic meter (µg/m³) · CO in mg/m³
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <PollutantCard
            code="pm25"
            concentration={pollutants.pm25}
            subIndex={subIndices.pm25}
          />
          <PollutantCard
            code="pm10"
            concentration={pollutants.pm10}
            subIndex={subIndices.pm10}
          />
          <PollutantCard
            code="no2"
            concentration={pollutants.no2}
            subIndex={subIndices.no2}
          />
          <PollutantCard
            code="so2"
            concentration={pollutants.so2}
            subIndex={subIndices.so2}
          />
          <PollutantCard
            code="co"
            concentration={pollutants.co}
            subIndex={subIndices.co}
          />
          <PollutantCard
            code="o3"
            concentration={pollutants.o3}
            subIndex={subIndices.o3}
          />
        </div>
      </section>

      {/* 24-Hour Diurnal Pollution Trends & Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diurnal Trend Chart (8 cols) */}
        <div className="lg:col-span-8">
          <Card
            title="Diurnal Air Quality Trajectory (Past 24h & Next 12h Forecast)"
            subtitle="Hourly particulate concentration fluctuation with CPCB safe boundary threshold."
          >
            <HourlyTrendChart data={aqiData?.hourlyTrend || []} />
          </Card>
        </div>

        {/* Nearby Monitoring Stations (4 cols) */}
        <div className="lg:col-span-4">
          <Card
            title="Local Monitoring Stations"
            subtitle="Continuous ambient air stations in vicinity"
            action={
              <NavLink to="/map" className="text-xs font-semibold text-forest-700 dark:text-forest-300 hover:underline">
                Map View →
              </NavLink>
            }
          >
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {nearbyStations.map((st) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-forest-900 dark:text-white truncate max-w-[150px]">
                      {st.name}
                    </p>
                    <span className="text-[10px] text-forest-600/70 dark:text-forest-400/70 block">
                      {st.stationType} · PM2.5: {st.pm25} µg/m³
                    </span>
                  </div>
                  <AqiBadge aqi={st.aqi} label={st.category} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
