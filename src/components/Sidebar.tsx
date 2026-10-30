import React from 'react';
import {
  LayoutDashboard,
  Bot,
  FileSearch,
  Calculator,
  Briefcase,
  FileText,
  ShieldAlert,
  BookOpenCheck,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { translations } from '../locales/translations';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = translations[language];

  const menuItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; tag?: string }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'chat', label: t.nav.chat, icon: Bot, tag: 'AI' },
    { id: 'calculator', label: t.nav.calculator, icon: Calculator },
    { id: 'tariff', label: t.nav.tariff, icon: FileSearch },
    { id: 'business', label: t.nav.business, icon: Briefcase },
    { id: 'complaint', label: t.nav.complaint, icon: FileText },
    { id: 'fraud', label: t.nav.fraud, icon: ShieldAlert, tag: 'Muhim' },
    { id: 'sources', label: t.nav.sources, icon: BookOpenCheck },
  ];

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between py-4">
      {/* Navigation Links */}
      <div className="space-y-1.5 px-3">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          {language === 'uz' ? 'Xizmatlar & Bo‘limlar' : 'Разделы и сервисы'}
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.tag && (
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-teal-700 text-teal-100'
                      : item.tag === 'AI'
                      ? 'bg-teal-950 text-teal-300 border border-teal-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Regulators and Helpline Card */}
      <div className="px-3 pt-4 border-t border-slate-800 mt-4 space-y-3">
        <div className="bg-slate-850 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'uz' ? 'Markaziy bank ishonch telefoni' : 'Горячая линия ЦБ'}</span>
          </div>
          <div className="text-lg font-bold text-white tracking-wide">1114</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'uz'
              ? 'Bank xizmatlari iste’molchilari huquqlarini himoya qilish xizmati'
              : 'Служба защиты прав потребителей банковских услуг'}
          </p>
          <a
            href="https://cbu.uz/oz/consumer-protection/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:underline mt-2 font-medium"
          >
            <span>cbu.uz portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-[#0B192C] border-r border-slate-800 flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 bg-[#0B192C] h-full shadow-2xl flex flex-col z-10 border-r border-slate-800">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
