const axios = require('axios');

const geoCache = new Map();

const CITY_PRESETS = [
  { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 },
  { city: 'Patna', state: 'Bihar', country: 'India', lat: 25.5941, lng: 85.1376 },
];

async function geocodeLocation(query) {
  if (!query || typeof query !== 'string') {
    return CITY_PRESETS[0];
  }

  const normalized = query.trim().toLowerCase();
  
  // Check presets first
  const matchPreset = CITY_PRESETS.find(p => 
    p.city.toLowerCase() === normalized || 
    `${p.city}, ${p.state}`.toLowerCase() === normalized
  );
  if (matchPreset) return matchPreset;

  if (geoCache.has(normalized)) {
    return geoCache.get(normalized);
  }

  try {
    const url = 'https://nominatim.openstreetmap.org/search';
    const response = await axios.get(url, {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'NirmalAirAssistant/1.0 (environmental-research-platform)',
      },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      const top = response.data[0];
      const address = top.address || {};
      const result = {
        city: address.city || address.town || address.village || address.suburb || top.name || query,
        state: address.state || address.region || '',
        country: address.country || 'India',
        displayName: top.display_name,
        lat: parseFloat(top.lat),
        lng: parseFloat(top.lon),
      };

      geoCache.set(normalized, result);
      return result;
    }
  } catch (error) {
    console.warn(`[Geocoding] Nominatim lookup failed for "${query}": ${error.message}`);
  }

  // Fallback to closest preset or Delhi default
  return CITY_PRESETS[0];
}

async function reverseGeocode(lat, lng) {
  const cacheKey = `${Number(lat).toFixed(3)},${Number(lng).toFixed(3)}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  try {
    const url = 'https://nominatim.openstreetmap.org/reverse';
    const response = await axios.get(url, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'NirmalAirAssistant/1.0 (environmental-research-platform)',
      },
      timeout: 5000,
    });

    if (response.data) {
      const address = response.data.address || {};
      const result = {
        city: address.city || address.town || address.county || address.state_district || 'Selected Location',
        state: address.state || '',
        country: address.country || 'India',
        displayName: response.data.display_name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      geoCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn(`[Reverse Geocoding] failed for [${lat}, ${lng}]: ${error.message}`);
  }

  return {
    city: 'Selected Location',
    state: '',
    country: 'India',
    displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    lat,
    lng,
  };
}

module.exports = {
  geocodeLocation,
  reverseGeocode,
  CITY_PRESETS,
};
