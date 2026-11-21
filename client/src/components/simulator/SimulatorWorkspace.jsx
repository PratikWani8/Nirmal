import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import AqiBadge, { getAqiColor } from '../common/AqiBadge';
import { simulatorAPI } from '../../services/api';
import { useAqi } from '../../context/AqiContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  FileText,
  Layers,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function SimulatorWorkspace() {
  const { aqiData, currentLocation } = useAqi();
  const { language, t } = useLanguage();

  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('baseline');
  const [scenarioName, setScenarioName] = useState('My Custom Clean Air Plan');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sliders State (0 - 100%)
  const [params, setParams] = useState({
    vehicleReduction: 35,
    publicTransportAdoption: 40,
    carpoolingAdoption: 30,
    constructionDustReduction: 50,
    wasteBurningReduction: 85,
    greenSpaceImprovement: 60,
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);

  // Comparison drawer state
  const [compareList, setCompareList] = useState([]);

  // Fetch Presets on Mount
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await simulatorAPI.getPresets();
        if (res.data?.success) {
          setPresets(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load simulator presets:', err.message);
      }
    };
    fetchPresets();
  }, []);

  // Run simulation automatically when params change or baseline is available
  const handleRunSimulation = async (customParams) => {
    setLoading(true);
    try {
      const activeParams = customParams || params;
      const baseline = {
        aqi: aqiData?.cpcbAqi || 310,
        pm25: aqiData?.pollutants?.pm25 || 145,
        pm10: aqiData?.pollutants?.pm10 || 240,
      };

      const res = await simulatorAPI.run({
        baseline,
        parameters: activeParams,
        language,
      });

      if (res.data?.success) {
        setSimulationResult(res.data.data);
      }
    } catch (err) {
      console.error('Simulation run failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, [language, aqiData?.cpcbAqi]);

  const handleSliderChange = (field, value) => {
    const updated = { ...params, [field]: Number(value) };
    setParams(updated);
    setSelectedPreset('custom');
  };

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setScenarioName(preset.name);
    setParams(preset.parameters);
    handleRunSimulation(preset.parameters);
  };

  const handleReset = () => {
    const baselineParams = {
      vehicleReduction: 0,
      publicTransportAdoption: 0,
      carpoolingAdoption: 0,
      constructionDustReduction: 0,
      wasteBurningReduction: 0,
      greenSpaceImprovement: 0,
    };
    setParams(baselineParams);
    setSelectedPreset('baseline');
    setScenarioName('Baseline Situation');
    handleRunSimulation(baselineParams);
  };

  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    setSaving(true);
    try {
      await simulatorAPI.save({
        scenarioName,
        baseline: simulationResult.baseline,
        parameters: params,
        results: simulationResult.estimatedResults,
        aiExplanation: simulationResult.aiExplanation,
        aiActionPlan: actionPlan,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Please sign in to save your custom simulations to your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateActionPlan = async () => {
    if (!simulationResult) return;
    setActionPlanLoading(true);
    setShowActionPlanModal(true);
    try {
      const res = await simulatorAPI.generateActionPlan({
        simulationResult,
        scenarioName,
        language,
      });
      if (res.data?.success) {
        setActionPlan(res.data.data);
      }
    } catch (err) {
      console.error('Failed to generate action plan:', err.message);
    } finally {
      setActionPlanLoading(false);
    }
  };

  const handleAddToCompare = () => {
    if (!simulationResult) return;
    const item = {
      id: Date.now(),
      name: scenarioName,
      parameters: { ...params },
      results: simulationResult.estimatedResults,
    };
    setCompareList(prev => [...prev.slice(-3), item]);
  };

  const res = simulationResult?.estimatedResults;
  const aqiStyle = getAqiColor(res?.estimatedScenarioAqi || 150);

  // Sector breakdown chart data
  const sectorData = res ? [
    { name: 'Transport', reduction: res.sectorReductions?.transport || 0, color: '#214F40' },
    { name: 'Road/Const Dust', reduction: res.sectorReductions?.constructionDust || 0, color: '#D97706' },
    { name: 'Open Waste', reduction: res.sectorReductions?.wasteBurning || 0, color: '#DC2626' },
    { name: 'Urban Green Sink', reduction: Math.round(params.greenSpaceImprovement * 0.1), color: '#10B981' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-forest-800 text-white shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-forest-700 text-forest-300">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              {t('simulatorTitle')}
            </h2>
          </div>
          <p className="text-xs text-forest-200/80 mt-1">
            {t('simulatorSubtitle')} · Location: <strong>{currentLocation.city}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToCompare}
            icon={Layers}
            className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
          >
            Add to Compare ({compareList.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            icon={Printer}
            className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
          >
            Export / Print
          </Button>
        </div>
      </div>

      {/* Preset Scenario Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-forest-700/60 dark:text-forest-300/60 uppercase tracking-wider shrink-0 mr-1">
          Preset Scenarios:
        </span>
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedPreset === preset.id
                ? 'bg-forest-800 text-white border-forest-800 dark:bg-forest-700 dark:border-forest-700 shadow-xs'
                : 'bg-white dark:bg-[#1D2421] text-forest-900 dark:text-gray-300 border-forest-100 dark:border-white/10 hover:bg-forest-50 dark:hover:bg-white/5'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Interactive Scenario Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Scenario Parameters & Interventions"
            subtitle="Adjust policy assumptions and observe modeled ambient impacts in real-time."
          >
            <div className="space-y-5">
              {/* Scenario Name Input */}
              <div>
                <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                  Scenario Label
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>

              {/* Slider 1: Vehicle Reduction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    1. {t('vehicleReduction')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.vehicleReduction}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.vehicleReduction}
                  onChange={(e) => handleSliderChange('vehicleReduction', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Fewer private solo vehicle trips through congestion zones and telework.
                </p>
              </div>

              {/* Slider 2: Public Transport Adoption */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    2. {t('publicTransit')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.publicTransportAdoption}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.publicTransportAdoption}
                  onChange={(e) => handleSliderChange('publicTransportAdoption', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Modal shift of daily commuters towards metro corridors and electric bus fleets.
                </p>
              </div>

              {/* Slider 3: Carpooling Adoption */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    3. {t('carpoolAdoption')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.carpoolingAdoption}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.carpoolingAdoption}
                  onChange={(e) => handleSliderChange('carpoolingAdoption', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Shared vehicle occupancy among co-workers and residential neighbors.
                </p>
              </div>

              {/* Slider 4: Construction Dust Reduction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    4. {t('dustReduction')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.constructionDustReduction}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.constructionDustReduction}
                  onChange={(e) => handleSliderChange('constructionDustReduction', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Anti-smog guns, green screening, and paved shoulder dust stabilization.
                </p>
              </div>

              {/* Slider 5: Waste Burning Reduction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    5. {t('wasteReduction')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.wasteBurningReduction}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.wasteBurningReduction}
                  onChange={(e) => handleSliderChange('wasteBurningReduction', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Strict municipal enforcement on open trash, plastic, and leaf combustion.
                </p>
              </div>

              {/* Slider 6: Green Space Improvement */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-forest-900 dark:text-white">
                    6. {t('greenSpace')}
                  </span>
                  <span className="font-bold text-forest-700 dark:text-forest-300">
                    {params.greenSpaceImprovement}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.greenSpaceImprovement}
                  onChange={(e) => handleSliderChange('greenSpaceImprovement', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-forest-100 dark:bg-forest-900/60"
                />
                <p className="text-[10px] text-forest-700/60 dark:text-forest-300/60">
                  Roadside vegetative tree canopies capturing airborne particulates via dry deposition.
                </p>
              </div>

              {/* Control Action Buttons */}
              <div className="pt-3 border-t border-forest-100/60 dark:border-white/5 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  icon={RotateCcw}
                >
                  {t('resetSliders')}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveScenario}
                    loading={saving}
                    icon={Save}
                  >
                    {saveSuccess ? 'Saved!' : t('saveScenario')}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRunSimulation()}
                    loading={loading}
                    icon={Sparkles}
                  >
                    Calculate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Model Assumptions Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-1">
              <ShieldAlert className="w-4 h-4" />
              Scientific Dispersion Integrity
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
              Nirmal does not assume a 50% vehicle reduction cuts AQI in half. Urban airsheds contain regional transboundary backgrounds (~35%) unaffected by local municipal levers. Calculations reflect source-apportioned rollback modeling with ±18% uncertainty envelope.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Simulation Results & Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {res && (
            <>
              {/* Key Results Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Modeled Emissions Reduction */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Targeted Emissions
                  </span>
                  <div className="my-1 flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl">
                    <TrendingDown className="w-5 h-5" />
                    <span>-{res.emissionReductionPercent}%</span>
                  </div>
                  <span className="text-[10px] text-forest-600/70 dark:text-forest-400/70 block">
                    Index: 100 → {res.scenarioEmissionsIndex}
                  </span>
                </div>

                {/* Modeled Ambient PM2.5 */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Modeled PM2.5
                  </span>
                  <div className="my-1 flex items-baseline gap-1 font-extrabold text-2xl text-forest-900 dark:text-white">
                    <span>{res.estimatedScenarioPm25}</span>
                    <span className="text-xs font-normal text-forest-600">µg/m³</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                    -{res.estimatedPm25ReductionPercent}% from baseline ({simulationResult.baseline?.pm25} µg/m³)
                  </span>
                </div>

                {/* Estimated CPCB AQI Category */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 dark:text-forest-300/60 block">
                    Projected NAQI
                  </span>
                  <div className="my-1 flex items-center gap-2">
                    <span className="text-2xl font-black" style={{ color: aqiStyle.hex }}>
                      ~{res.estimatedScenarioAqi}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${aqiStyle.hex}15`,
                        color: aqiStyle.hex,
                        borderColor: `${aqiStyle.hex}30`,
                      }}
                    >
                      {res.scenarioCategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-forest-700/60 dark:text-forest-300/60 block">
                    Baseline: {simulationResult.baseline?.aqi}
                  </span>
                </div>
              </div>

              {/* Visualizations Card */}
              <Card
                title="Sector Reductions & Emission Changes"
                subtitle="Sector-by-sector intervention efficiency and particulate reduction envelope."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Bar Chart of Sector Reductions */}
                  <div className="h-56">
                    <p className="text-[11px] font-bold text-forest-800 dark:text-forest-200 mb-2">
                      Sector Reduction %
                    </p>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={sectorData} layout="vertical" margin={{ left: -15, right: 10, top: 0, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#5C9E87' }} unit="%" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#5C9E87' }} width={90} />
                        <Tooltip />
                        <Bar dataKey="reduction" radius={[0, 6, 6, 0]}>
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Uncertainty Envelope Box */}
                  <div className="p-4 rounded-xl bg-forest-50/60 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-900 dark:text-white">
                        Confidence Envelope
                      </span>
                      <span className="text-[10px] font-semibold text-forest-700 dark:text-forest-300">
                        {res.uncertaintyRange?.confidenceInterval} Range
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-forest-700/70 dark:text-forest-300/70">Optimistic (High wind mixing):</span>
                        <strong className="text-emerald-600">{res.uncertaintyRange?.minPm25} µg/m³</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-forest-700/70 dark:text-forest-300/70">Steady-State Modeled:</span>
                        <strong className="text-forest-900 dark:text-white">{res.estimatedScenarioPm25} µg/m³</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-forest-700/70 dark:text-forest-300/70">Pessimistic (Severe Inversion):</span>
                        <strong className="text-amber-600">{res.uncertaintyRange?.maxPm25} µg/m³</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-forest-600/70 dark:text-forest-400/70 border-t border-forest-100/60 dark:border-white/5 pt-2 leading-relaxed">
                      Confidence Score: <strong>{res.uncertaintyRange?.confidenceScore}</strong>
                    </p>
                  </div>
                </div>
              </Card>

              {/* AI Scenario Explainer */}
              <Card
                title="AI Scenario Analysis & Interpretation"
                subtitle="Scientifically grounded synthesis explaining the dynamics of your simulation."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleGenerateActionPlan}
                    loading={actionPlanLoading}
                    icon={FileText}
                  >
                    Generate Action Plan
                  </Button>
                }
              >
                <div className="space-y-3 text-xs leading-relaxed">
                  <p className="text-forest-900 dark:text-gray-200">
                    {simulationResult.aiExplanation?.summary}
                  </p>

                  <div className="p-3 rounded-xl bg-forest-50/70 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 space-y-1">
                    <p className="font-semibold text-forest-800 dark:text-forest-200">
                      Primary Driving Factor:
                    </p>
                    <p className="text-forest-700 dark:text-forest-300">
                      {simulationResult.aiExplanation?.primaryContributor}
                    </p>
                  </div>

                  {simulationResult.aiExplanation?.keySensitivities && (
                    <div className="p-3 rounded-xl bg-forest-50/40 dark:bg-forest-900/10 border border-forest-100/60 dark:border-white/5 space-y-1">
                      <p className="font-semibold text-forest-800 dark:text-forest-200 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-forest-600" />
                        Airshed Sensitivities & Dispersion:
                      </p>
                      <p className="text-forest-700/80 dark:text-forest-300/80">
                        {simulationResult.aiExplanation.keySensitivities}
                      </p>
                    </div>
                  )}

                  {simulationResult.aiExplanation?.recommendations?.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="font-semibold text-forest-900 dark:text-white">
                        Recommended Complementary Municipal Interventions:
                      </p>
                      <ul className="space-y-1">
                        {simulationResult.aiExplanation.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-forest-800 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Comparison Drawer Table if scenarios added */}
              {compareList.length > 0 && (
                <Card
                  title={`Scenario Comparison Matrix (${compareList.length} Saved)`}
                  subtitle="Compare multiple scenario parameters side-by-side."
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-forest-100 dark:border-white/10 text-forest-700/60 dark:text-forest-300/60 uppercase text-[10px]">
                          <th className="py-2 px-3">Scenario</th>
                          <th className="py-2 px-3">Vehicle Red.</th>
                          <th className="py-2 px-3">Waste Burning</th>
                          <th className="py-2 px-3">Dust Red.</th>
                          <th className="py-2 px-3">Modeled PM2.5</th>
                          <th className="py-2 px-3">Projected AQI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest-100/60 dark:divide-white/5 text-forest-900 dark:text-white">
                        {compareList.map((item) => (
                          <tr key={item.id} className="hover:bg-forest-50/50 dark:hover:bg-white/5">
                            <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                            <td className="py-2.5 px-3">{item.parameters.vehicleReduction}%</td>
                            <td className="py-2.5 px-3">{item.parameters.wasteBurningReduction}%</td>
                            <td className="py-2.5 px-3">{item.parameters.constructionDustReduction}%</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600">
                              {item.results.estimatedScenarioPm25} µg/m³
                            </td>
                            <td className="py-2.5 px-3">
                              <AqiBadge aqi={item.results.estimatedScenarioAqi} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Plan Modal */}
      {showActionPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1D2421] rounded-2xl max-w-2xl w-full p-6 shadow-elevated border border-forest-100 dark:border-white/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-forest-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-forest-900 dark:text-white">
                  {actionPlan?.title || 'Community Clean Air Action Plan'}
                </h3>
                <p className="text-xs text-forest-600 dark:text-forest-400">
                  {actionPlan?.timeline || 'Structured Stakeholder Implementation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowActionPlanModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {actionPlanLoading ? (
              <div className="py-12 text-center text-xs text-forest-700/60 dark:text-forest-300/60 flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-forest-600 animate-spin" />
                Generating customized multi-stakeholder action plan with GenAI...
              </div>
            ) : actionPlan ? (
              <div className="space-y-4 text-xs">
                {Object.entries(actionPlan.stakeholderActions || {}).map(([stakeholder, actions]) => (
                  <div key={stakeholder} className="p-3.5 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 space-y-1.5">
                    <span className="font-bold text-forest-900 dark:text-white capitalize flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-forest-600" />
                      For {stakeholder.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-forest-800 dark:text-gray-300">
                      {actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {actionPlan.measurableMetrics?.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      Measurable Success Milestones:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-emerald-900/80 dark:text-emerald-200/80">
                      {actionPlan.measurableMetrics.map((met, i) => (
                        <li key={i}>{met}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-3 border-t border-forest-100 dark:border-white/10 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowActionPlanModal(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} icon={Printer}>
                Print Action Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
