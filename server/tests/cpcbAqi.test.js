const test = require('node:test');
const assert = require('node:assert');
const { calculateSubIndex, calculateCpcbAqi, getAqiCategory } = require('../services/airQuality/cpcbAqi');

test('CPCB Sub-Index calculation for PM2.5', (t) => {
  // Test Good bracket: 0 - 30 -> 0 - 50
  assert.strictEqual(calculateSubIndex('pm25', 15), 25);
  assert.strictEqual(calculateSubIndex('pm25', 30), 50);

  // Test Satisfactory bracket: 31 - 60 -> 51 - 100
  const subSat = calculateSubIndex('pm25', 45);
  assert.ok(subSat >= 70 && subSat <= 80);

  // Test Severe bracket: > 250 -> 401 - 500
  const subSev = calculateSubIndex('pm25', 350);
  assert.ok(subSev >= 400 && subSev <= 500);
});

test('CPCB Overall AQI returns correct category and primary pollutant', (t) => {
  const result = calculateCpcbAqi({
    pm25: 140, // subindex in Very Poor (301-400)
    pm10: 210, // subindex in Moderate (101-200)
    no2: 45,
    co: 0.8,
  });

  assert.strictEqual(result.category, 'Very Poor');
  assert.strictEqual(result.primaryPollutant, 'PM2.5');
  assert.ok(result.aqi >= 301 && result.aqi <= 400);
});

test('AQI Category mapping matches CPCB standards', (t) => {
  assert.strictEqual(getAqiCategory(35).category, 'Good');
  assert.strictEqual(getAqiCategory(75).category, 'Satisfactory');
  assert.strictEqual(getAqiCategory(150).category, 'Moderate');
  assert.strictEqual(getAqiCategory(250).category, 'Poor');
  assert.strictEqual(getAqiCategory(350).category, 'Very Poor');
  assert.strictEqual(getAqiCategory(450).category, 'Severe');
});
