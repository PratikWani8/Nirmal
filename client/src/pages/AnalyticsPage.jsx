import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  BarChart3,
  Leaf,
  Wind,
  TrendingDown,
  Navigation,
  PlusCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Trip Logger Form State
  const [mode, setMode] = useState('metro_train');
  const [distanceKm, setDistanceKm] = useState(15);
  const [notes, setNotes] = useState('');
  const [loggingTrip, setLoggingTrip] = useState(false);
  const [tripSuccess, setTripSuccess] = useState(false);

  const fetchImpact = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getImpact();
      if (res.data?.success) {
        setImpactData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load impact analytics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  const handleLogTrip = async (e) => {
    e.preventDefault();
    setLoggingTrip(true);
    try {
      await analyticsAPI.logTrip({
        mode,
        distanceKm: Number(distanceKm),
        notes,
      });
      setTripSuccess(true);
      setTimeout(() => {
        setTripSuccess(false);
        fetchImpact();
      }, 1500);
    } catch (err) {
      alert('Please log in to track your personal impact.');
    } finally {
      setLoggingTrip(false);
    }
  };

  const summary = impactData?.summary || {
    totalCo2eAvoidedKg: 14.8,
    totalPm25AvoidedG: 3.9,
    totalTrips: 8,
    totalDistanceKm: 85,
    points: 120,
  };

  const weeklyProgression = impactData?.weeklyProgression || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Personal Environmental Impact Analytics
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Transparently quantifying your avoided greenhouse gases (CO2e) and avoided respirable particulate matter (PM2.5).
          </p>
        </div>

        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Eco Balance: {summary.points} Points
        </span>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Avoided CO2e */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
            GHG Climate Avoided
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.totalCo2eAvoidedKg} <span className="text-xs font-normal text-gray-500">kg CO2e</span>
          </div>
          <span className="text-[10px] text-gray-400 block">
            Tailpipe fuel combustion prevented
          </span>
        </div>

        {/* Avoided PM2.5 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
            Toxic PM2.5 Eliminated
          </span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {summary.totalPm25AvoidedG} <span className="text-xs font-normal text-gray-500">grams PM2.5</span>
          </div>
          <span className="text-[10px] text-gray-400 block">
            Fine soot prevented from neighborhood
          </span>
        </div>

        {/* Sustainable Trips */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
            Clean Commutes Logged
          </span>
          <div className="text-2xl font-black text-forest-900 dark:text-white">
            {summary.totalTrips} <span className="text-xs font-normal text-gray-500">trips</span>
          </div>
          <span className="text-[10px] text-gray-400 block">
            Total distance: {summary.totalDistanceKm} km
          </span>
        </div>

        {/* Eco Badges Earned */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
            Sustainability Level
          </span>
          <div className="text-2xl font-black text-amber-500">
            Tier II
          </div>
          <span className="text-[10px] text-gray-400 block">
            Metro Commuter · HEPA Shield
          </span>
        </div>
      </div>

      {/* Weekly Progress Chart + Trip Logging Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart (8 cols) */}
        <div className="lg:col-span-8">
          <Card
            title="Weekly Avoided Emissions Progression"
            subtitle="Comparing greenhouse gas savings (kg CO2e) with local particulate matter savings (g PM2.5)"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(221, 236, 227, 0.4)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5C9E87' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5C9E87' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="co2eKg" name="CO2e Avoided (kg)" fill="#214F40" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pm25Grams" name="PM2.5 Avoided (g)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Log Sustainable Trip (4 cols) */}
        <div className="lg:col-span-4">
          <Card
            title="Log Sustainable Trip"
            subtitle="Record your mass transit or cycling trip"
          >
            {tripSuccess ? (
              <div className="p-4 text-center text-emerald-600 text-xs font-semibold space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>Trip logged! +25 Eco-Points awarded.</p>
              </div>
            ) : (
              <form onSubmit={handleLogTrip} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                    Commute Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                  >
                    <option value="metro_train">Metro / Electric Train</option>
                    <option value="bus">Public Bus</option>
                    <option value="carpool">Carpool (3+ people)</option>
                    <option value="cycling">Cycling</option>
                    <option value="walking">Walking</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Office commute via Yellow Line"
                    className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                  />
                </div>

                <Button
                  type="submit"
                  loading={loggingTrip}
                  className="w-full font-bold mt-2"
                >
                  Log Clean Commute
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* Scientific Separation Callout */}
      <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 flex items-start gap-3 text-xs text-forest-700/80 dark:text-forest-300/80">
        <Info className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-forest-900 dark:text-white">
            Methodological Transparency: Climate vs Local Air Pollutants
          </p>
          <p className="leading-relaxed">
            Nirmal strictly separates climate-warming emissions (CO2 equivalent) from respirable toxic particulates (PM2.5). While CO2e operates on global decadal timescales, PM2.5 causes acute immediate inflammation of the respiratory tract. They are never conflated into an arbitrary single score.
          </p>
        </div>
      </div>
    </div>
  );
}
