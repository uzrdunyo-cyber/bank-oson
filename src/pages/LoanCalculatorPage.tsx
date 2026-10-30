import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  BookmarkPlus,
  HelpCircle,
  TrendingDown,
  Info,
  DollarSign,
  Calendar,
  Percent,
  CheckCircle,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Language, LoanType, LoanInput } from '../types';
import { translations } from '../locales/translations';
import { calculateLoan, formatUzbekCurrency } from '../utils/loanCalculator';
import { saveCalculation } from '../lib/supabaseClient';

interface LoanCalculatorPageProps {
  language: Language;
}

export const LoanCalculatorPage: React.FC<LoanCalculatorPageProps> = ({ language }) => {
  const t = translations[language];

  // Inputs
  const [amount, setAmount] = useState<number>(30000000);
  const [annualRate, setAnnualRate] = useState<number>(24);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [loanType, setLoanType] = useState<LoanType>('annuity');
  const [oneTimeFee, setOneTimeFee] = useState<number>(0);
  const [monthlyInsuranceRate, setMonthlyInsuranceRate] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Quick Amount Presets
  const amountPresets = [
    { label: '5 mln', value: 5000000 },
    { label: '20 mln', value: 20000000 },
    { label: '50 mln', value: 50000000 },
    { label: '100 mln', value: 100000000 },
    { label: '200 mln', value: 200000000 },
  ];

  const termPresets = [
    { label: '6 oy', value: 6 },
    { label: '12 oy (1 yil)', value: 12 },
    { label: '24 oy (2 yil)', value: 24 },
    { label: '36 oy (3 yil)', value: 36 },
    { label: '60 oy (5 yil)', value: 60 },
  ];

  // Calculation memo
  const loanInput: LoanInput = {
    amount,
    annualRate,
    termMonths,
    type: loanType,
    oneTimeFee,
    monthlyInsuranceRate,
  };

  const results = useMemo(() => calculateLoan(loanInput), [loanInput]);

  // Chart data sampled for readability
  const chartData = useMemo(() => {
    return results.schedule.map((item) => ({
      month: `${item.month}-${language === 'uz' ? 'oy' : 'мес'}`,
      payment: item.monthlyPayment,
      principal: item.principalPayment,
      interest: item.interestPayment,
      balance: item.remainingBalance,
    }));
  }, [results.schedule, language]);

  const handleSaveCalculation = () => {
    saveCalculation({
      amount,
      annualRate,
      termMonths,
      type: loanType,
      monthlyPayment: results.monthlyPayment,
      grandTotal: results.grandTotal,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportCsv = () => {
    const headers = ['Oy', 'Oylik to\'lov', 'Asosiy qarz', 'Foiz to\'lovi', 'Qoldiq qarz'];
    const rows = results.schedule.map((s) => [
      s.month,
      s.monthlyPayment,
      s.principalPayment,
      s.interestPayment,
      s.remainingBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kredit_grafigi_${amount}_som_${termMonths}_oy.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Calculator className="w-8 h-8 text-teal-400" />
          <span>{t.calculator.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.calculator.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Section */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>{language === 'uz' ? 'Kredit parametrlari' : 'Параметры кредита'}</span>
            <span className="text-xs font-normal text-teal-400">
              {loanType === 'annuity' ? 'Annuitet' : 'Differensial'}
            </span>
          </h2>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t.calculator.amountLabel}
              </label>
              <span className="text-sm font-extrabold text-teal-300">
                {formatUzbekCurrency(amount)} so‘m
              </span>
            </div>
            <input
              type="number"
              min={1000000}
              max={1000000000}
              step={1000000}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
            {/* Quick Amount presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {amountPresets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setAmount(p.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    amount === p.value
                      ? 'bg-teal-600 text-white border-teal-500 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t.calculator.rateLabel}
              </label>
              <span className="text-sm font-extrabold text-teal-300">
                {annualRate}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="flex-1 accent-teal-500"
              />
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm text-center text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Term in Months */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t.calculator.termLabel}
              </label>
              <span className="text-sm font-extrabold text-teal-300">
                {termMonths} {language === 'uz' ? 'oy' : 'мес.'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={120}
              step={1}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {termPresets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setTermMonths(p.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    termMonths === p.value
                      ? 'bg-teal-600 text-white border-teal-500 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loan Type Toggle (Annuity vs Differential) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              {t.calculator.typeLabel}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setLoanType('annuity')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  loanType === 'annuity'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.calculator.annuity}
              </button>
              <button
                type="button"
                onClick={() => setLoanType('differential')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  loanType === 'differential'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.calculator.differential}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {loanType === 'annuity' ? t.calculator.annuityTooltip : t.calculator.diffTooltip}
            </p>
          </div>

          {/* Optional Extra Fees */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300">
              {t.calculator.extraFeesTitle}
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {t.calculator.oneTimeFeeLabel}
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={oneTimeFee}
                onChange={(e) => setOneTimeFee(Math.max(0, Number(e.target.value)))}
                placeholder="0 so'm"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {t.calculator.insuranceRateLabel}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.05}
                value={monthlyInsuranceRate}
                onChange={(e) => setMonthlyInsuranceRate(Math.max(0, Number(e.target.value)))}
                placeholder="0 %"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Right Results & Analytics Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Monthly Payment */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">
                {t.calculator.monthlyPayment}
              </span>
              <div className="text-lg font-extrabold text-teal-300 mt-1">
                {loanType === 'annuity' ? (
                  `${formatUzbekCurrency(results.monthlyPayment)}`
                ) : (
                  <div className="text-sm">
                    {formatUzbekCurrency(results.monthlyPayment)} ...{' '}
                    <span className="text-teal-400 font-normal">
                      {formatUzbekCurrency(results.lastMonthlyPayment || 0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {loanType === 'annuity' ? 'Har oy teng miqdorda' : t.calculator.diffRange}
              </span>
            </div>

            {/* Total Interest */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">
                {t.calculator.totalInterest}
              </span>
              <div className="text-lg font-extrabold text-amber-400 mt-1">
                +{formatUzbekCurrency(results.totalInterest)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {((results.totalInterest / (amount || 1)) * 100).toFixed(1)}% ortiqcha to‘lov
              </span>
            </div>

            {/* Total Extra Fees */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-slate-400 font-medium block">
                {t.calculator.extraFees}
              </span>
              <div className="text-lg font-extrabold text-rose-300 mt-1">
                {formatUzbekCurrency(results.totalExtraFees)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Komissiya + sug‘urta
              </span>
            </div>

            {/* Full Cost (PSK) */}
            <div className="bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-800/80 rounded-2xl p-4 shadow-md">
              <span className="text-[11px] text-teal-300 font-semibold block">
                {t.calculator.grandTotal}
              </span>
              <div className="text-lg font-extrabold text-white mt-1">
                {formatUzbekCurrency(results.grandTotal)}
              </div>
              <span className="text-[10px] text-teal-300/80 mt-0.5 block">
                Kreditning to‘liq qiymati
              </span>
            </div>
          </div>

          {/* Visual Payment Breakdown Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'uz' ? 'Qarz qoldig‘i va to‘lovlar dinamikasi' : 'Динамика остатка долга и платежей'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'uz' ? 'Asosiy qarz va foiz to‘lovlarining oylar bo‘yicha nisbati' : 'Соотношение основного долга и процентов'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCalculation}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Saqlandi</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{t.calculator.saveCalc}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`${formatUzbekCurrency(Number(value))} so'm`, '']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name={language === 'uz' ? 'Qoldiq qarz' : 'Остаток долга'}
                    stroke="#14b8a6"
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={language === 'uz' ? 'Oylik foiz' : 'Проценты'}
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorInterest)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Formula & Assumptions explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-400">
              <Info className="w-4 h-4" />
              <span>{t.calculator.formulaTitle}</span>
            </div>
            <p className="leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-teal-200">
              {results.formulaExplanation}
            </p>
            <p className="text-slate-400 text-[11px] pt-1">
              {t.calculator.disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              {t.calculator.scheduleTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'uz'
                ? `Jami ${results.schedule.length} oylik batafsil to‘lovlar reja-jadvali`
                : `Подробный план платежей на ${results.schedule.length} месяцев`}
            </p>
          </div>

          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            {showFullSchedule
              ? (language === 'uz' ? 'Kamroq ko‘rsatish' : 'Свернуть')
              : (language === 'uz' ? 'Barcha oylarni ko‘rish' : 'Показать все месяцы')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.calculator.monthCol}</th>
                <th className="py-3 px-4 font-semibold">{t.calculator.paymentCol}</th>
                <th className="py-3 px-4 font-semibold">{t.calculator.principalCol}</th>
                <th className="py-3 px-4 font-semibold">{t.calculator.interestCol}</th>
                <th className="py-3 px-4 font-semibold">{t.calculator.balanceCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(showFullSchedule ? results.schedule : results.schedule.slice(0, 12)).map((row) => (
                <tr key={row.month} className="hover:bg-slate-850/50 transition">
                  <td className="py-2.5 px-4 font-medium text-slate-300">
                    {row.month}-{language === 'uz' ? 'oy' : 'мес'}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-teal-300">
                    {formatUzbekCurrency(row.monthlyPayment)} so‘m
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {formatUzbekCurrency(row.principalPayment)} so‘m
                  </td>
                  <td className="py-2.5 px-4 text-amber-400">
                    {formatUzbekCurrency(row.interestPayment)} so‘m
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {formatUzbekCurrency(row.remainingBalance)} so‘m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!showFullSchedule && results.schedule.length > 12 && (
            <div className="py-3 text-center text-xs text-slate-400 border-t border-slate-800">
              {language === 'uz'
                ? `Yana ${results.schedule.length - 12} ta oy mavjud. Barchasini ko‘rish uchun yuqoridagi tugmani bosing.`
                : `Еще ${results.schedule.length - 12} месяцев. Нажмите "Показать все месяцы", чтобы увидеть полный график.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
