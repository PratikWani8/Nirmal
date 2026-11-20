const test = require('node:test');
const assert = require('node:assert');
const { runSimulation, PRESET_SCENARIOS } = require('../services/simulator/simulationEngine');

test('Simulation engine preserves non-linear response and does not equate 50% vehicle reduction to 50% AQI drop', (t) => {
  const baseline = { pm25: 150, pm10: 250, aqi: 323 };
  const params = {
    vehicleReduction: 50,
    publicTransportAdoption: 0,
    carpoolingAdoption: 0,
    constructionDustReduction: 0,
    wasteBurningReduction: 0,
    greenSpaceImprovement: 0,
  };

  const sim = runSimulation(baseline, params);

  // Vehicle reduction of 50% should reduce transport emissions, but because transport is ~28%
  // and background is 35%, ambient PM2.5 reduction should be noticeably less than 50% (around 10-18%)
  const pm25DropPct = sim.estimatedResults.estimatedPm25ReductionPercent;
  assert.ok(pm25DropPct > 5, 'Should produce a meaningful reduction');
  assert.ok(pm25DropPct < 30, 'Should not produce an unrealistic 50% reduction from only vehicles');
  assert.ok(sim.estimatedResults.uncertaintyRange.minPm25 < sim.estimatedResults.estimatedScenarioPm25);
  assert.ok(sim.estimatedResults.uncertaintyRange.maxPm25 > sim.estimatedResults.estimatedScenarioPm25);
});

test('Preset scenarios generate valid outcomes and structured assumptions', (t) => {
  const baseline = { pm25: 160, pm10: 260, aqi: 330 };
  const greenNeighborhood = PRESET_SCENARIOS.greenNeighborhood;

  const sim = runSimulation(baseline, greenNeighborhood.parameters);
  assert.ok(sim.estimatedResults.emissionReductionPercent > 20);
  assert.ok(sim.assumptions.length >= 3);
  assert.ok(sim.estimatedResults.environmentalBenefits.length > 0);
});
