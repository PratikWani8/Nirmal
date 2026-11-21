import React, { useState, useEffect } from 'react';
import { aqiAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import Card from '../components/common/Card';
import AqiBadge, { getAqiColor } from '../components/common/AqiBadge';
import HourlyTrendChart from '../components/dashboard/HourlyTrendChart';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  CloudRain,
  Wind,
  Thermometer,
  ShieldAlert,
} from 'lucide-react';

export default function ForecastPage() {
  const { currentLocation, aqiData, weatherData } = useAqi();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const [lng, lat] = currentLocation.coordinates || [77.2090, 28.6139];
        const res = await aqiAPI.getForecast({ lat, lng });
        if (res.data?.success) {
          setForecastData(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load forecast data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [currentLocation.coordinates]);

  const dailyList = aqiData?.dailyForecast || [];
  const inversion = weatherData?.inversionRisk || { level: 'Moderate', explanation: 'Moderate atmospheric dispersion.' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            7-Day Pollution & Smog Early Warning Forecast
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Atmospheric trajectory modeling combining Open-Meteo European/Copernicus data with CPCB breakpoint algorithms.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-forest-200 border border-forest-100 dark:border-white/5">
          Location: {currentLocation.city}
        </span>
      </div>

      {/* Smog Early Warning Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-amber-900 dark:text-amber-300">
              Winter Stagnation & Nocturnal Boundary Layer Warning
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase">
              {inversion.level} Risk
            </span>
          </div>
          <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            {inversion.explanation} Shallow planetary boundary layer heights between 10 PM and 8 AM concentrate localized combustion emissions. Expect peak particulate readings during early mornings.
          </p>
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-forest-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-forest-700 dark:text-forest-300" />
          7-Day Air Quality Outlook
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dailyList.map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const style = getAqiColor(day.estimatedAqi);

            return (
              <div
                key={day.date}
                className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col justify-between text-center space-y-2 hover:border-forest-300 dark:hover:border-forest-700 transition"
              >
                <div>
                  <span className="text-xs font-bold text-forest-900 dark:text-white block">
                    {dayName}
                  </span>
                  <span className="text-[10px] text-forest-700/60 dark:text-forest-300/60 block">
                    {dateFormatted}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-2xl font-black block" style={{ color: style.hex }}>
                    {day.estimatedAqi}
                  </span>
                  <span
                    className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1"
                    style={{
                      backgroundColor: `${style.hex}15`,
                      color: style.hex,
                      borderColor: `${style.hex}30`,
                    }}
                  >
                    {day.category}
                  </span>
                </div>

                <div className="pt-2 border-t border-forest-100/60 dark:border-white/5 text-[10px] text-forest-700/70 dark:text-forest-300/70">
                  PM2.5: <strong>{day.avgPm25}</strong> µg/m³
                  <div className="text-[9px] text-forest-600/60 dark:text-forest-400/60">
                    Range: {day.minPm25} - {day.maxPm25}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hourly Trajectory for Next 48 Hours */}
      <Card
        title="48-Hour High-Resolution Smog Prediction"
        subtitle="Expected hourly particulate dispersion curve based on forecast wind speed and temperature."
      >
        <HourlyTrendChart data={aqiData?.hourlyTrend || []} />
      </Card>
    </div>
  );
}
