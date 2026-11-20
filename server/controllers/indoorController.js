const { analyzeIndoorAir } = require('../services/ai/aiService');
const { fetchAirQuality } = require('../services/airQuality/openMeteoService');

exports.analyze = async (req, res, next) => {
  try {
    const { roomData = {}, language = 'en' } = req.body;
    const lat = req.user?.location?.coordinates?.[1] || 28.6139;
    const lng = req.user?.location?.coordinates?.[0] || 77.2090;

    let aqData = null;
    try {
      aqData = await fetchAirQuality(lat, lng);
    } catch (e) {
      aqData = { pollutants: { pm25: 110 }, cpcbAqi: 240, category: 'Poor' };
    }

    const analysis = analyzeIndoorAir(roomData, aqData, language);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
};
