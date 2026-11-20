const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['transit', 'indoor', 'community', 'carpool', 'energy'],
    default: 'transit',
  },
  points: {
    type: Number,
    default: 50,
  },
  badge: {
    type: String,
    default: 'Eco Commuter',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  durationDays: {
    type: Number,
    default: 7,
  },
  targetValue: {
    type: Number,
    default: 5,
  },
  targetUnit: {
    type: String,
    default: 'trips',
  },
  active: {
    type: Boolean,
    default: true,
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentProgress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('Challenge', challengeSchema);
