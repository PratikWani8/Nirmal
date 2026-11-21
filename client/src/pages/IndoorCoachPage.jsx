import React, { useState, useEffect } from 'react';
import { indoorAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Home,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function IndoorCoachPage() {
  const { aqiData, currentLocation } = useAqi();
  const { language } = useLanguage();

  const [roomAreaSqFt, setRoomAreaSqFt] = useState(180);
  const [occupants, setOccupants] = useState(2);
  const [hasPurifier, setHasPurifier] = useState(true);
  const [purifierCadr, setPurifierCadr] = useState(260); // m3/h
  const [ventilationHabit, setVentilationHabit] = useState('intermittent');
  const [cookingFuel, setCookingFuel] = useState('lpg');
  const [hasSmokingOrIncense, setHasSmokingOrIncense] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await indoorAPI.analyze({
        roomData: {
          roomAreaSqFt,
          occupants,
          hasPurifier,
          purifierCadr: hasPurifier ? purifierCadr : 0,
          ventilationHabit,
          cookingFuel,
          hasSmokingOrIncense,
        },
        language,
      });
      if (res.data?.success) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to analyze indoor air:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [aqiData?.cpcbAqi, hasPurifier, purifierCadr, ventilationHabit, cookingFuel, hasSmokingOrIncense]);

  const score = analysis?.airScore || 72;
  const scoreColor = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Smart Indoor Air Coach & Ventilation Advisor
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Evaluate room infiltration, HEPA air changes per hour (ACH), and safe window opening windows for <strong>{currentLocation.city}</strong>.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-200 border border-forest-100 dark:border-white/5">
          Outdoor PM2.5: {aqiData?.pollutants?.pm25 || 95} µg/m³
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room & Device Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Room & Ventilation Profile"
            subtitle="Configure indoor parameters to evaluate filtration adequacy."
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                    Room Area (sq ft)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={roomAreaSqFt}
                    onChange={(e) => setRoomAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                    Occupants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={occupants}
                    onChange={(e) => setOccupants(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Air Purifier Toggle */}
              <div className="p-3.5 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-900 dark:text-white flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-forest-600" />
                    HEPA Air Purifier
                  </span>
                  <input
                    type="checkbox"
                    checked={hasPurifier}
                    onChange={(e) => setHasPurifier(e.target.checked)}
                    className="rounded text-forest-800"
                  />
                </div>

                {hasPurifier && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-forest-700 dark:text-forest-300">Clean Air Delivery Rate (CADR)</span>
                      <strong className="text-forest-900 dark:text-white">{purifierCadr} m³/h</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="600"
                      step="10"
                      value={purifierCadr}
                      onChange={(e) => setPurifierCadr(Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-800"
                    />
                  </div>
                )}
              </div>

              {/* Window Ventilation Habit */}
              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Window Opening Habit
                </label>
                <select
                  value={ventilationHabit}
                  onChange={(e) => setVentilationHabit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                >
                  <option value="intermittent">Intermittent (15-20 min bursts)</option>
                  <option value="closed_ac">Sealed / Closed AC</option>
                  <option value="open_all_day">Windows Open Continuously</option>
                </select>
              </div>

              {/* Cooking Fuel */}
              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Cooking Setup
                </label>
                <select
                  value={cookingFuel}
                  onChange={(e) => setCookingFuel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                >
                  <option value="lpg">LPG / Piped Gas with Exhaust</option>
                  <option value="electric_induction">Electric Induction</option>
                  <option value="biomass_wood">Biomass / Firewood</option>
                </select>
              </div>

              {/* Incense / Smoke */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-forest-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={hasSmokingOrIncense}
                  onChange={(e) => setHasSmokingOrIncense(e.target.checked)}
                  className="rounded text-forest-800"
                />
                Regular incense (agarbatti), dhoop, or indoor tobacco exposure
              </label>

              <Button
                variant="primary"
                size="sm"
                onClick={runAnalysis}
                loading={loading}
                className="w-full font-bold mt-2"
              >
                Re-calculate Indoor Air Score
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Air Quality Assessment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysis && (
            <>
              {/* Score and Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Indoor Air Quality Score
                  </span>
                  <div className={`text-4xl font-black my-1 ${scoreColor}`}>
                    {analysis.airScore}
                    <span className="text-xs text-gray-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] font-semibold text-forest-700 dark:text-forest-300">
                    Status: {analysis.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Estimated Indoor PM2.5
                  </span>
                  <div className="text-3xl font-black text-forest-900 dark:text-white my-1">
                    {analysis.estimatedIndoorPm25}
                    <span className="text-xs text-forest-600 font-normal"> µg/m³</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Outdoor is {analysis.outdoorPm25} µg/m³
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Purifier Air Changes (ACH)
                  </span>
                  <div className="text-3xl font-black text-forest-900 dark:text-white my-1">
                    {analysis.purifierAch}
                    <span className="text-xs text-forest-600 font-normal"> /hr</span>
                  </div>
                  <span className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                    Target: ≥ 4.0 ACH
                  </span>
                </div>
              </div>

              {/* Safe Ventilation Window Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block">
                      Recommended Midday Ventilation Window
                    </span>
                    <span className="text-emerald-900/80 dark:text-emerald-300/80">
                      Safest time for 15-20 min cross-ventilation: <strong>{analysis.safeVentilationWindow}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <Card
                title="Smart Indoor Action Items"
                subtitle="Practical steps to reduce respiratory exposure inside your living space."
              >
                <div className="space-y-2.5 text-xs">
                  {analysis.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-forest-900 dark:text-gray-200 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Houseplant Myth Buster Alert */}
              <div className="p-3.5 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 text-[11px] text-forest-700/80 dark:text-forest-300/80 space-y-1">
                <span className="font-bold text-forest-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-forest-600" />
                  Scientific Note on Houseplants
                </span>
                <p>
                  While indoor plants promote well-being and capture trace VOCs, peer-reviewed building physics demonstrates that houseplants cannot substitute for mechanical True HEPA filtration in capturing fine particulate matter (PM2.5).
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
