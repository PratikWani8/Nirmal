import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Settings,
  User,
  Globe,
  MapPin,
  Moon,
  Sun,
  Bell,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || 'Aarav Sharma');
  const [city, setCity] = useState(user?.location?.city || 'New Delhi');
  const [smogAlerts, setSmogAlerts] = useState(user?.preferences?.smogAlerts ?? true);
  const [dailyDigest, setDailyDigest] = useState(user?.preferences?.dailyDigest ?? true);
  const [communityAlerts, setCommunityAlerts] = useState(user?.preferences?.communityAlerts ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        preferredLanguage: language,
        location: { ...user?.location, city },
        preferences: { smogAlerts, dailyDigest, communityAlerts },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.warn('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Platform Preferences & Account Settings
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Manage your personal profile, notification thresholds, and regional parameters.
          </p>
        </div>

        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            icon={LogOut}
            className="text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-50"
          >
            Sign Out
          </Button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card title="User Profile & Location" subtitle="Used to localize environmental monitoring and routines.">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Primary Urban Location
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Lucknow">Lucknow</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || 'demo@nirmal.eco'}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-forest-50/50 dark:bg-forest-900/10 border border-forest-100 dark:border-white/10 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Language & Theme Card */}
        <Card title="Display & Language Preferences" subtitle="Nirmal supports English, Hindi, and Marathi across all modules.">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  System Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white font-medium"
                >
                  <option value="en">English (US/UK/IN)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Interface Theme
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                      theme === 'light'
                        ? 'bg-forest-800 text-white border-forest-800 shadow-xs'
                        : 'bg-forest-50 dark:bg-forest-900/20 border-forest-100 dark:border-white/10 text-forest-800 dark:text-gray-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light Theme
                  </button>

                  <button
                    type="button"
                    onClick={() => { if (theme === 'light') toggleTheme(); }}
                    className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                      theme === 'dark'
                        ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                        : 'bg-forest-50 dark:bg-forest-900/20 border-forest-100 dark:border-white/10 text-forest-800 dark:text-gray-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark Theme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications & Alert Toggles */}
        <Card title="Alert Channels & Thresholds" subtitle="Configure automated notifications triggered by environmental thresholds.">
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 cursor-pointer">
              <div>
                <span className="font-bold text-forest-900 dark:text-white block">
                  Severe Smog & Nocturnal Inversion Alerts
                </span>
                <span className="text-[11px] text-gray-500">
                  Notify when planetary boundary layer height drops and wind speed falls below 6 km/h.
                </span>
              </div>
              <input
                type="checkbox"
                checked={smogAlerts}
                onChange={(e) => setSmogAlerts(e.target.checked)}
                className="rounded text-forest-800 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 cursor-pointer">
              <div>
                <span className="font-bold text-forest-900 dark:text-white block">
                  Daily Clean Air Routine Digest
                </span>
                <span className="text-[11px] text-gray-500">
                  Receive personalized 4-phase day plan at 6:30 AM based on overnight particulate measurements.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="rounded text-forest-800 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 cursor-pointer">
              <div>
                <span className="font-bold text-forest-900 dark:text-white block">
                  Community Hotspot Reports in My Vicinity
                </span>
                <span className="text-[11px] text-gray-500">
                  Alert when an open trash burning or dust hazard is verified within 3 km of my location.
                </span>
              </div>
              <input
                type="checkbox"
                checked={communityAlerts}
                onChange={(e) => setCommunityAlerts(e.target.checked)}
                className="rounded text-forest-800 w-4 h-4"
              />
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            loading={saving}
            icon={Save}
            size="md"
            className="font-bold"
          >
            {saved ? 'Settings Saved!' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
