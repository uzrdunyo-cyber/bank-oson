import React from 'react';
import { ShieldCheck, MessageSquareText, Menu, X, Sparkles, Building2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenFeedback: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  isAiLive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onOpenFeedback,
  mobileMenuOpen,
  onToggleMobileMenu,
  isAiLive,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    Bank Oson <span className="text-teal-400">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-950/80 text-teal-300 border border-teal-800/60">
                    O‘zbekiston
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                  {t.appSlogan}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side actions */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isAiLive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}
              title={isAiLive ? 'Gemini 3.8 Flash faol' : 'Demo rejim - namunaviy mustaqil javoblar'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLive ? 'AI Faol' : 'Demo Rejim'}</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => onLanguageChange('uz')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'uz'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                O‘ZB
              </button>
              <button
                onClick={() => onLanguageChange('ru')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'ru'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                РУС
              </button>
            </div>

            {/* Feedback Button */}
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <MessageSquareText className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">{t.nav.feedback}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
