const { compareRoutes } = require('../services/routing/routeService');
const { fetchAirQuality } = require('../services/airQuality/openMeteoService');

exports.compare = async (req, res, next) => {
  try {
    const { origin, destination, transportMode = 'car' } = req.body;

    if (!origin || !destination || !Array.isArray(origin) || !Array.isArray(destination)) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination must be valid [lng, lat] coordinate pairs.',
      });
    }

    // Get current ambient PM2.5 at midpoint or origin
    let basePm25 = 115;
    try {
      const midLat = (origin[1] + destination[1]) / 2;
      const midLng = (origin[0] + destination[0]) / 2;
      const aq = await fetchAirQuality(midLat, midLng);
      basePm25 = aq.pollutants?.pm25 || 115;
    } catch (e) {
      // Use fallback basePm25
    }

    const routeComparison = await compareRoutes(origin, destination, transportMode, basePm25);

    res.status(200).json({
      success: true,
      data: routeComparison,
    });
  } catch (err) {
    next(err);
  }
};
