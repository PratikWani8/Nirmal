import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AqiBadge from '../components/common/AqiBadge';
import {
  CalendarCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check,
} from 'lucide-react';

export default function PlannerPage() {
  const { aqiData, weatherData, currentLocation } = useAqi();
  const { language, t } = useLanguage();

  const [routineData, setRoutineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState({});

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const res = await recommendationsAPI.getDaily({ lang: language });
      if (res.data?.success) {
        setRoutineData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load routine:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, [language, aqiData?.cpcbAqi]);

  const toggleComplete = (idx) => {
    setCompletedItems(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getPhaseIcon = (phase) => {
    if (phase === 'morning') return Coffee;
    if (phase === 'afternoon') return Sun;
    if (phase === 'evening') return Sunset;
    return Moon;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'critical') return 'bg-red-500/15 text-red-600 border-red-500/30';
    if (priority === 'high') return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
    return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            AI Personalized Daily Clean Air Routine
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Synchronized with real-time CPCB AQI ({aqiData?.cpcbAqi || 150}) and weather inversion dynamics for <strong>{currentLocation.city}</strong>.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={fetchRoutine}
          loading={loading}
          icon={Sparkles}
        >
          Regenerate Routine
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-forest-700/60 dark:text-forest-300/60 flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-forest-600 animate-spin" />
          Analyzing atmospheric profile & personal lifestyle for clean air scheduling...
        </div>
      ) : routineData ? (
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-forest-50/80 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-forest-700 dark:text-forest-300 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h3 className="font-bold text-forest-900 dark:text-white mb-0.5">
                {routineData.title}
              </h3>
              <p className="text-forest-800/80 dark:text-gray-300 leading-relaxed">
                {routineData.summary}
              </p>
            </div>
          </div>

          {/* Routine Steps */}
          <div className="space-y-3">
            {(routineData.routines || []).map((step, idx) => {
              const Icon = getPhaseIcon(step.phase);
              const isDone = Boolean(completedItems[idx]);

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-forest-50/40 dark:bg-forest-900/10 border-forest-100/50 dark:border-white/5 opacity-70'
                      : 'bg-white dark:bg-[#1D2421] border-forest-100 dark:border-white/10 shadow-soft'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-800/60 text-forest-800 dark:text-forest-200 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-forest-900 dark:text-white">
                            {step.title}
                          </span>
                          <span className="text-[10px] font-semibold text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/40 px-2 py-0.5 rounded-md border border-forest-100 dark:border-white/5">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {step.timeSlot}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(step.priority)}`}>
                            {step.priority} Priority
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-forest-800 dark:text-gray-200">
                          {step.action}
                        </p>

                        <p className="text-[11px] text-forest-700/80 dark:text-forest-300/80 leading-relaxed">
                          {step.explanation}
                        </p>

                        <div className="pt-2 flex items-center gap-3 text-[10px] text-forest-600/80 dark:text-forest-400/80">
                          <span>Why it matters: <strong>{step.whyItMatters}</strong></span>
                          {step.supportingMetric && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-forest-800 dark:text-white">Metric: {step.supportingMetric}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleComplete(idx)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-forest-800 text-white border-forest-800 dark:bg-forest-600'
                          : 'border-forest-200 dark:border-white/10 hover:border-forest-600'
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
