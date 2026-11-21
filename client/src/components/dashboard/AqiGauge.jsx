import React from 'react';
import { getAqiColor } from '../common/AqiBadge';

export default function AqiGauge({ aqi = 150, category = 'Moderate', primaryPollutant = 'PM2.5' }) {
  const clampedAqi = Math.max(0, Math.min(500, Number(aqi) || 0));
  const style = getAqiColor(clampedAqi);

  // Angle from -90 deg to +90 deg (180 degree semi-circle arc)
  const percent = clampedAqi / 500;
  const rotationDeg = -90 + (percent * 180);

  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      {/* Semi-circular gauge container */}
      <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
        {/* Background Arc */}
        <div className="absolute w-44 h-44 rounded-full border-[14px] border-[#DDECE3] dark:border-white/10 border-b-transparent border-l-transparent -rotate-45" />

        {/* Dynamic Colored Progress Arc Segments */}
        <div
          className="absolute w-44 h-44 rounded-full border-[14px] border-b-transparent border-l-transparent transition-all duration-700 ease-out"
          style={{
            borderColor: style.hex,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            transform: `rotate(${rotationDeg}deg)`,
          }}
        />

        {/* Center Readout */}
        <div className="relative z-10 flex flex-col items-center pb-2">
          <span className="text-4xl font-black tracking-tight text-forest-900 dark:text-white">
            {clampedAqi}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-600 dark:text-forest-400">
            CPCB NAQI
          </span>
        </div>
      </div>

      {/* Category Pill and Primary Pollutant */}
      <div className="mt-2 flex flex-col items-center gap-1">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: `${style.hex}18`,
            color: style.hex,
            borderColor: `${style.hex}40`,
          }}
        >
          {category}
        </span>
        <p className="text-xs text-forest-700/70 dark:text-forest-300/70 mt-1">
          Prominent Pollutant: <span className="font-semibold text-forest-900 dark:text-white">{primaryPollutant}</span>
        </p>
      </div>

      {/* Breakpoint Spectrum Indicators */}
      <div className="w-full grid grid-cols-6 gap-1 mt-4 pt-3 border-t border-forest-100/60 dark:border-white/5 text-[9px] font-medium text-forest-700/60 dark:text-forest-300/60">
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#10B981] mb-0.5" /> 0-50</div>
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#84CC16] mb-0.5" /> 51-100</div>
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#F59E0B] mb-0.5" /> 101-200</div>
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#F97316] mb-0.5" /> 201-300</div>
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#EF4444] mb-0.5" /> 301-400</div>
        <div className="text-center"><span className="inline-block w-2 h-1.5 rounded-xs bg-[#7F1D1D] mb-0.5" /> 401+</div>
      </div>
    </div>
  );
}
