const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  activityType: {
    type: String,
    enum: ['outdoor_run', 'walking', 'cycling', 'commute_car', 'commute_transit', 'indoor_office', 'indoor_home'],
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  intensity: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'vigorous'],
    default: 'moderate',
  },
  location: {
    name: String,
    coordinates: [Number],
  },
  ambientPm25: {
    type: Number, // ug/m3 during activity
  },
  estimatedInhaledDoseUg: {
    type: Number, // micrograms PM2.5 inhaled
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
