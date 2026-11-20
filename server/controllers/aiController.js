const { chatAssistant, explainSimulation, generateDailyRoutine } = require('../services/ai/aiService');
const { fetchAirQuality } = require('../services/airQuality/openMeteoService');
const { fetchWeather } = require('../services/weather/weatherService');

exports.chat = async (req, res, next) => {
  try {
    const { messages, language = 'en', coordinates } = req.body;

    const lat = coordinates?.[1] || req.user?.location?.coordinates?.[1] || 28.6139;
    const lng = coordinates?.[0] || req.user?.location?.coordinates?.[0] || 77.2090;

    let aqData = null;
    let weatherData = null;

    try {
      [aqData, weatherData] = await Promise.all([
        fetchAirQuality(lat, lng),
        fetchWeather(lat, lng),
      ]);
    } catch (e) {
      aqData = { cpcbAqi: 180, category: 'Moderate', pollutants: { pm25: 85 } };
      weatherData = { temperature: 22 };
    }

    const reply = await chatAssistant(
      messages || [{ content: 'Hello' }],
      req.user,
      aqData,
      weatherData,
      language
    );

    res.status(200).json({
      success: true,
      data: {
        message: reply,
        context: {
          aqi: aqData.cpcbAqi,
          category: aqData.category,
          pm25: aqData.pollutants?.pm25,
          temperature: weatherData.temperature,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.explain = async (req, res, next) => {
  try {
    const { simulationResult, language = 'en' } = req.body;
    const explanation = await explainSimulation(simulationResult, language);

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (err) {
    next(err);
  }
};
