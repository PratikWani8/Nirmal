import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  CloudRain,
} from 'lucide-react';

export default function WeatherCard({ weather = {} }) {
  const temp = weather.temperature ?? 22;
  const humidity = weather.humidity ?? 55;
  const windSpeed = weather.windSpeed ?? 8;
  const windDir = weather.windDirection ?? 180;
  const inversion = weather.inversionRisk || { level: 'Moderate', explanation: 'Moderate atmospheric dispersion.' };

  const getInversionColor = (level) => {
    if (level === 'Extreme') return 'bg-red-500/15 text-red-600 border-red-500/30';
    if (level === 'High') return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
    if (level === 'Moderate') return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Weather Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center shrink-0">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-forest-700/60 dark:text-forest-300/60 block">
              Temperature
            </span>
            <span className="text-lg font-bold text-forest-900 dark:text-white">
              {temp}°C
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-forest-700/60 dark:text-forest-300/60 block">
              Humidity
            </span>
            <span className="text-lg font-bold text-forest-900 dark:text-white">
              {humidity}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-forest-700/60 dark:text-forest-300/60 block">
              Wind Speed
            </span>
            <span className="text-lg font-bold text-forest-900 dark:text-white">
              {windSpeed} <span className="text-xs font-normal">km/h</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-forest-700/60 dark:text-forest-300/60 block">
              Wind Direction
            </span>
            <span className="text-lg font-bold text-forest-900 dark:text-white">
              {windDir}°
            </span>
          </div>
        </div>
      </div>

      {/* Smog Inversion Layer Risk Box */}
      <div className="p-3.5 rounded-xl border bg-forest-50/40 dark:bg-forest-900/10 border-forest-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-forest-900 dark:text-white flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Smog Inversion Risk
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getInversionColor(inversion.level)}`}>
            {inversion.level} Potential
          </span>
        </div>
        <p className="text-[11px] text-forest-700/70 dark:text-forest-300/70 leading-relaxed mt-1">
          {inversion.explanation}
        </p>
      </div>
    </div>
  );
}
