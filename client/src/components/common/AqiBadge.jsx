import React from 'react';

export const getAqiColor = (aqi) => {
  if (aqi <= 50) return { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/30', hex: '#10B981', label: 'Good' };
  if (aqi <= 100) return { bg: 'bg-[#84CC16]/15', text: 'text-[#65A30D]', border: 'border-[#84CC16]/30', hex: '#84CC16', label: 'Satisfactory' };
  if (aqi <= 200) return { bg: 'bg-[#F59E0B]/15', text: 'text-[#D97706]', border: 'border-[#F59E0B]/30', hex: '#F59E0B', label: 'Moderate' };
  if (aqi <= 300) return { bg: 'bg-[#F97316]/15', text: 'text-[#EA580C]', border: 'border-[#F97316]/30', hex: '#F97316', label: 'Poor' };
  if (aqi <= 400) return { bg: 'bg-[#EF4444]/15', text: 'text-[#DC2626]', border: 'border-[#EF4444]/30', hex: '#EF4444', label: 'Very Poor' };
  return { bg: 'bg-[#7F1D1D]/15', text: 'text-[#991B1B]', border: 'border-[#7F1D1D]/40', hex: '#7F1D1D', label: 'Severe' };
};

export default function AqiBadge({ aqi, label, size = 'md', showDot = true }) {
  const style = getAqiColor(aqi || 50);
  const displayLabel = label || style.label;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}>
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: style.hex }} />
      )}
      <span className="font-semibold">{aqi}</span>
      <span className="opacity-80">·</span>
      <span>{displayLabel}</span>
    </span>
  );
}
