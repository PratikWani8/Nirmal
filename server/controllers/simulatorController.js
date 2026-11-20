const { runSimulation, PRESET_SCENARIOS } = require('../services/simulator/simulationEngine');
const { explainSimulation, generateCommunityActionPlan } = require('../services/ai/aiService');
const Simulation = require('../models/Simulation');

exports.getPresets = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: Object.values(PRESET_SCENARIOS),
    });
  } catch (err) {
    next(err);
  }
};

exports.run = async (req, res, next) => {
  try {
    const { baseline, parameters, language = 'en' } = req.body;

    const baseData = baseline || {
      aqi: 310,
      pm25: 145,
      pm10: 240,
    };

    const simulationResult = runSimulation(baseData, parameters || {});

    // Generate AI explanation of the simulation numbers
    const aiExplanation = await explainSimulation(simulationResult, language);

    res.status(200).json({
      success: true,
      data: {
        ...simulationResult,
        aiExplanation,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.save = async (req, res, next) => {
  try {
    const { scenarioName, baseline, parameters, results, aiExplanation, aiActionPlan } = req.body;

    if (!scenarioName) {
      return res.status(400).json({ success: false, message: 'Scenario name is required.' });
    }

    const sim = await Simulation.create({
      userId: req.user.id,
      scenarioName,
      baseline,
      scenarioParameters: parameters,
      estimatedResults: results,
      aiExplanation,
      aiActionPlan,
      assumptions: results?.assumptions || [],
    });

    res.status(201).json({
      success: true,
      message: 'Simulation scenario saved successfully!',
      data: sim,
    });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const list = await Simulation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const sim = await Simulation.findById(req.params.id);
    if (!sim) {
      return res.status(404).json({ success: false, message: 'Simulation not found.' });
    }
    res.status(200).json({
      success: true,
      data: sim,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const sim = await Simulation.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sim) {
      return res.status(404).json({ success: false, message: 'Simulation not found or unauthorized.' });
    }
    res.status(200).json({
      success: true,
      message: 'Simulation deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

exports.compare = async (req, res, next) => {
  try {
    const { scenarios, baseline } = req.body;
    // scenarios can be an array of objects: [{ name, parameters }]
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of scenarios to compare.' });
    }

    const baseData = baseline || { aqi: 310, pm25: 145, pm10: 240 };
    const compared = scenarios.slice(0, 4).map(sc => {
      const sim = runSimulation(baseData, sc.parameters || {});
      return {
        name: sc.name || 'Scenario',
        parameters: sc.parameters,
        results: sim.estimatedResults,
      };
    });

    res.status(200).json({
      success: true,
      data: compared,
    });
  } catch (err) {
    next(err);
  }
};

exports.generateActionPlan = async (req, res, next) => {
  try {
    const { simulationResult, scenarioName, language = 'en' } = req.body;
    const plan = await generateCommunityActionPlan(simulationResult, scenarioName, language);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

exports.exportSummary = async (req, res, next) => {
  try {
    const sim = await Simulation.findById(req.params.id);
    if (!sim) {
      return res.status(404).json({ success: false, message: 'Simulation not found.' });
    }

    const report = {
      scenarioName: sim.scenarioName,
      createdDate: sim.createdAt,
      baseline: sim.baseline,
      parameters: sim.scenarioParameters,
      results: sim.estimatedResults,
      explanation: sim.aiExplanation,
      actionPlan: sim.aiActionPlan,
      assumptions: sim.assumptions,
    };

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
