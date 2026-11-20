const test = require('node:test');
const assert = require('node:assert');
const { calculateDailyExposure, calculateAvoidedEmissions } = require('../services/analytics/exposureCalculator');

test('Exposure calculator distinguishes indoor and outdoor inhaled dose', (t) => {
  const result = calculateDailyExposure(null, 120, 40);
  assert.ok(result.totalDoseUg > 0);
  assert.ok(result.outdoorDoseUg > 0);
  assert.ok(result.indoorDoseUg > 0);
  assert.strictEqual(Math.round(result.totalDoseUg), Math.round(result.outdoorDoseUg + result.indoorDoseUg));
  assert.ok(result.disclaimer.includes('assessment metric'));
});

test('Avoided emissions calculates CO2e and PM2.5 reduction separately', (t) => {
  const trip = calculateAvoidedEmissions('metro_train', 20); // 20 km on metro
  assert.ok(trip.avoidedCo2eKg > 1.5, 'Should avoid >1.5 kg CO2e for 20km');
  assert.ok(trip.avoidedPm25Grams > 0.5, 'Should avoid grams of PM2.5 tailpipe emission');
});
