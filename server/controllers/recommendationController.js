const { generateDailyRoutine } = require('../services/ai/aiService');
const { fetchAirQuality } = require('../services/airQuality/openMeteoService');
const { fetchWeather } = require('../services/weather/weatherService');
const Recommendation = require('../models/Recommendation');

exports.getDaily = async (req, res, next) => {
  try {
    const lat = req.user?.location?.coordinates?.[1] || 28.6139;
    const lng = req.user?.location?.coordinates?.[0] || 77.2090;
    const language = req.query.lang || req.user?.preferredLanguage || 'en';

    const [aqData, weatherData] = await Promise.all([
      fetchAirQuality(lat, lng),
      fetchWeather(lat, lng),
    ]);

    const routine = await generateDailyRoutine(req.user, aqData, weatherData, language);

    res.status(200).json({
      success: true,
      data: routine,
      environmentalContext: {
        aqi: aqData.cpcbAqi,
        pm25: aqData.pollutants?.pm25,
        category: aqData.category,
        temperature: weatherData.temperature,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.generate = async (req, res, next) => {
  try {
    const { lat = 28.6139, lng = 77.2090, language = 'en', customLifestyle } = req.body;
    const userMock = req.user ? { ...req.user.toObject(), lifestyle: customLifestyle || req.user.lifestyle } : { lifestyle: customLifestyle || {}, preferredLanguage: language };

    const [aqData, weatherData] = await Promise.all([
      fetchAirQuality(lat, lng),
      fetchWeather(lat, lng),
    ]);

    const routine = await generateDailyRoutine(userMock, aqData, weatherData, language);

    res.status(200).json({
      success: true,
      data: routine,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Recommendation.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
