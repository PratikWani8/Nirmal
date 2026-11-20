/**
 * Nirmal Personal Pollution Exposure Intelligence Calculator
 * 
 * Accurately differentiates ambient environmental concentration (ug/m3)
 * from personal inhaled dose (micrograms PM2.5 inhaled into respiratory tract).
 * Reference: EPA Exposure Factors Handbook
 */

const INHALATION_RATES_M3_HR = {
  sedentary: 0.45,  // Sleeping, desk work, resting
  light: 0.75,      // Slow walking, light chores
  moderate: 1.8,    // Brisk walking, light cycling
  vigorous: 3.6,    // Running, strenuous sports, intense cycling
};

/**
 * Calculate personal exposure dose for a list of activities or a 24-hr day
 */
function calculateDailyExposure(activities, ambientPm25 = 110, indoorPm25 = 45) {
  // If activities array is provided:
  let totalDoseUg = 0;
  let outdoorDoseUg = 0;
  let indoorDoseUg = 0;
  let totalOutdoorHours = 0;
  let totalIndoorHours = 0;

  const activityBreakdown = [];

  if (activities && activities.length > 0) {
    for (const act of activities) {
      const durationHours = (act.durationMinutes || 30) / 60;
      const intensity = act.intensity || 'moderate';
      const rate = INHALATION_RATES_M3_HR[intensity] || 0.75;
      const isOutdoor = act.isOutdoor !== false;
      const concentration = act.customPm25 || (isOutdoor ? ambientPm25 : indoorPm25);

      const doseUg = Math.round(concentration * durationHours * rate * 10) / 10;
      totalDoseUg += doseUg;

      if (isOutdoor) {
        outdoorDoseUg += doseUg;
        totalOutdoorHours += durationHours;
      } else {
        indoorDoseUg += doseUg;
        totalIndoorHours += durationHours;
      }

      activityBreakdown.push({
        name: act.name || 'Activity',
        type: act.activityType || 'general',
        durationMinutes: act.durationMinutes,
        intensity,
        isOutdoor,
        concentration,
        inhaledDoseUg: doseUg,
      });
    }
  } else {
    // Default 24-hour profile: 2.5 hrs outdoor (commute + walk), 21.5 hrs indoor (home + office)
    const outdoorRate = INHALATION_RATES_M3_HR.moderate;
    const outdoorHours = 2.5;
    const outdoorDose = Math.round(ambientPm25 * outdoorHours * outdoorRate * 10) / 10;

    const indoorRate = INHALATION_RATES_M3_HR.sedentary;
    const indoorHours = 21.5;
    const indoorDose = Math.round(indoorPm25 * indoorHours * indoorRate * 10) / 10;

    totalDoseUg = Math.round((outdoorDose + indoorDose) * 10) / 10;
    outdoorDoseUg = outdoorDose;
    indoorDoseUg = indoorDose;
    totalOutdoorHours = outdoorHours;
    totalIndoorHours = indoorHours;

    activityBreakdown.push(
      { name: 'Outdoor Commute & Travel', durationMinutes: 90, intensity: 'moderate', isOutdoor: true, concentration: ambientPm25, inhaledDoseUg: Math.round(ambientPm25 * 1.5 * outdoorRate * 10) / 10 },
      { name: 'Morning/Evening Outdoor Walk', durationMinutes: 60, intensity: 'moderate', isOutdoor: true, concentration: ambientPm25, inhaledDoseUg: Math.round(ambientPm25 * 1.0 * outdoorRate * 10) / 10 },
      { name: 'Office / Indoor Work', durationMinutes: 510, intensity: 'sedentary', isOutdoor: false, concentration: indoorPm25, inhaledDoseUg: Math.round(indoorPm25 * 8.5 * indoorRate * 10) / 10 },
      { name: 'Home & Sleep', durationMinutes: 780, intensity: 'sedentary', isOutdoor: false, concentration: indoorPm25, inhaledDoseUg: Math.round(indoorPm25 * 13.0 * indoorRate * 10) / 10 }
    );
  }

  // WHO Reference Dose: 15 ug/m3 * 24 hr * 0.45 avg breathing rate ~ 162 ug/day
  const whoBenchmarkDoseUg = 162;
  const ratioToWhoGuideline = Math.round((totalDoseUg / whoBenchmarkDoseUg) * 10) / 10;

  return {
    totalDoseUg: Math.round(totalDoseUg * 10) / 10,
    outdoorDoseUg: Math.round(outdoorDoseUg * 10) / 10,
    indoorDoseUg: Math.round(indoorDoseUg * 10) / 10,
    totalOutdoorHours: Math.round(totalOutdoorHours * 10) / 10,
    totalIndoorHours: Math.round(totalIndoorHours * 10) / 10,
    whoBenchmarkDoseUg,
    ratioToWhoGuideline,
    exposureCategory: ratioToWhoGuideline > 3.0 ? 'High Daily Burden' : ratioToWhoGuideline > 1.5 ? 'Moderate Burden' : 'Within Low Impact',
    activityBreakdown,
    disclaimer: 'Note: Estimated inhaled dose represents particulate mass intake based on physiological ventilation rates. It is an exposure assessment metric, not a clinical medical diagnosis.',
  };
}

/**
 * Calculate avoided CO2e and PM2.5 from sustainable transportation
 */
function calculateAvoidedEmissions(mode, distanceKm) {
  // Emission factors per passenger-km:
  // Solo Petrol/Diesel Car: ~165 g CO2e / km, ~0.045 g PM2.5 / km
  // Metro / Electric Train: ~28 g CO2e / km, ~0.002 g PM2.5 / km
  // Public Bus: ~65 g CO2e / km, ~0.012 g PM2.5 / km
  // Carpool (3 passengers): ~55 g CO2e / km, ~0.015 g PM2.5 / km
  // Walking / Cycling: 0 g CO2e / km, 0 g PM2.5 / km

  const carCo2ePerKm = 0.165; // kg
  const carPm25PerKm = 0.045; // grams

  let modeCo2ePerKm = 0;
  let modePm25PerKm = 0;

  if (mode === 'metro_train') {
    modeCo2ePerKm = 0.028;
    modePm25PerKm = 0.002;
  } else if (mode === 'bus') {
    modeCo2ePerKm = 0.065;
    modePm25PerKm = 0.012;
  } else if (mode === 'carpool') {
    modeCo2ePerKm = 0.055;
    modePm25PerKm = 0.015;
  } else if (mode === 'cycling' || mode === 'walking') {
    modeCo2ePerKm = 0;
    modePm25PerKm = 0;
  }

  const avoidedCo2eKg = Math.max(0, Math.round((carCo2ePerKm - modeCo2ePerKm) * distanceKm * 100) / 100);
  const avoidedPm25Grams = Math.max(0, Math.round((carPm25PerKm - modePm25PerKm) * distanceKm * 100) / 100);

  return {
    avoidedCo2eKg,
    avoidedPm25Grams,
  };
}

module.exports = {
  calculateDailyExposure,
  calculateAvoidedEmissions,
  INHALATION_RATES_M3_HR,
};
