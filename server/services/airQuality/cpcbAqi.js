/**
 * Official Indian Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) Calculation
 * Reference: CPCB NAQI Report & Breakpoint System
 */

const BREAKPOINTS = {
  pm25: [
    { bLow: 0, bHigh: 30, iLow: 0, iHigh: 50 },
    { bLow: 31, bHigh: 60, iLow: 51, iHigh: 100 },
    { bLow: 61, bHigh: 90, iLow: 101, iHigh: 200 },
    { bLow: 91, bHigh: 120, iLow: 201, iHigh: 300 },
    { bLow: 121, bHigh: 250, iLow: 301, iHigh: 400 },
    { bLow: 251, bHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50 },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100 },
    { bLow: 101, bHigh: 250, iLow: 101, iHigh: 200 },
    { bLow: 251, bHigh: 350, iLow: 201, iHigh: 300 },
    { bLow: 351, bHigh: 430, iLow: 301, iHigh: 400 },
    { bLow: 431, bHigh: 600, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50 },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100 },
    { bLow: 81, bHigh: 180, iLow: 101, iHigh: 200 },
    { bLow: 181, bHigh: 280, iLow: 201, iHigh: 300 },
    { bLow: 281, bHigh: 400, iLow: 301, iHigh: 400 },
    { bLow: 401, bHigh: 800, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50 },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100 },
    { bLow: 81, bHigh: 380, iLow: 101, iHigh: 200 },
    { bLow: 381, bHigh: 800, iLow: 201, iHigh: 300 },
    { bLow: 801, bHigh: 1600, iLow: 301, iHigh: 400 },
    { bLow: 1601, bHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  co: [ // mg/m3
    { bLow: 0.0, bHigh: 1.0, iLow: 0, iHigh: 50 },
    { bLow: 1.1, bHigh: 2.0, iLow: 51, iHigh: 100 },
    { bLow: 2.1, bHigh: 10.0, iLow: 101, iHigh: 200 },
    { bLow: 10.1, bHigh: 17.0, iLow: 201, iHigh: 300 },
    { bLow: 17.1, bHigh: 34.0, iLow: 301, iHigh: 400 },
    { bLow: 34.1, bHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50 },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100 },
    { bLow: 101, bHigh: 168, iLow: 101, iHigh: 200 },
    { bLow: 169, bHigh: 208, iLow: 201, iHigh: 300 },
    { bLow: 209, bHigh: 748, iLow: 301, iHigh: 400 },
    { bLow: 749, bHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

function calculateSubIndex(pollutant, concentration) {
  if (concentration === null || concentration === undefined || isNaN(concentration) || concentration < 0) {
    return null;
  }

  const table = BREAKPOINTS[pollutant];
  if (!table) return null;

  // Handle value above max defined breakpoint by scaling up to 500
  const maxBracket = table[table.length - 1];
  if (concentration > maxBracket.bHigh) {
    return 500;
  }

  for (const bracket of table) {
    if (concentration >= bracket.bLow && concentration <= bracket.bHigh) {
      const { bLow, bHigh, iLow, iHigh } = bracket;
      const subIndex = ((iHigh - iLow) / (bHigh - bLow)) * (concentration - bLow) + iLow;
      return Math.round(subIndex);
    }
  }

  // Edge case for between-integer precision differences
  const lastBracket = table[table.length - 1];
  if (concentration >= lastBracket.bLow) {
    return Math.round(lastBracket.iHigh);
  }

  return 0;
}

function getAqiCategory(aqi) {
  if (aqi <= 50) return { category: 'Good', color: '#10B981', healthAdvice: 'Minimal impact. Air quality is considered satisfactory.' };
  if (aqi <= 100) return { category: 'Satisfactory', color: '#84CC16', healthAdvice: 'Minor breathing discomfort to sensitive people.' };
  if (aqi <= 200) return { category: 'Moderate', color: '#F59E0B', healthAdvice: 'Breathing discomfort to people with lungs, asthma and heart diseases.' };
  if (aqi <= 300) return { category: 'Poor', color: '#F97316', healthAdvice: 'Breathing discomfort to most people on prolonged exposure.' };
  if (aqi <= 400) return { category: 'Very Poor', color: '#EF4444', healthAdvice: 'Respiratory illness on prolonged exposure. Pronounced effect on people with lung/heart diseases.' };
  return { category: 'Severe', color: '#7F1D1D', healthAdvice: 'Affects healthy people and seriously impacts those with existing diseases. Stay indoors.' };
}

/**
 * Computes overall CPCB AQI from pollutant concentrations
 * @param {Object} pollutants - { pm25, pm10, no2, so2, co, o3 }
 * @returns {Object} { aqi, category, primaryPollutant, subIndices, color, healthAdvice }
 */
function calculateCpcbAqi(pollutants) {
  const subIndices = {};
  let maxSubIndex = 0;
  let primaryPollutant = 'PM2.5';

  const keys = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];
  for (const key of keys) {
    if (pollutants[key] !== undefined && pollutants[key] !== null) {
      const sub = calculateSubIndex(key, Number(pollutants[key]));
      subIndices[key] = sub;
      if (sub !== null && sub > maxSubIndex) {
        maxSubIndex = sub;
        primaryPollutant = key.toUpperCase();
        if (key === 'pm25') primaryPollutant = 'PM2.5';
      }
    }
  }

  // CPCB requirement: at least PM2.5 or PM10 must be available
  const hasParticulate = subIndices.pm25 !== null || subIndices.pm10 !== null;
  const aqi = hasParticulate ? Math.min(500, Math.max(1, maxSubIndex)) : (maxSubIndex || 50);
  const catInfo = getAqiCategory(aqi);

  return {
    aqi,
    category: catInfo.category,
    color: catInfo.color,
    healthAdvice: catInfo.healthAdvice,
    primaryPollutant,
    subIndices,
  };
}

module.exports = {
  calculateSubIndex,
  calculateCpcbAqi,
  getAqiCategory,
  BREAKPOINTS,
};
