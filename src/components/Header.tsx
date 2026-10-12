import React from 'react';
import { Menu, Search, Sun, Moon, Sparkles, Globe } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'all' | 'hi' | 'en';
  onToggleLanguage: () => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
  language,
  onToggleLanguage,
  onGoHome,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Hamburger menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            aria-label="Open Navigation Menu"
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Zeno.com Logo */}
        <div 
          onClick={onGoHome}
          className="cursor-pointer group flex items-center gap-1.5 select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-lg tracking-tighter">
            Z
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white logo-3d group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Zeno<span className="text-blue-600 dark:text-blue-400">.com</span>
            </span>
          </div>
        </div>

        {/* Right: Search, Language & Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            title={`Current language: ${language.toUpperCase()}. Click to switch.`}
            className="h-9 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-all active:scale-95 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'हिन्दी' : language === 'en' ? 'EN' : 'HI/EN'}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search posts"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
