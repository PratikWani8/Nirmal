const axios = require('axios');

const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function calculateInversionRisk(temp, humidity, windSpeed) {
  let score = 0;
  // Low temperatures favor ground cooling & inversions
  if (temp < 15) score += 2;
  else if (temp < 22) score += 1;

  // High humidity traps moisture and particles
  if (humidity > 75) score += 2;
  else if (humidity > 60) score += 1;

  // Stagnant winds prevent particulate dispersion
  if (windSpeed < 5) score += 3;
  else if (windSpeed < 10) score += 2;
  else if (windSpeed < 18) score += 1;

  if (score >= 6) return { level: 'Extreme', explanation: 'Strong thermal inversion layer trapping particulate pollution near the surface. Minimal atmospheric dispersion.' };
  if (score >= 4) return { level: 'High', explanation: 'High stagnation and moisture promoting particulate accumulation and winter smog.' };
  if (score >= 2) return { level: 'Moderate', explanation: 'Moderate dispersion potential. Local emissions may pool in low-lying corridors.' };
  return { level: 'Low', explanation: 'Good atmospheric ventilation. Active winds facilitating pollutant dispersion.' };
}

async function fetchWeather(latitude, longitude) {
  const cacheKey = `${Number(latitude).toFixed(3)},${Number(longitude).toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { ...cached.data, isCached: true };
  }

  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'precipitation_probability'
    ].join(','),
    timezone: 'auto',
  };

  try {
    const response = await axios.get(url, { params, timeout: 6000 });
    const current = response.data.current || {};
    const temp = current.temperature_2m !== undefined ? current.temperature_2m : 22;
    const humidity = current.relative_humidity_2m !== undefined ? current.relative_humidity_2m : 55;
    const windSpeed = current.wind_speed_10m !== undefined ? current.wind_speed_10m : 8;
    const windDirection = current.wind_direction_10m !== undefined ? current.wind_direction_10m : 180;
    const pressure = current.surface_pressure !== undefined ? current.surface_pressure : 1013;
    const precipitation = current.precipitation !== undefined ? current.precipitation : 0;

    const inversionRisk = calculateInversionRisk(temp, humidity, windSpeed);

    const result = {
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      windDirection: Math.round(windDirection),
      surfacePressure: Math.round(pressure),
      precipitation,
      inversionRisk,
      recordedAt: current.time || new Date().toISOString(),
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    console.error('[Weather Service Error]:', error.message);
    if (cached) {
      return { ...cached.data, isStale: true };
    }
    // Return standard fallback if API fails
    return {
      temperature: 20,
      humidity: 60,
      windSpeed: 7,
      windDirection: 180,
      surfacePressure: 1012,
      precipitation: 0,
      inversionRisk: calculateInversionRisk(20, 60, 7),
      isFallback: true,
    };
  }
}

module.exports = {
  fetchWeather,
  calculateInversionRisk,
};
