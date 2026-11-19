const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en',
  },
  location: {
    city: { type: String, default: 'New Delhi' },
    state: { type: String, default: 'Delhi' },
    country: { type: String, default: 'India' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.2090, 28.6139], // Delhi
    },
  },
  lifestyle: {
    wakeupTime: { type: String, default: '06:30' },
    workSchedule: { type: String, default: '09:00 - 18:00' },
    commuteMode: {
      type: String,
      enum: ['metro_train', 'bus', 'two_wheeler', 'car_single', 'carpool', 'cycling', 'walking', 'remote'],
      default: 'metro_train',
    },
    outdoorExercise: {
      type: String,
      enum: ['none', 'morning_walk', 'morning_run', 'evening_sports', 'gym_indoor'],
      default: 'morning_walk',
    },
    householdSize: { type: Number, default: 3 },
    indoorVentilation: {
      type: String,
      enum: ['closed_ac', 'cross_ventilation', 'natural_open', 'intermittent'],
      default: 'intermittent',
    },
    hasAirPurifier: { type: Boolean, default: false },
    cookingFuel: {
      type: String,
      enum: ['lpg', 'piped_gas', 'electric_induction', 'biomass_wood'],
      default: 'lpg',
    },
    sensitivities: [{
      type: String,
      enum: ['asthma', 'elderly', 'children', 'cardiac', 'pregnancy', 'allergies', 'none'],
    }],
    smokingOrIncenseExposure: { type: Boolean, default: false },
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    smogAlerts: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: true },
    communityAlerts: { type: Boolean, default: true },
  },
  points: { type: Number, default: 120 },
  badges: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
