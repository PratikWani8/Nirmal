const express = require('express');
const router = express.Router();
const {
  getCurrentAirQuality,
  getAirQualityHistory,
  getAirQualityForecast,
  getNearbyStations,
  searchLocation,
} = require('../controllers/aqiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/current', optionalAuth, getCurrentAirQuality);
router.get('/history', getAirQualityHistory);
router.get('/forecast', getAirQualityForecast);
router.get('/nearby', getNearbyStations);
router.get('/search', searchLocation);

module.exports = router;
