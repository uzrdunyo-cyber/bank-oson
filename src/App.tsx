/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, Language } from './types';
import { translations } from './locales/translations';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ChatAdvisorPage } from './pages/ChatAdvisorPage';
import { LoanCalculatorPage } from './pages/LoanCalculatorPage';
import { TariffTranslatorPage } from './pages/TariffTranslatorPage';
import { BusinessHelperPage } from './pages/BusinessHelperPage';
import { ComplaintBuilderPage } from './pages/ComplaintBuilderPage';
import { FraudCheckerPage } from './pages/FraudCheckerPage';
import { SourcesPage } from './pages/SourcesPage';
import { FeedbackModal } from './components/FeedbackModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [language, setLanguage] = useState<Language>('uz');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isAiLive, setIsAiLive] = useState(false);

  useEffect(() => {
    // Check server status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAiLive(Boolean(data.hasGeminiKey));
      })
      .catch((err) => {
        console.warn('Status check warning:', err);
      });
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#070F2B] text-slate-100 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onOpenFeedback={() => setFeedbackOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isAiLive={isAiLive}
      />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={language}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigate={setCurrentTab} language={language} />
          )}

          {currentTab === 'chat' && (
            <ChatAdvisorPage language={language} />
          )}

          {currentTab === 'calculator' && (
            <LoanCalculatorPage language={language} />
          )}

          {currentTab === 'tariff' && (
            <TariffTranslatorPage language={language} />
          )}

          {currentTab === 'business' && (
            <BusinessHelperPage language={language} />
          )}

          {currentTab === 'complaint' && (
            <ComplaintBuilderPage language={language} />
          )}

          {currentTab === 'fraud' && (
            <FraudCheckerPage language={language} />
          )}

          {currentTab === 'sources' && (
            <SourcesPage language={language} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B192C] border-t border-slate-800/80 text-xs text-slate-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Bank Oson AI</span>
            <span>—</span>
            <span>{t.appSlogan}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('sources')}
              className="hover:text-teal-400 transition"
            >
              {t.nav.sources}
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('fraud')}
              className="hover:text-rose-400 transition"
            >
              {t.nav.fraud}
            </button>
            <span>•</span>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="hover:text-teal-400 transition"
            >
              {t.nav.feedback}
            </button>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        language={language}
      />
    </div>
  );
}
