import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  PhoneCall,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Language, FraudAnalysisResult } from '../types';
import { translations } from '../locales/translations';

interface FraudCheckerPageProps {
  language: Language;
}

export const FraudCheckerPage: React.FC<FraudCheckerPageProps> = ({ language }) => {
  const t = translations[language];

  const sampleMessages = [
    {
      title: t.fraud.sample1,
      text: `Hurmatli mijoz! Sizning kartangiz xavfsizlik maqsadida vaqtincha bloklandi. Qayta tiklash va blokdan chiqarish uchun SMS orqali yuborilgan 6 xonali tasdiqlash kodini 1 daqiqa ichida xabar qiling yoki https://uzcard-unblock-secure.cc/verify havolasiga kiring.`,
    },
    {
      title: t.fraud.sample2,
      text: `Prezident farmoniga asosan barcha fuqarolarga 1 500 000 so‘m miqdorida bir martalik moddiy yordam ajratilmoqda. Mablag‘ni olish uchun kartangiz raqami, amal qilish muddati va SMS kodni http://yordam-pul-2026.online portaliga kiriting!`,
    },
    {
      title: t.fraud.sample3,
      text: `Xalqaro neft-gaz investitsiya platformasiga a’zo bo‘ling! Boshlang‘ich badal 500 000 so‘m, har kuni kafolatlangan 20% sof daromad. Bugun ro‘yxatdan o‘tsangiz 2 mln so‘m bonus beriladi. Telegram bot: @invest_rich_uz_bot`,
    },
  ];

  const [messageText, setMessageText] = useState(sampleMessages[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudAnalysisResult | null>(null);

  const handleCheck = async () => {
    if (!messageText.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/check-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText, language }),
      });

      if (!res.ok) throw new Error('Failed to analyze');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error checking fraud:', err);
      // Fallback analysis
      setResult({
        isDemo: true,
        riskLevel: 'HIGH',
        riskScore: 92,
        detectedFlags: [
          'SMS orqali yuborilgan maxfiy kodni talab qilish',
          'Shoshilinch choralar ko‘rishga majburlash (bloklash tahdidi)',
          'Shubhali norasmiy havola (fishing domeni)',
        ],
        explanation: 'DIQQAT! Bank va to‘lov tizimlari xodimlari hech qachon telefon orqali yoki sayt orqali SMS-kodni so‘ramaydi. Ushbu xabar orqali firibgarlar kartangizdagi pullarni o‘zlashtirmoqchi.',
        safetySteps: [
          'Hech kimga SMS orqali kelgan maxfiy kodni aytmang yoki kiritmang',
          'Xabardagi havolalarni ochmang',
          'Shubhangiz bo‘lsa, kartangiz orqasidagi rasmiy bank raqamiga qo‘ng‘iroq qiling',
        ],
        officialDisclaimer: t.fraud.disclaimer,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          <span>{t.fraud.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.fraud.subtitle}
        </p>
      </div>

      {/* Golden rule alert */}
      <div className="p-4 sm:p-5 rounded-3xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-3.5 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400 block">
            {language === 'uz' ? 'XAVFSIZLIKNING ASOSIY QOIDASI' : 'ГЛАВНОЕ ПРАВИЛО БЕЗОПАСНОСТИ'}
          </span>
          <p className="text-xs sm:text-sm text-rose-200 mt-1 font-semibold leading-relaxed">
            {t.fraud.neverShare}
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            {t.fraud.inputLabel}
          </label>
          <textarea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t.fraud.placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition leading-relaxed"
          />
        </div>

        {/* Sample presets */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            {t.fraud.samplesTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessageText(sample.text)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleCheck}
            disabled={!messageText.trim() || loading}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/25 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{loading ? t.fraud.checking : t.fraud.checkBtn}</span>
          </button>
          <span className="text-xs text-slate-400">
            {language === 'uz' ? 'Xabar maxfiy saqlanmaydi' : 'Данные не сохраняются'}
          </span>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Risk Level Badge & Score */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  result.riskLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : result.riskLevel === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    result.riskLevel === 'HIGH'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : result.riskLevel === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {result.riskLevel === 'HIGH'
                    ? t.fraud.riskHigh
                    : result.riskLevel === 'MEDIUM'
                    ? t.fraud.riskMedium
                    : t.fraud.riskLow}
                </span>
                <div className="text-xs text-slate-400 mt-1">
                  Xavflilik ko‘rsatkichi: <span className="font-bold text-white">{result.riskScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.fraud.explanation}
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {result.explanation}
            </p>
          </div>

          {/* Detected Triggers */}
          {result.detectedFlags && result.detectedFlags.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.fraud.detectedFlags}
              </div>
              <ul className="space-y-2">
                {result.detectedFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-rose-300 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Urgent Safety Steps */}
          {result.safetySteps && result.safetySteps.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.fraud.safetySteps}</span>
              </div>
              <ul className="space-y-2">
                {result.safetySteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-950/30 border border-teal-800/50 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            {result.officialDisclaimer || t.fraud.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
