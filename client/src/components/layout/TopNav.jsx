import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAqi } from '../../context/AqiContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguagePicker from '../common/LanguagePicker';
import AqiBadge from '../common/AqiBadge';
import {
  Search,
  MapPin,
  Sun,
  Moon,
  Bell,
  Menu,
  Check,
  RefreshCw,
} from 'lucide-react';

const PRESET_CITIES = [
  'New Delhi',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Lucknow',
];

export default function TopNav({ onToggleMobile = () => {} }) {
  const { currentLocation, aqiData, changeLocation, refreshData, loading } = useAqi();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCitySelect = async (cityName) => {
    setSearchLoading(true);
    await changeLocation(cityName);
    setSearchLoading(false);
    setSearchOpen(false);
    setQuery('');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchLoading(true);
    await changeLocation(query.trim());
    setSearchLoading(false);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <header className="h-16 bg-[#FFFFFF] dark:bg-[#161C19] border-b border-[#DDECE3]/70 dark:border-white/5 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + Location Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-forest-800 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-white/5"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Dropdown / Search Trigger */}
        <div className="relative" ref={searchRef}>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-50/80 dark:bg-forest-900/30 hover:bg-forest-100/70 dark:hover:bg-forest-800/40 border border-forest-100/80 dark:border-white/5 transition-all text-xs font-semibold text-forest-900 dark:text-white"
          >
            <MapPin className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[200px]">
              {currentLocation.city || 'Select Location'}
            </span>
            <span className="text-[10px] text-forest-600/60 dark:text-forest-400/60 hidden sm:inline">
              ({currentLocation.state ? `${currentLocation.state}` : 'India'})
            </span>
          </button>

          {/* Search Dropdown Modal */}
          {searchOpen && (
            <div className="origin-top-left absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-elevated bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <form onSubmit={handleSearchSubmit} className="relative mb-2.5">
                <Search className="w-4 h-4 text-forest-600 dark:text-forest-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchCity')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-forest-50 dark:bg-forest-900/40 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white placeholder:text-forest-700/40 dark:placeholder:text-forest-300/40 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                  autoFocus
                />
              </form>

              <div className="text-[10px] font-bold uppercase tracking-wider text-forest-700/50 dark:text-forest-300/40 px-1 mb-1.5">
                Popular Urban Hubs
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    disabled={searchLoading}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentLocation.city?.toLowerCase() === c.toLowerCase()
                        ? 'bg-forest-100/80 dark:bg-forest-800/60 text-forest-900 dark:text-white font-semibold'
                        : 'text-forest-800 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{c}</span>
                    {currentLocation.city?.toLowerCase() === c.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-forest-700 dark:text-forest-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={refreshData}
          disabled={loading}
          title={t('refreshData')}
          className="p-1.5 rounded-xl text-forest-700/60 dark:text-forest-300/60 hover:text-forest-900 dark:hover:text-white hover:bg-forest-50 dark:hover:bg-white/5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live AQI Badge */}
        {aqiData && (
          <div className="hidden md:block">
            <AqiBadge aqi={aqiData.cpcbAqi} label={aqiData.category} size="md" />
          </div>
        )}

        {/* Language Picker */}
        <LanguagePicker variant="compact" />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-forest-800 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-white/5 transition-colors border border-forest-100/60 dark:border-white/5"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-forest-700" />}
        </button>

        {/* Notifications */}
        <NavLink
          to="/notifications"
          className="relative p-2 rounded-xl text-forest-800 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-white/5 transition-colors border border-forest-100/60 dark:border-white/5"
          title={t('notifications')}
        >
          <Bell className="w-4 h-4 text-forest-700 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#161C19]" />
        </NavLink>

        {/* User Profile or Login */}
        {user ? (
          <NavLink
            to="/settings"
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-forest-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-forest-800 dark:bg-forest-700 text-white flex items-center justify-center font-bold text-xs">
              {user.name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-forest-900 dark:text-white hidden sm:inline">
              {user.name?.split(' ')[0]}
            </span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-forest-800 text-white hover:bg-forest-700 transition"
          >
            {t('signIn')}
          </NavLink>
        )}
      </div>
    </header>
  );
}
