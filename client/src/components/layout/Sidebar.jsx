import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  TrendingUp,
  Home,
  Navigation,
  Sliders,
  Users,
  BarChart3,
  MessageSquareQuote,
  Settings,
  Leaf,
  Sparkles,
  Award,
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: t('overview'), icon: LayoutDashboard },
    { to: '/map', label: t('map'), icon: MapPin },
    { to: '/planner', label: t('planner'), icon: CalendarCheck, badge: 'AI' },
    { to: '/forecast', label: t('forecast'), icon: TrendingUp },
    { to: '/indoor', label: t('indoor'), icon: Home },
    { to: '/routes', label: t('routes'), icon: Navigation },
    { to: '/simulator', label: t('simulator'), icon: Sliders, highlight: true },
    { to: '/community', label: t('community'), icon: Users },
    { to: '/analytics', label: t('analytics'), icon: BarChart3 },
    { to: '/assistant', label: t('assistant'), icon: MessageSquareQuote, badge: 'AI' },
    { to: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FFFFFF] dark:bg-[#161C19] border-r border-[#DDECE3]/70 dark:border-white/5 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#DDECE3]/60 dark:border-white/5">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest-800 dark:bg-forest-700 flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-4 h-4 text-forest-300" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-forest-800 dark:text-white">
                Nirmal
              </span>
              <span className="text-[10px] block -mt-1 font-medium text-forest-600/70 dark:text-forest-400/70 tracking-wide uppercase">
                Air Intelligence
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-forest-700/50 dark:text-forest-300/40">
            Platform Features
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-sm dark:bg-forest-700'
                    : item.highlight
                    ? 'text-forest-800 dark:text-forest-200 bg-forest-50/80 dark:bg-forest-900/30 hover:bg-forest-100/70 dark:hover:bg-forest-800/40 font-semibold'
                    : 'text-[#252D2A]/80 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-forest-600 dark:text-forest-300'
                          : 'text-forest-700/60 dark:text-gray-400 group-hover:text-forest-800 dark:group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card / Eco Points Footer */}
        <div className="p-3.5 border-t border-[#DDECE3]/60 dark:border-white/5">
          {user ? (
            <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-forest-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-forest-600 dark:text-forest-300 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span>{user.points || 120} Eco-pts</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/5 text-center">
              <p className="text-xs font-semibold text-forest-900 dark:text-white">
                Guest Mode
              </p>
              <p className="text-[10px] text-forest-600 dark:text-forest-300 mt-0.5 mb-2">
                Sign in to save scenarios & track exposure
              </p>
              <NavLink
                to="/login"
                className="inline-block w-full py-1.5 text-xs font-medium rounded-lg bg-forest-800 text-white hover:bg-forest-700 transition"
              >
                Sign In / Demo
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
