const mongoose = require('mongoose');

const userImpactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  transportEmissionAvoidedKgCO2: {
    type: Number,
    default: 0,
  },
  particulateAvoidedGramsPM25: {
    type: Number,
    default: 0,
  },
  no2AvoidedGrams: {
    type: Number,
    default: 0,
  },
  sustainableTripsCount: {
    type: Number,
    default: 0,
  },
  commuteModeUsed: {
    type: String,
  },
  distanceKm: {
    type: Number,
    default: 0,
  },
  completedChallenges: [{
    type: String,
  }],
  notes: String,
});

module.exports = mongoose.model('UserImpact', userImpactSchema);
