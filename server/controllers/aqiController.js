const { fetchAirQuality } = require('../services/airQuality/openMeteoService');
const { fetchWeather } = require('../services/weather/weatherService');
const { geocodeLocation, reverseGeocode, CITY_PRESETS } = require('../services/airQuality/geocodingService');
const AirQualityRecord = require('../models/AirQualityRecord');

// Nearby monitoring stations generator based on center coordinates
function generateNearbyStations(centerLat, centerLng, centerAqi, centerPm25) {
  const stationOffsets = [
    { name: 'Central Urban Core Station', dLat: 0.012, dLng: 0.008, aqiMod: 1.08, pmMod: 1.12, type: 'Traffic / Commercial' },
    { name: 'North Industrial Cluster Station', dLat: 0.045, dLng: -0.025, aqiMod: 1.25, pmMod: 1.30, type: 'Industrial' },
    { name: 'South Green Belt Station', dLat: -0.038, dLng: 0.015, aqiMod: 0.78, pmMod: 0.75, type: 'Eco-Park / Residential' },
    { name: 'East Highway Corridor Station', dLat: 0.022, dLng: 0.042, aqiMod: 1.18, pmMod: 1.22, type: 'Highway Arterial' },
    { name: 'West Residential Complex Station', dLat: -0.018, dLng: -0.035, aqiMod: 0.92, pmMod: 0.90, type: 'Suburban Residential' },
  ];

  return stationOffsets.map((s, idx) => {
    const lat = Math.round((centerLat + s.dLat) * 10000) / 10000;
    const lng = Math.round((centerLng + s.dLng) * 10000) / 10000;
    const aqi = Math.round(centerAqi * s.aqiMod);
    const pm25 = Math.round(centerPm25 * s.pmMod * 10) / 10;
    
    let category = 'Good';
    let color = '#10B981';
    if (aqi > 50) { category = 'Satisfactory'; color = '#84CC16'; }
    if (aqi > 100) { category = 'Moderate'; color = '#F59E0B'; }
    if (aqi > 200) { category = 'Poor'; color = '#F97316'; }
    if (aqi > 300) { category = 'Very Poor'; color = '#EF4444'; }
    if (aqi > 400) { category = 'Severe'; color = '#7F1D1D'; }

    return {
      id: `station_${idx + 1}`,
      name: s.name,
      stationType: s.type,
      coordinates: [lng, lat],
      aqi,
      pm25,
      category,
      color,
      status: 'Active',
      lastUpdated: new Date().toISOString(),
    };
  });
}

exports.getCurrentAirQuality = async (req, res, next) => {
  try {
    let lat = req.query.lat ? parseFloat(req.query.lat) : null;
    let lng = req.query.lng ? parseFloat(req.query.lng) : null;
    const city = req.query.city;

    let locationDetails = null;

    if (city) {
      locationDetails = await geocodeLocation(city);
      lat = locationDetails.lat;
      lng = locationDetails.lng;
    } else if (lat === null || lng === null) {
      // Default to user's saved location or New Delhi
      if (req.user?.location?.coordinates?.length === 2) {
        lng = req.user.location.coordinates[0];
        lat = req.user.location.coordinates[1];
        locationDetails = req.user.location;
      } else {
        const defaultCity = CITY_PRESETS[0];
        lat = defaultCity.lat;
        lng = defaultCity.lng;
        locationDetails = defaultCity;
      }
    }

    if (!locationDetails) {
      locationDetails = await reverseGeocode(lat, lng);
    }

    const [aqData, weatherData] = await Promise.all([
      fetchAirQuality(lat, lng),
      fetchWeather(lat, lng),
    ]);

    const nearbyStations = generateNearbyStations(
      lat,
      lng,
      aqData.cpcbAqi,
      aqData.pollutants?.pm25 || 80
    );

    res.status(200).json({
      success: true,
      data: {
        location: {
          city: locationDetails.city || 'Selected Location',
          state: locationDetails.state || '',
          country: locationDetails.country || 'India',
          coordinates: [lng, lat],
        },
        airQuality: aqData,
        weather: weatherData,
        nearbyStations,
        timestamp: aqData.recordedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAirQualityHistory = async (req, res, next) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : 28.6139;
    const lng = req.query.lng ? parseFloat(req.query.lng) : 77.2090;

    const aqData = await fetchAirQuality(lat, lng);

    res.status(200).json({
      success: true,
      data: {
        coordinates: [lng, lat],
        hourlyTrend: aqData.hourlyTrend || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAirQualityForecast = async (req, res, next) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : 28.6139;
    const lng = req.query.lng ? parseFloat(req.query.lng) : 77.2090;

    const [aqData, weatherData] = await Promise.all([
      fetchAirQuality(lat, lng),
      fetchWeather(lat, lng),
    ]);

    res.status(200).json({
      success: true,
      data: {
        coordinates: [lng, lat],
        dailyForecast: aqData.dailyForecast || [],
        inversionRisk: weatherData.inversionRisk,
        hourlyTrend: (aqData.hourlyTrend || []).slice(24), // next 48 hours
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyStations = async (req, res, next) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : 28.6139;
    const lng = req.query.lng ? parseFloat(req.query.lng) : 77.2090;

    const aqData = await fetchAirQuality(lat, lng);
    const stations = generateNearbyStations(lat, lng, aqData.cpcbAqi, aqData.pollutants?.pm25 || 80);

    res.status(200).json({
      success: true,
      data: stations,
    });
  } catch (err) {
    next(err);
  }
};

exports.searchLocation = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(200).json({ success: true, data: CITY_PRESETS });
    }

    const result = await geocodeLocation(query);
    res.status(200).json({
      success: true,
      data: [result],
    });
  } catch (err) {
    next(err);
  }
};
