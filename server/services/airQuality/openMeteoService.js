const axios = require('axios');
const { calculateCpcbAqi } = require('./cpcbAqi');

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(lat, lng) {
  return `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
}

/**
 * Fetch Air Quality from Open-Meteo API
 */
async function fetchAirQuality(latitude, longitude) {
  const cacheKey = getCacheKey(latitude, longitude);
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { ...cached.data, isCached: true };
  }

  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const params = {
    latitude,
    longitude,
    current: [
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'european_aqi',
      'us_aqi'
    ].join(','),
    hourly: [
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'european_aqi',
      'us_aqi'
    ].join(','),
    past_days: 1,
    forecast_days: 7,
    timezone: 'auto',
  };

  try {
    const response = await axios.get(url, { params, timeout: 7000 });
    const data = response.data;

    const currentRaw = data.current || {};
    // Open-Meteo returns carbon_monoxide in ug/m3. Convert to mg/m3 for CPCB (divide by 1000)
    const coMgM3 = currentRaw.carbon_monoxide ? currentRaw.carbon_monoxide / 1000 : 0.8;

    const pollutants = {
      pm25: currentRaw.pm2_5 !== undefined ? Math.round(currentRaw.pm2_5 * 10) / 10 : null,
      pm10: currentRaw.pm10 !== undefined ? Math.round(currentRaw.pm10 * 10) / 10 : null,
      no2: currentRaw.nitrogen_dioxide !== undefined ? Math.round(currentRaw.nitrogen_dioxide * 10) / 10 : null,
      so2: currentRaw.sulphur_dioxide !== undefined ? Math.round(currentRaw.sulphur_dioxide * 10) / 10 : null,
      co: Math.round(coMgM3 * 100) / 100,
      o3: currentRaw.ozone !== undefined ? Math.round(currentRaw.ozone * 10) / 10 : null,
    };

    const cpcbResult = calculateCpcbAqi(pollutants);

    // Format hourly data (past 24 hours + next 48 hours)
    const hourlyTimes = data.hourly?.time || [];
    const hourlyPm25 = data.hourly?.pm2_5 || [];
    const hourlyPm10 = data.hourly?.pm10 || [];
    const hourlyNo2 = data.hourly?.nitrogen_dioxide || [];
    const hourlyEuropeanAqi = data.hourly?.european_aqi || [];
    const hourlyUsAqi = data.hourly?.us_aqi || [];

    const currentTimeIso = currentRaw.time || new Date().toISOString();
    const currentIndex = hourlyTimes.findIndex(t => t >= currentTimeIso);
    const startIdx = Math.max(0, currentIndex - 24);
    const endIdx = Math.min(hourlyTimes.length, currentIndex + 48);

    const hourlyTrend = [];
    for (let i = startIdx; i < endIdx; i++) {
      const p25 = hourlyPm25[i] || 0;
      const p10 = hourlyPm10[i] || 0;
      const no2Val = hourlyNo2[i] || 0;
      const cpcbCalc = calculateCpcbAqi({ pm25: p25, pm10: p10, no2: no2Val });

      hourlyTrend.push({
        time: hourlyTimes[i],
        pm25: p25,
        pm10: p10,
        no2: no2Val,
        cpcbAqi: cpcbCalc.aqi,
        europeanAqi: hourlyEuropeanAqi[i] || null,
        usAqi: hourlyUsAqi[i] || null,
        category: cpcbCalc.category,
      });
    }

    // Daily 7-day forecast aggregates
    const dailyForecast = [];
    const step = 24;
    for (let d = currentIndex; d < hourlyTimes.length; d += step) {
      const slicePm25 = hourlyPm25.slice(d, d + step).filter(v => v !== null);
      if (slicePm25.length === 0) continue;
      const avgPm25 = Math.round(slicePm25.reduce((a, b) => a + b, 0) / slicePm25.length);
      const maxPm25 = Math.round(Math.max(...slicePm25));
      const minPm25 = Math.round(Math.min(...slicePm25));
      const sliceCalc = calculateCpcbAqi({ pm25: avgPm25 });

      dailyForecast.push({
        date: hourlyTimes[d]?.split('T')[0],
        avgPm25,
        minPm25,
        maxPm25,
        estimatedAqi: sliceCalc.aqi,
        category: sliceCalc.category,
        color: sliceCalc.color,
      });
    }

    const result = {
      coordinates: [longitude, latitude],
      recordedAt: currentRaw.time || new Date().toISOString(),
      cpcbAqi: cpcbResult.aqi,
      category: cpcbResult.category,
      color: cpcbResult.color,
      healthAdvice: cpcbResult.healthAdvice,
      primaryPollutant: cpcbResult.primaryPollutant,
      subIndices: cpcbResult.subIndices,
      europeanAqi: currentRaw.european_aqi || null,
      usAqi: currentRaw.us_aqi || null,
      pollutants,
      hourlyTrend,
      dailyForecast,
      source: 'open-meteo',
      isLive: true,
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    console.error('[Open-Meteo AQI Service Error]:', error.message);
    if (cached) {
      return { ...cached.data, isStale: true, errorMessage: error.message };
    }
    throw new Error(`Air Quality API unavailable for [${latitude}, ${longitude}]: ${error.message}`);
  }
}

module.exports = {
  fetchAirQuality,
};
