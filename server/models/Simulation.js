const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  scenarioName: {
    type: String,
    required: true,
  },
  isPreset: {
    type: Boolean,
    default: false,
  },
  location: {
    city: String,
    coordinates: [Number],
  },
  baseline: {
    aqi: Number,
    pm25: Number,
    pm10: Number,
    no2: Number,
    co: Number,
    so2: Number,
    sectorEmissionsPercent: {
      transport: { type: Number, default: 28 },
      constructionDust: { type: Number, default: 25 },
      wasteBurning: { type: Number, default: 17 },
      industryPower: { type: Number, default: 20 },
      domesticOthers: { type: Number, default: 10 },
    },
  },
  scenarioParameters: {
    vehicleReduction: { type: Number, min: 0, max: 100, default: 0 },
    publicTransportAdoption: { type: Number, min: 0, max: 100, default: 0 },
    carpoolingAdoption: { type: Number, min: 0, max: 100, default: 0 },
    constructionDustReduction: { type: Number, min: 0, max: 100, default: 0 },
    wasteBurningReduction: { type: Number, min: 0, max: 100, default: 0 },
    greenSpaceImprovement: { type: Number, min: 0, max: 100, default: 0 },
  },
  estimatedResults: {
    baselineEmissionsIndex: Number,
    scenarioEmissionsIndex: Number,
    emissionReductionPercent: Number,
    estimatedPm25ReductionPercent: Number,
    estimatedScenarioPm25: Number,
    estimatedScenarioAqi: Number,
    uncertaintyRange: {
      minPm25: Number,
      maxPm25: Number,
      confidenceScore: String, // 'High', 'Moderate', 'Exploratory'
    },
    sectorReductions: {
      transport: Number,
      constructionDust: Number,
      wasteBurning: Number,
      industryPower: Number,
      domesticOthers: Number,
    },
    environmentalBenefits: [String],
  },
  assumptions: [{ type: String }],
  aiExplanation: {
    summary: String,
    primaryContributor: String,
    keySensitivities: String,
    recommendations: [String],
  },
  aiActionPlan: {
    title: String,
    stakeholderActions: {
      individuals: [String],
      families: [String],
      schools: [String],
      housingSocieties: [String],
      businesses: [String],
      localAuthorities: [String],
    },
    timeline: String,
    measurableMetrics: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Simulation', simulationSchema);
