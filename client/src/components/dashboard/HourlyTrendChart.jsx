import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export default function HourlyTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-forest-700/60 dark:text-forest-300/60">
        No hourly trend measurements available.
      </div>
    );
  }

  // Format data for display
  const chartData = data.slice(0, 36).map((item) => {
    const timeStr = item.time ? item.time.split('T')[1]?.slice(0, 5) : '--:--';
    return {
      time: timeStr,
      pm25: item.pm25 || 0,
      pm10: item.pm10 || 0,
      aqi: item.cpcbAqi || 0,
      category: item.category || 'Moderate',
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#214F40" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#214F40" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(221, 236, 227, 0.4)" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#5C9E87' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#5C9E87' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-card text-xs">
                    <p className="font-bold text-forest-900 dark:text-white mb-1">Time: {label}</p>
                    <p className="text-forest-700 dark:text-forest-300">
                      PM2.5: <span className="font-semibold">{p.pm25} µg/m³</span>
                    </p>
                    <p className="text-forest-700 dark:text-forest-300">
                      PM10: <span className="font-semibold">{p.pm10} µg/m³</span>
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      CPCB AQI: {p.aqi} ({p.category})
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* CPCB 24-hr PM2.5 limit reference line (60 ug/m3) */}
          <ReferenceLine
            y={60}
            stroke="#10B981"
            strokeDasharray="4 4"
            label={{ value: 'CPCB Limit: 60', fill: '#10B981', fontSize: 9, position: 'insideTopLeft' }}
          />

          <Area
            type="monotone"
            dataKey="pm25"
            stroke="#214F40"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#pm25Gradient)"
            name="PM2.5 Concentration"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
