import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export default function LanguagePicker({ variant = 'compact' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-forest-100 dark:border-white/10 bg-white/80 dark:bg-forest-900/40 text-xs font-medium text-forest-800 dark:text-forest-200 hover:bg-forest-50 dark:hover:bg-forest-800/40 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
        <span>{variant === 'compact' ? current.code.toUpperCase() : current.native}</span>
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-xl shadow-elevated bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 p-1.5 z-50">
          <div className="text-[10px] font-semibold text-forest-700/50 dark:text-forest-300/50 uppercase tracking-wider px-2 py-1">
            Select Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                language === lang.code
                  ? 'bg-forest-100/70 dark:bg-forest-800/60 font-semibold text-forest-900 dark:text-forest-100'
                  : 'text-forest-800 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-white/5'
              }`}
            >
              <div>
                <span>{lang.native}</span>
                <span className="text-[10px] text-forest-600/60 dark:text-forest-400/60 ml-1.5">({lang.label})</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-forest-700 dark:text-forest-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
