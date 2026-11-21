import React from 'react';
import { getAqiColor } from '../common/AqiBadge';

const POLLUTANT_INFO = {
  pm25: {
    name: 'PM2.5 (Fine Particulates)',
    unit: 'µg/m³',
    standard: 'CPCB 24h limit: 60 µg/m³',
    desc: 'Combustion particles, organic compounds, and metals capable of penetrating deep into alveolar sacs and entering the bloodstream.',
  },
  pm10: {
    name: 'PM10 (Coarse Particulates)',
    unit: 'µg/m³',
    standard: 'CPCB 24h limit: 100 µg/m³',
    desc: 'Road dust, construction debris, and pollen that cause upper respiratory tract irritation and aggravated asthma.',
  },
  no2: {
    name: 'NO2 (Nitrogen Dioxide)',
    unit: 'µg/m³',
    standard: 'CPCB 24h limit: 80 µg/m³',
    desc: 'Formed from vehicular exhaust and power plants. Leads to airway inflammation, wheezing, and ground-level ozone formation.',
  },
  so2: {
    name: 'SO2 (Sulphur Dioxide)',
    unit: 'µg/m³',
    standard: 'CPCB 24h limit: 80 µg/m³',
    desc: 'Emitted from industrial coal combustion and diesel fuel. Irritates the mucous membranes of the eyes, nose, and throat.',
  },
  co: {
    name: 'CO (Carbon Monoxide)',
    unit: 'mg/m³',
    standard: 'CPCB 8h limit: 2 mg/m³',
    desc: 'Incomplete vehicular combustion gas that binds to hemoglobin, reducing oxygen carrying capacity in bodily organs.',
  },
  o3: {
    name: 'O3 (Ground-level Ozone)',
    unit: 'µg/m³',
    standard: 'CPCB 8h limit: 100 µg/m³',
    desc: 'Secondary summer oxidant formed when NOx and VOCs react in sunlight. Triggers chest tightness and reduced lung volume.',
  },
};

export default function PollutantCard({
  code = 'pm25',
  concentration = 0,
  subIndex = 0,
}) {
  const meta = POLLUTANT_INFO[code] || {
    name: code.toUpperCase(),
    unit: 'µg/m³',
    desc: 'Atmospheric pollutant',
    standard: '',
  };

  const style = getAqiColor(subIndex || 50);

  return (
    <div className="p-4 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100/70 dark:border-white/5 flex flex-col justify-between hover:border-forest-300 dark:hover:border-forest-700 transition">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-forest-200">
            {code === 'pm25' ? 'PM2.5' : code.toUpperCase()}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${style.hex}18`,
              color: style.hex,
              borderColor: `${style.hex}40`,
            }}
          >
            Sub-index: {subIndex || '--'}
          </span>
        </div>

        <p className="text-[11px] font-medium text-forest-700/70 dark:text-forest-300/70 truncate">
          {meta.name}
        </p>

        <div className="my-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black tracking-tight text-forest-900 dark:text-white">
            {concentration !== null && concentration !== undefined ? concentration : '--'}
          </span>
          <span className="text-xs font-semibold text-forest-600/80 dark:text-forest-400/80">
            {meta.unit}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-forest-100/60 dark:border-white/5">
        <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60 leading-relaxed line-clamp-2">
          {meta.desc}
        </p>
      </div>
    </div>
  );
}
