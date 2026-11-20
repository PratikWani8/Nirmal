const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'indoor', 'commute', 'smog_warning'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  whyItMatters: {
    type: String,
  },
  expectedImpact: {
    type: String,
  },
  timeSlot: {
    type: String, // e.g. "06:00 - 09:00"
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dismissed'],
    default: 'active',
  },
  supportingData: {
    pm25: Number,
    aqi: Number,
    windSpeed: Number,
    temperature: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
