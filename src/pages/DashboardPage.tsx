import React, { useState } from 'react';
import {
  Bot,
  Calculator,
  FileSearch,
  Briefcase,
  FileText,
  ShieldAlert,
  BookOpenCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { NavTab, Language } from '../types';
import { translations } from '../locales/translations';
import { formatUzbekCurrency } from '../utils/loanCalculator';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  language: Language;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, language }) => {
  const t = translations[language];

  // Quick Mini-Calculator state on dashboard
  const [miniAmount, setMiniAmount] = useState<number>(20000000);
  const [miniRate, setMiniRate] = useState<number>(24);
  const [miniTerm, setMiniTerm] = useState<number>(12);

  // Quick Annuity monthly estimate
  const monthlyRate = miniRate / 12 / 100;
  const compound = Math.pow(1 + monthlyRate, miniTerm);
  const miniMonthly = Math.round((miniAmount * monthlyRate * compound) / (compound - 1));
  const miniTotal = Math.round(miniMonthly * miniTerm);
  const miniInterest = miniTotal - miniAmount;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0A2647] border border-slate-700/80 p-6 sm:p-10 shadow-xl text-white">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-300 border border-teal-700/70 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bank Oson AI — Yangi avlod moliyaviy maslahatchisi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t.dashboard.heroTitle}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {t.dashboard.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Bot className="w-5 h-5" />
              <span>{t.dashboard.openAiChat}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('calculator')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-600 transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-teal-400" />
              <span>{t.dashboard.openCalculator}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security alert banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800/70 p-4 sm:p-5 flex items-start gap-3.5 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-300 text-sm">
              {language === 'uz' ? 'XAVFSIZLIK OGOHLANTIRISHI' : 'ПРЕДУПРЕЖДЕНИЕ БЕЗОПАСНОСТИ'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700/60 font-semibold">
              Muhim
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t.dashboard.warningNote}
          </p>
        </div>
        <button
          onClick={() => onNavigate('fraud')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 text-xs font-semibold border border-rose-700 transition"
        >
          <span>{language === 'uz' ? 'Xabarni tekshirish' : 'Проверить СМС'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Interactive Loan Estimator + Quick Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Mini Loan Widget */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'uz' ? 'Tezkor kredit hisoblagichi' : 'Экспресс-калькулятор'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'uz' ? 'Annuitet usulida oylik to‘lovni hisoblang' : 'Быстрый расчет аннуитетного платежа'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('calculator')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <span>{language === 'uz' ? 'To‘liq kalkulyator' : 'Полный калькулятор'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {language === 'uz' ? 'Kredit summasi' : 'Сумма'}:
              </label>
              <div className="text-sm font-bold text-teal-300 mb-1">
                {formatUzbekCurrency(miniAmount)} so‘m
              </div>
              <input
                type="range"
                min={2000000}
                max={150000000}
                step={1000000}
                value={miniAmount}
                onChange={(e) => setMiniAmount(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {language === 'uz' ? 'Yillik stavka' : 'Ставка'}:
              </label>
              <div className="text-sm font-bold text-teal-300 mb-1">
                {miniRate}%
              </div>
              <input
                type="range"
                min={10}
                max={48}
                step={1}
                value={miniRate}
                onChange={(e) => setMiniRate(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {language === 'uz' ? 'Muddati' : 'Срок'}:
              </label>
              <div className="text-sm font-bold text-teal-300 mb-1">
                {miniTerm} {language === 'uz' ? 'oy' : 'мес.'}
              </div>
              <input
                type="range"
                min={3}
                max={60}
                step={3}
                value={miniTerm}
                onChange={(e) => setMiniTerm(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          {/* Quick result metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div>
              <div className="text-[11px] text-slate-400">
                {language === 'uz' ? 'Oylik to‘lov' : 'Ежемесячно'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-1">
                {formatUzbekCurrency(miniMonthly)} <span className="text-[10px] text-slate-400">so‘m</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">
                {language === 'uz' ? 'Jami foiz' : 'Переплата'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-amber-400 mt-1">
                +{formatUzbekCurrency(miniInterest)} <span className="text-[10px] text-slate-400">so‘m</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">
                {language === 'uz' ? 'Jami qaytarish' : 'Итого'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-teal-300 mt-1">
                {formatUzbekCurrency(miniTotal)} <span className="text-[10px] text-slate-400">so‘m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Literacy & Helpline Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 text-teal-400 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold text-white">
                {language === 'uz' ? 'Moliyaviy maslahat' : 'Финансовая грамотность'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200">
              {language === 'uz' ? 'Annuitetmi yoki Differensial?' : 'Аннуитет или дифференцированный?'}
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {language === 'uz'
                ? 'Differensial to‘lovda dastlabki oylik to‘lovlar kattaroq bo‘lsa-da, umumiy foiz xarajatlari annuitetga qaraganda 10-25% gacha arzonroq tushishi mumkin.'
                : 'При дифференцированном графике переплата по процентам заметно меньше, но начальные платежи выше.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigate('tariff')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-between border border-slate-700 transition"
            >
              <span>{language === 'uz' ? 'Shartnomani tahlil qilish' : 'Анализ договора'}</span>
              <FileSearch className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div>
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {t.dashboard.featuresTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.dashboard.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Chat */}
          <div
            onClick={() => onNavigate('chat')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-teal-400 px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800">
                  {t.dashboard.cards.chat.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                {t.dashboard.cards.chat.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.chat.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-teal-400">
              <span>{language === 'uz' ? 'Savol berish' : 'Задать вопрос'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Calculator */}
          <div
            onClick={() => onNavigate('calculator')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
                  {t.dashboard.cards.calculator.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {t.dashboard.cards.calculator.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.calculator.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-cyan-400">
              <span>{language === 'uz' ? 'Kalkulyatorni ochish' : 'Открыть калькулятор'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Tariff Translator */}
          <div
            onClick={() => onNavigate('tariff')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                  <FileSearch className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-400 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                  {t.dashboard.cards.tariff.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                {t.dashboard.cards.tariff.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.tariff.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-blue-400">
              <span>{language === 'uz' ? 'Matnni tahlil qilish' : 'Анализировать текст'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Business Helper */}
          <div
            onClick={() => onNavigate('business')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800">
                  {t.dashboard.cards.business.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {t.dashboard.cards.business.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.business.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-amber-400">
              <span>{language === 'uz' ? 'Tadbirkorlar bo‘limi' : 'Для предпринимателей'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Complaint Builder */}
          <div
            onClick={() => onNavigate('complaint')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-400 px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800">
                  {t.dashboard.cards.complaint.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                {t.dashboard.cards.complaint.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.complaint.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-purple-400">
              <span>{language === 'uz' ? 'Ariza tayyorlash' : 'Составить заявление'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Fraud Check */}
          <div
            onClick={() => onNavigate('fraud')}
            className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800">
                  {t.dashboard.cards.fraud.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                {t.dashboard.cards.fraud.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t.dashboard.cards.fraud.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-rose-400">
              <span>{language === 'uz' ? 'Xavfni tekshirish' : 'Проверить сообщение'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Independence disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 max-w-4xl mx-auto">
        <p>{t.officialDisclaimer}</p>
      </div>
    </div>
  );
};
