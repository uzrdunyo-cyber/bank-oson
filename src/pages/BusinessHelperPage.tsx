import React, { useState } from 'react';
import {
  Briefcase,
  FileCheck,
  TrendingUp,
  HelpCircle,
  CheckSquare,
  DollarSign,
  AlertCircle,
  Building,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';
import { formatUzbekCurrency } from '../utils/loanCalculator';

interface BusinessHelperPageProps {
  language: Language;
}

export const BusinessHelperPage: React.FC<BusinessHelperPageProps> = ({ language }) => {
  const t = translations[language];

  const [selectedType, setSelectedType] = useState(t.business.types[0]);
  const [selectedTurnover, setSelectedTurnover] = useState(t.business.turnovers[1]);
  const [selectedPurpose, setSelectedPurpose] = useState(t.business.purposes[0]);

  // Interactive P&L / Cash flow simple planner
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(35000000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(23000000);

  const netProfit = Math.max(0, monthlyRevenue - monthlyExpenses);
  const maxSafeMonthlyPayment = Math.round(netProfit * 0.5); // DTI recommended safe boundary

  const [completedDocs, setCompletedDocs] = useState<Record<number, boolean>>({});
  const [completedQuestions, setCompletedQuestions] = useState<Record<number, boolean>>({});

  const requiredDocuments = [
    {
      title: 'Davlat ro‘yxatidan o‘tganlik to‘g‘risida guvohnoma (YATT yoki MCHJ)',
      detail: 'Yagona darcha orqali berilgan QR-kodli elektron guvohnoma nusxasi.',
    },
    {
      title: 'So‘nggi 12 oylik bank hisobvaraqlaridagi pul aylanmalari (Vipiska)',
      detail: 'Mablag‘lar harakati va doimiy mijozlar bilan hisob-kitoblar ko‘rsatkichi.',
    },
    {
      title: 'Soliq hisobotlari va soliqdan qarz yo‘qligi haqida ma’lumotnoma',
      detail: 'my.soliq.uz orqali olingan soliq deklaratsiyalari va to‘lov cheklari.',
    },
    {
      title: 'Kredit maqsadini tasdiqlovchi shartnomalar yoki invoyslar',
      detail: 'Xarid qilinayotgan tovar, xomashyo yoki asbob-uskunaning yetkazib beruvchi bilan tuzilgan shartnomasi.',
    },
    {
      title: 'Garov ta’minoti hujjatlari (agar garov talab etilsa)',
      detail: 'Ko‘chmas mulk kadastri, avtotransport tex-pasporti yoki uchinchi shaxs kafilligi.',
    },
    {
      title: 'Oddiy biznes-reja va pul oqimlari (Cash Flow) prognozi',
      detail: 'Kredit qanday qilib o‘zini oqlashi va qaysi daromad manbaidan qaytarilishi reja-jadvali.',
    },
  ];

  const interviewQuestions = [
    'Kreditning to‘liq haqiqiy qiymati (PSK) barcha komissiyalar bilan qancha foizni tashkil qiladi?',
    'Kredit bo‘yicha to‘lov usuli qanday: Annuitetmi yoki Differensialmi?',
    'Kredit arizasini ko‘rib chiqish, hisob ochish yoki naqdlashtirish uchun komissiya bormi?',
    'Mablag‘larni o‘zlashtirish va asosiy qarz bo‘yicha imtiyozli davr (Grace period) beriladimi?',
    'Muddati kelmasdan oldin to‘liq yoki qisman yopishda jarima yoki taqiq bormi?',
    'Garov mulkini sug‘urtalash qaysi sug‘urta kompaniyasida va qancha stavkada amalga oshiriladi?',
    'Kredit qarorini qabul qilishning rasmiy muddati qancha kun?',
    'Kredit liniyasi qayta tiklanuvchimi (revolving) yoki bir martalikmi?',
    'Daromad kutilganidan kamaysa, restrukturizatsiya qilish imkoni bormi?',
    'Agar YATT yoki MCHJ rahbari kafil bo‘lsa, oila a’zolarining roziligi shartmi?',
  ];

  const comparisonChecklist = [
    'Nominal stavka emas, barcha xarajatlar bilan to‘liq qiymatni (PSK) solishtirdim',
    'Imtiyozli davr (3-6 oy faqat foiz to‘lash) mavjudligini tekshirdim',
    'Garovning garov bahosi kredit summasining kamida 125-130% ini qoplashiga amin bo‘ldim',
    'Oylik to‘lov kompaniyaning sof foydasining 50% idan oshmasligini hisoblab chiqdim',
    'Erta yopishda komissiya yo‘qligini shartnomadan o‘qidim',
  ];

  const toggleDoc = (idx: number) => {
    setCompletedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleQuestion = (idx: number) => {
    setCompletedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-teal-400" />
          <span>{t.business.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.business.subtitle}
        </p>
      </div>

      {/* Configuration selections */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {t.business.businessTypeLabel}
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {t.business.types.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {t.business.turnoverLabel}
          </label>
          <select
            value={selectedTurnover}
            onChange={(e) => setSelectedTurnover(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {t.business.turnovers.map((to, i) => (
              <option key={i} value={to}>{to}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {t.business.purposeLabel}
          </label>
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {t.business.purposes.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cash Flow / P&L Express Planner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-white">
            {t.business.pnlTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t.business.incomeLabel}
              </label>
              <input
                type="number"
                step={1000000}
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 font-semibold"
              />
              <span className="text-[11px] text-teal-400 mt-1 block">
                {formatUzbekCurrency(monthlyRevenue)} so‘m
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {t.business.expenseLabel}
              </label>
              <input
                type="number"
                step={1000000}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 font-semibold"
              />
              <span className="text-[11px] text-amber-400 mt-1 block">
                {formatUzbekCurrency(monthlyExpenses)} so‘m
              </span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400">{t.business.netProfit}</span>
                <div className="text-2xl font-extrabold text-teal-300 mt-1">
                  {formatUzbekCurrency(netProfit)} so‘m
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">{t.business.repaymentCapacity}</span>
                <div className="text-xl font-bold text-white mt-1">
                  ~ {formatUzbekCurrency(maxSafeMonthlyPayment)} so‘m
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Banklar biznes aylanmasi va foydasining 50% dan ortig‘i kredit to‘loviga yo‘naltirilishiga odatda ruxsat bermaydi (Debt-to-Income normasi).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Document Checklist & 10 Interview Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-400" />
              <span>{t.business.docsTitle}</span>
            </h3>
            <span className="text-xs text-teal-400 font-semibold">
              {Object.values(completedDocs).filter(Boolean).length} / {requiredDocuments.length}
            </span>
          </div>

          <div className="space-y-3">
            {requiredDocuments.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => toggleDoc(idx)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  completedDocs[idx]
                    ? 'bg-teal-950/40 border-teal-800/80 text-teal-200'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                  completedDocs[idx] ? 'bg-teal-600 border-teal-500 text-white' : 'border-slate-600'
                }`}>
                  {completedDocs[idx] && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold">{doc.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{doc.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10 Interview Questions for Loan Officer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>{t.business.questionsTitle}</span>
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">
              {Object.values(completedQuestions).filter(Boolean).length} / {interviewQuestions.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {interviewQuestions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => toggleQuestion(idx)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  completedQuestions[idx]
                    ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200 line-through opacity-70'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <span className="text-xs font-bold text-cyan-400 flex-shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-xs leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-teal-400" />
          <span>{t.business.checklistTitle}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {comparisonChecklist.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center">
          {t.business.disclaimer}
        </div>
      </div>
    </div>
  );
};
