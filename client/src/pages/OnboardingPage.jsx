import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Sparkles,
  Clock,
  Briefcase,
  Car,
  Activity,
  Home,
  Wind,
  Flame,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [wakeupTime, setWakeupTime] = useState('06:30');
  const [workSchedule, setWorkSchedule] = useState('09:00 - 18:00');
  const [commuteMode, setCommuteMode] = useState('metro_train');
  const [outdoorExercise, setOutdoorExercise] = useState('morning_walk');
  const [householdSize, setHouseholdSize] = useState(3);
  const [indoorVentilation, setIndoorVentilation] = useState('intermittent');
  const [hasAirPurifier, setHasAirPurifier] = useState(false);
  const [cookingFuel, setCookingFuel] = useState('lpg');
  const [sensitivities, setSensitivities] = useState(['children']);

  const handleSensitivityToggle = (item) => {
    if (sensitivities.includes(item)) {
      setSensitivities(sensitivities.filter(s => s !== item));
    } else {
      setSensitivities([...sensitivities, item]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({
        lifestyle: {
          wakeupTime,
          workSchedule,
          commuteMode,
          outdoorExercise,
          householdSize,
          indoorVentilation,
          hasAirPurifier,
          cookingFuel,
          sensitivities,
        },
        onboardingCompleted: true,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-800/40 text-forest-800 dark:text-forest-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Step {step} of 3 · Personalize Environmental Intelligence
        </div>
        <h1 className="text-2xl font-black text-forest-900 dark:text-white tracking-tight">
          Tailor Nirmal to Your Daily Routine
        </h1>
        <p className="text-xs text-forest-700/60 dark:text-forest-300/60">
          Our GenAI engine personalizes daily routines, exposure limits, and indoor alerts based on your habits.
        </p>
      </div>

      <Card padding="p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-forest-900 dark:text-white border-b border-forest-100 dark:border-white/5 pb-2">
              1. Daily Commute & Exercise Habits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                  Typical Wake-up Time
                </label>
                <input
                  type="time"
                  value={wakeupTime}
                  onChange={(e) => setWakeupTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                  Work / College Hours
                </label>
                <input
                  type="text"
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  placeholder="09:00 - 18:00"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Primary Commute Mode
              </label>
              <select
                value={commuteMode}
                onChange={(e) => setCommuteMode(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="metro_train">Metro / Electric Rapid Transit</option>
                <option value="bus">Public Bus</option>
                <option value="carpool">Shared Carpool</option>
                <option value="two_wheeler">Motorcycle / Scooter</option>
                <option value="car_single">Solo Petrol/Diesel Car</option>
                <option value="cycling">Bicycle</option>
                <option value="walking">Walking</option>
                <option value="remote">Work from Home / Remote</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Outdoor Fitness & Exercise Habits
              </label>
              <select
                value={outdoorExercise}
                onChange={(e) => setOutdoorExercise(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="morning_walk">Morning Outdoor Walk</option>
                <option value="morning_run">Morning Running / Cardio</option>
                <option value="evening_sports">Evening Sports / Jogging</option>
                <option value="gym_indoor">Indoor Gym / Yoga</option>
                <option value="none">Minimal Outdoor Exercise</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Indoor Setup →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-forest-900 dark:text-white border-b border-forest-100 dark:border-white/5 pb-2">
              2. Indoor Air & Ventilation Conditions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                  Household Occupants
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                  Indoor Air Purifier Available?
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-forest-900 dark:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="purifier"
                      checked={hasAirPurifier}
                      onChange={() => setHasAirPurifier(true)}
                    />
                    Yes, True HEPA Purifier
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-forest-900 dark:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="purifier"
                      checked={!hasAirPurifier}
                      onChange={() => setHasAirPurifier(false)}
                    />
                    No Purifier
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Typical Window Ventilation Habit
              </label>
              <select
                value={indoorVentilation}
                onChange={(e) => setIndoorVentilation(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="intermittent">Intermittent (opened occasionally midday)</option>
                <option value="natural_open">Open all day (natural breeze)</option>
                <option value="closed_ac">Sealed / AC continuous recirculation</option>
                <option value="cross_ventilation">Morning cross-ventilation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Kitchen Cooking Fuel
              </label>
              <select
                value={cookingFuel}
                onChange={(e) => setCookingFuel(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="lpg">LPG Cylinder / Piped Natural Gas</option>
                <option value="electric_induction">Electric Induction Stove</option>
                <option value="biomass_wood">Biomass / Firewood / Coal</option>
              </select>
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Health Profiles →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-forest-900 dark:text-white border-b border-forest-100 dark:border-white/5 pb-2">
              3. Family Respiratory Health & Sensitivities
            </h2>

            <p className="text-xs text-forest-700/70 dark:text-forest-300/70">
              Select any vulnerable family members. Nirmal uses this to trigger sensitive-group warnings when AQI enters the Unhealthy and Severe brackets.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'children', label: 'Children (< 12 yrs)' },
                { id: 'elderly', label: 'Elderly (> 65 yrs)' },
                { id: 'asthma', label: 'Asthma / Bronchitis' },
                { id: 'cardiac', label: 'Heart Conditions' },
                { id: 'allergies', label: 'Dust / Pollen Allergies' },
                { id: 'pregnancy', label: 'Pregnancy' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSensitivityToggle(item.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                    sensitivities.includes(item.id)
                      ? 'bg-forest-100/80 border-forest-600 text-forest-900 dark:bg-forest-800 dark:border-forest-400 dark:text-white font-bold'
                      : 'bg-forest-50/50 dark:bg-forest-900/20 border-forest-100 dark:border-white/5 text-forest-800 dark:text-gray-300 hover:bg-forest-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>{item.label}</span>
                    {sensitivities.includes(item.id) && (
                      <CheckCircle2 className="w-4 h-4 text-forest-700 dark:text-forest-300" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button onClick={handleFinish} loading={loading} icon={CheckCircle2}>
                Complete Setup & Launch Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
