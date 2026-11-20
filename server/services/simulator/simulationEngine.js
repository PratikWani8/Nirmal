/**
 * Nirmal What-If Pollution Simulator Engine
 * 
 * Implements a transparent, source-apportioned sector emissions model combined with
 * an atmospheric roll-back dispersion approximation for urban airsheds.
 * 
 * References:
 * - IIT Kanpur Comprehensive Study on Air Pollution and Green House Gases (Delhi)
 * - SAFAR / TERI Source Apportionment Studies for Urban India
 * - CPCB National Clean Air Programme (NCAP) sectoral frameworks
 */

const { calculateCpcbAqi } = require('../airQuality/cpcbAqi');

// Typical winter source apportionment baseline for urban northern & central India
const DEFAULT_SECTOR_WEIGHTS = {
  transport: 0.28,         // 28% from vehicular tailpipe & tire wear
  constructionDust: 0.25,  // 25% from construction activities & road dust resuspension
  wasteBurning: 0.17,      // 17% from municipal solid waste & biomass open combustion
  industryPower: 0.20,     // 20% from point source industrial stacks & brick kilns
  domesticOthers: 0.10,    // 10% from domestic cooking, DG sets, and localized sources
};

const PRESET_SCENARIOS = {
  baseline: {
    id: 'baseline',
    name: 'Current Situation',
    description: 'Current baseline without additional policy or community interventions.',
    parameters: {
      vehicleReduction: 0,
      publicTransportAdoption: 0,
      carpoolingAdoption: 0,
      constructionDustReduction: 0,
      wasteBurningReduction: 0,
      greenSpaceImprovement: 0,
    },
  },
  greenNeighborhood: {
    id: 'greenNeighborhood',
    name: 'Green Neighborhood',
    description: 'Focused community greening, urban canopy cover expansion, and localized dust suppression.',
    parameters: {
      vehicleReduction: 25,
      publicTransportAdoption: 30,
      carpoolingAdoption: 35,
      constructionDustReduction: 60,
      wasteBurningReduction: 75,
      greenSpaceImprovement: 80,
    },
  },
  publicTransportRevolution: {
    id: 'publicTransportRevolution',
    name: 'Public Transport Revolution',
    description: 'Massive modal shift towards electric buses, metro expansion, and high carpool density.',
    parameters: {
      vehicleReduction: 65,
      publicTransportAdoption: 85,
      carpoolingAdoption: 50,
      constructionDustReduction: 20,
      wasteBurningReduction: 30,
      greenSpaceImprovement: 25,
    },
  },
  zeroWasteBurning: {
    id: 'zeroWasteBurning',
    name: 'Zero Waste Burning',
    description: '100% municipal solid waste collection, strict enforcement against open trash burning, and biomass management.',
    parameters: {
      vehicleReduction: 15,
      publicTransportAdoption: 15,
      carpoolingAdoption: 10,
      constructionDustReduction: 35,
      wasteBurningReduction: 95,
      greenSpaceImprovement: 30,
    },
  },
  lowTrafficCity: {
    id: 'lowTrafficCity',
    name: 'Low-Traffic City',
    description: 'Congestion pricing, low emission zones, odd-even style restriction, and heavy vehicle re-routing.',
    parameters: {
      vehicleReduction: 75,
      publicTransportAdoption: 70,
      carpoolingAdoption: 60,
      constructionDustReduction: 40,
      wasteBurningReduction: 40,
      greenSpaceImprovement: 45,
    },
  },
  communityActionPlan: {
    id: 'communityActionPlan',
    name: 'Community Action Plan',
    description: 'Balanced, multi-sector community campaign combining active transit, waste segregation, and neighborhood greening.',
    parameters: {
      vehicleReduction: 35,
      publicTransportAdoption: 45,
      carpoolingAdoption: 40,
      constructionDustReduction: 50,
      wasteBurningReduction: 80,
      greenSpaceImprovement: 60,
    },
  },
};

/**
 * Calculates sector emission reductions and resulting ambient concentrations
 * @param {Object} baseline - { pm25, pm10, aqi, ... }
 * @param {Object} params - { vehicleReduction, publicTransportAdoption, carpoolingAdoption, constructionDustReduction, wasteBurningReduction, greenSpaceImprovement }
 */
function runSimulation(baseline, params) {
  const p = {
    vehicleReduction: Math.min(100, Math.max(0, Number(params.vehicleReduction) || 0)),
    publicTransportAdoption: Math.min(100, Math.max(0, Number(params.publicTransportAdoption) || 0)),
    carpoolingAdoption: Math.min(100, Math.max(0, Number(params.carpoolingAdoption) || 0)),
    constructionDustReduction: Math.min(100, Math.max(0, Number(params.constructionDustReduction) || 0)),
    wasteBurningReduction: Math.min(100, Math.max(0, Number(params.wasteBurningReduction) || 0)),
    greenSpaceImprovement: Math.min(100, Math.max(0, Number(params.greenSpaceImprovement) || 0)),
  };

  const baselinePm25 = Number(baseline.pm25) > 0 ? Number(baseline.pm25) : 140; // Default winter average
  const baselinePm10 = Number(baseline.pm10) > 0 ? Number(baseline.pm10) : 230;
  const baselineAqi = Number(baseline.aqi) > 0 ? Number(baseline.aqi) : 315;

  // 1. Calculate sector-specific reduction percentages
  // Transport sector: composite of direct vehicle reduction + transit substitution + carpooling
  // Diminishing returns formula to avoid exceeding 95% total tailpipe reduction
  const transportDirect = p.vehicleReduction * 0.55;
  const transportTransit = p.publicTransportAdoption * 0.30;
  const transportCarpool = p.carpoolingAdoption * 0.15;
  const transportSectorReductionPct = Math.min(95, transportDirect + transportTransit + transportCarpool);

  // Construction & Road Dust:
  // Direct dust control + secondary reduction from fewer tires grinding road surface (10% spillover)
  const dustDirect = p.constructionDustReduction * 0.85;
  const dustSpillover = (p.vehicleReduction * 0.15);
  const dustSectorReductionPct = Math.min(95, dustDirect + dustSpillover);

  // Open Waste Burning: direct suppression
  const wasteSectorReductionPct = Math.min(100, p.wasteBurningReduction * 0.95);

  // Industry & Power: Assumed fixed in municipal citizen scenario (0% default unless policy)
  const industrySectorReductionPct = 0;

  // Domestic & Others: Minor benefit from awareness & greening
  const domesticSectorReductionPct = Math.min(40, (p.greenSpaceImprovement * 0.1) + (p.wasteBurningReduction * 0.1));

  // Green space canopy sink factor: mature urban tree canopies remove particulate matter via dry deposition
  // Max ~10% ambient concentration reduction in dense urban canopies (Nowak et al., US Forest Service)
  const greenCanopySinkPct = (p.greenSpaceImprovement / 100) * 9.5;

  // 2. Weighted overall emission index reduction
  const initialIndex = 100;
  const transportContrib = DEFAULT_SECTOR_WEIGHTS.transport * (1 - transportSectorReductionPct / 100);
  const dustContrib = DEFAULT_SECTOR_WEIGHTS.constructionDust * (1 - dustSectorReductionPct / 100);
  const wasteContrib = DEFAULT_SECTOR_WEIGHTS.wasteBurning * (1 - wasteSectorReductionPct / 100);
  const industryContrib = DEFAULT_SECTOR_WEIGHTS.industryPower * (1 - industrySectorReductionPct / 100);
  const domesticContrib = DEFAULT_SECTOR_WEIGHTS.domesticOthers * (1 - domesticSectorReductionPct / 100);

  const finalEmissionsRatio = transportContrib + dustContrib + wasteContrib + industryContrib + domesticContrib;
  const scenarioEmissionsIndex = Math.round(finalEmissionsRatio * 100 * 10) / 10;
  const emissionReductionPercent = Math.round((100 - scenarioEmissionsIndex) * 10) / 10;

  // 3. Ambient Rollback Dispersion Model with Regional Background Fraction
  // Atmospheric background (regional transboundary, geography, geogenic dust) is ~35% of ambient load in winter
  const REGIONAL_BACKGROUND_FRACTION = 0.35;
  const LOCAL_CONTROLLABLE_FRACTION = 0.65;

  // Local controllable fraction reduces proportionally with local emissions
  const reducedLocalFraction = LOCAL_CONTROLLABLE_FRACTION * finalEmissionsRatio;
  // Apply vegetation dry deposition sink to total ambient air
  const postDispersionRatio = (REGIONAL_BACKGROUND_FRACTION + reducedLocalFraction) * (1 - greenCanopySinkPct / 100);

  const estimatedScenarioPm25 = Math.max(12, Math.round(baselinePm25 * postDispersionRatio * 10) / 10);
  const estimatedPm25Reduction = Math.round((baselinePm25 - estimatedScenarioPm25) * 10) / 10;
  const estimatedPm25ReductionPercent = Math.round(((baselinePm25 - estimatedScenarioPm25) / baselinePm25) * 100 * 10) / 10;

  // 4. Calculate new AQI based on CPCB breakpoint mapping
  const scenarioCpcb = calculateCpcbAqi({
    pm25: estimatedScenarioPm25,
    pm10: Math.max(20, Math.round(baselinePm10 * postDispersionRatio)),
  });

  // 5. Scientific Uncertainty Range (Meteorological variance, inversion layer & boundary layer height)
  // ±18% confidence envelope
  const uncertaintyFactor = 0.18;
  const minPm25 = Math.max(8, Math.round(estimatedScenarioPm25 * (1 - uncertaintyFactor)));
  const maxPm25 = Math.round(estimatedScenarioPm25 * (1 + uncertaintyFactor));

  // Determine key contributor
  const sectorReductions = {
    transport: Math.round(transportSectorReductionPct),
    constructionDust: Math.round(dustSectorReductionPct),
    wasteBurning: Math.round(wasteSectorReductionPct),
    industryPower: Math.round(industrySectorReductionPct),
    domesticOthers: Math.round(domesticSectorReductionPct),
  };

  const environmentalBenefits = [];
  if (transportSectorReductionPct > 20) {
    environmentalBenefits.push(`Estimated ${transportSectorReductionPct}% reduction in direct vehicular combustion emissions and black carbon.`);
  }
  if (wasteSectorReductionPct > 30) {
    environmentalBenefits.push(`Estimated ${wasteSectorReductionPct}% reduction in toxic dioxins, furans, and coarse smoke from open municipal combustion.`);
  }
  if (dustSectorReductionPct > 25) {
    environmentalBenefits.push(`Substantial decrease in coarse mechanical PM10 and resuspended silica dust particles.`);
  }
  if (greenCanopySinkPct > 3) {
    environmentalBenefits.push(`Microclimate cooling and dry particulate interception of ~${Math.round(greenCanopySinkPct)}% via expanded green biomass.`);
  }
  if (environmentalBenefits.length === 0) {
    environmentalBenefits.push('Interventions are currently at baseline levels. Increase sliders to evaluate targeted reductions.');
  }

  const assumptions = [
    'Source apportionment weights reflect typical urban Indo-Gangetic airshed baselines (Transport: 28%, Dust: 25%, Waste: 17%, Industry: 20%, Domestic: 10%).',
    'Ambient concentrations include an assumed non-local regional background load of 35% that is unaffected by municipal-level policies.',
    'Urban green space sink capacity follows empirical dry deposition capture rates (maximum 9.5% ambient PM2.5 attenuation for high canopy coverage).',
    'Meteorological variables (inversion depth, wind speed, planetary boundary layer height) are held constant between baseline and scenario.',
    'Results represent seasonal steady-state approximations and should not be used as legal regulatory forecasts.',
  ];

  return {
    baseline: {
      aqi: baselineAqi,
      pm25: baselinePm25,
      pm10: baselinePm10,
      sectorWeights: DEFAULT_SECTOR_WEIGHTS,
    },
    scenarioParameters: p,
    estimatedResults: {
      baselineEmissionsIndex: initialIndex,
      scenarioEmissionsIndex,
      emissionReductionPercent,
      estimatedPm25Reduction,
      estimatedPm25ReductionPercent,
      estimatedScenarioPm25,
      estimatedScenarioAqi: scenarioCpcb.aqi,
      scenarioCategory: scenarioCpcb.category,
      scenarioColor: scenarioCpcb.color,
      uncertaintyRange: {
        minPm25,
        maxPm25,
        confidenceScore: 'Moderate (Empirical Sector Rollback)',
        confidenceInterval: '±18%',
      },
      sectorReductions,
      environmentalBenefits,
    },
    assumptions,
  };
}

module.exports = {
  runSimulation,
  PRESET_SCENARIOS,
  DEFAULT_SECTOR_WEIGHTS,
};
