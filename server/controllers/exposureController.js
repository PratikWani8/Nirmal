const { calculateDailyExposure } = require('../services/analytics/exposureCalculator');
const UserActivity = require('../models/UserActivity');
const { fetchAirQuality } = require('../services/airQuality/openMeteoService');

exports.calculate = async (req, res, next) => {
  try {
    const { activities, ambientPm25, indoorPm25 } = req.body;

    let baseOutdoorPm25 = ambientPm25;
    if (!baseOutdoorPm25) {
      const lat = req.user?.location?.coordinates?.[1] || 28.6139;
      const lng = req.user?.location?.coordinates?.[0] || 77.2090;
      try {
        const aq = await fetchAirQuality(lat, lng);
        baseOutdoorPm25 = aq.pollutants?.pm25 || 120;
      } catch (e) {
        baseOutdoorPm25 = 120;
      }
    }

    const exposureResult = calculateDailyExposure(activities, baseOutdoorPm25, indoorPm25 || 45);

    res.status(200).json({
      success: true,
      data: exposureResult,
    });
  } catch (err) {
    next(err);
  }
};

exports.logActivity = async (req, res, next) => {
  try {
    const { activityType, durationMinutes, intensity, location, ambientPm25 } = req.body;

    const rate = intensity === 'vigorous' ? 3.6 : intensity === 'moderate' ? 1.8 : 0.75;
    const durationHours = (durationMinutes || 30) / 60;
    const estimatedInhaledDoseUg = Math.round((ambientPm25 || 100) * durationHours * rate * 10) / 10;

    const activity = await UserActivity.create({
      userId: req.user.id,
      activityType,
      durationMinutes,
      intensity,
      location,
      ambientPm25: ambientPm25 || 100,
      estimatedInhaledDoseUg,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const activities = await UserActivity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (err) {
    next(err);
  }
};
