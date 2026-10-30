import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  BookOpen,
  DollarSign,
  Clock,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Language, TariffAnalysisResult } from '../types';
import { translations } from '../locales/translations';

interface TariffTranslatorPageProps {
  language: Language;
}

export const TariffTranslatorPage: React.FC<TariffTranslatorPageProps> = ({ language }) => {
  const t = translations[language];

  // Presets
  const sampleContracts = [
    {
      title: t.tariff.sample1,
      text: `Bank qarz oluvchiga 20 000 000 so‘m miqdorida 24 oy muddatga yillik 26% stavkada iste’mol krediti ajratadi. To‘lovlar har oyning 15-sanasigacha annuitet tartibida amalga oshiriladi. Oylik to‘lov o‘z vaqtida amalga oshirilmagan taqdirda, kechiktirilgan har bir kun uchun muddati o‘tgan to‘lov summasining 0.5% miqdorida penya hisoblanadi. Muddati o‘tgan qarz 30 kundan oshsa, bank qarz oluvchining boshqa istalgan bankdagi plastik kartalari va hisobvaraqlaridan akseptsiz tartibda mablag‘ yechib olish huquqini saqlab qoladi. Garov sifatida qabul qilingan mulkni har yili qarz oluvchi hisobidan bank foydasiga sug‘urtalash majburiy hisoblanadi.`,
    },
    {
      title: t.tariff.sample2,
      text: `Kobrending bank kartasi chiqarish bepul. Kartaga oylik xizmat ko‘rsatish haqi 15 000 so‘m. Boshqa banklar bankomatlaridan naqd pul yechishda yechilayotgan summaning 1.5% miqdorida (kamida 5 000 so‘m) komissiya undiriladi. Xalqaro operatsiyalar va konvertatsiyada bank kursi bo‘yicha qo‘shimcha 1% kover-komissiya hisoblanadi. Karta hisobida minimal qoldiq 50 000 so‘m bo‘lishi lozim. Karta 6 oy davomida nofaol bo‘lsa, har oyda 20 000 so‘m ushlab qolinadi.`,
    },
    {
      title: t.tariff.sample3,
      text: `Mikroqarz skoring tizimi orqali 10 daqiqada ajratiladi. Foiz stavkasi kunlik 0.1% (yillik 36.5%). Kredit arizasini ko‘rib chiqish va limitni faollashtirish uchun bir martalik 3% miqdorida texnik komissiya olinadi. Majburiy shart: qarz oluvchi bank hamkori bo‘lgan sug‘urta kompaniyasidan qarz summasining 2% miqdoridagi baxtsiz hodisalardan sug‘urta polisini xarid qilishi shart. To‘lov kechiktirilganda kunlik jarima 1% ga oshiriladi.`,
    },
  ];

  const [contractText, setContractText] = useState(sampleContracts[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TariffAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'fees' | 'penalties' | 'risks' | 'glossary'>('summary');

  const handleAnalyze = async () => {
    if (!contractText.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/translate-tariff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText, language }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error analyzing tariff:', err);
      // Fallback result
      setResult({
        isDemo: true,
        summary: language === 'uz'
          ? 'Kredit shartnomasida qarz oluvchining oylik to‘lov majburiyatlari, to‘lov kechiktirilganda hisoblanadigan penya va kartalardan avtomatik pul yechib olish shartlari belgilangan.'
          : 'Договор устанавливает обязанности заемщика, порядок начисления пени и право банка на безакцептное списание средств.',
        commissionsAndFees: [
          'Har oylik xizmat ko‘rsatish to‘lovlari yoki karta komissiyasi',
          'Boshqa banklar orqali amalga oshiriladigan tranzaksiyalarda qo‘shimcha to‘lovlar',
        ],
        interestAndPenalties: [
          'Kechiktirilgan har bir kun uchun muddati o‘tgan summadan penya hisoblanadi',
          'Foiz stavkasi asosiy qarz qoldig‘iga nisbatan hisoblanadi',
        ],
        attentionRisks: [
          'Akseptsiz tartibda pul yechib olish (boshqa bank kartalaridan avtomatik yechish)',
          'Garov mulkini majburiy sug‘urtalash majburiyati',
        ],
        glossary: [
          { term: 'Annuitet', definition: 'Har oy teng miqdorda amalga oshiriladigan kredit to‘lovi' },
          { term: 'Penya', definition: 'Muddati o‘tgan to‘lov uchun kunlik hisoblanadigan jarima' },
          { term: 'Akseptsiz tartib', definition: 'Mijozning ruxsati yoki roziligisiz to‘g‘ridan-to‘g‘ri pul yechish huquqi' },
        ],
        disclaimer: t.tariff.disclaimer,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <FileSearch className="w-8 h-8 text-teal-400" />
          <span>{t.tariff.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.tariff.subtitle}
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            {t.tariff.inputLabel}
          </label>
          <textarea
            rows={6}
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder={t.tariff.placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition leading-relaxed"
          />
        </div>

        {/* Sample presets */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            {t.tariff.samplesTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleContracts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setContractText(sample.text)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleAnalyze}
            disabled={!contractText.trim() || loading}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/25 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? t.tariff.analyzing : t.tariff.analyzeBtn}</span>
          </button>
          <span className="text-xs text-slate-400">
            {contractText.length} belgi
          </span>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span>{t.tariff.resultsTitle}</span>
            </h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'summary' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tariff.summaryTab}
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'fees' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tariff.feesTab}
              </button>
              <button
                onClick={() => setActiveTab('penalties')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'penalties' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tariff.penaltiesTab}
              </button>
              <button
                onClick={() => setActiveTab('risks')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'risks' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tariff.risksTab}
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'glossary' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tariff.glossaryTab}
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          <div className="min-h-[160px]">
            {activeTab === 'summary' && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>Oddiy tildagi qisqa mazmun</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Komissiya va qo‘shimcha to‘lov bandlari:
                </h4>
                {result.commissionsAndFees.length > 0 ? (
                  <ul className="space-y-2">
                    {result.commissionsAndFees.map((fee, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
                        <DollarSign className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{fee}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Matnda qo‘shimcha komissiyalar topilmadi.</p>
                )}
              </div>
            )}

            {activeTab === 'penalties' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Foizlar, muddatlar va jarimalar (penya):
                </h4>
                {result.interestAndPenalties.length > 0 ? (
                  <ul className="space-y-2">
                    {result.interestAndPenalties.map((pen, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{pen}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Matnda penya bandlari aniqlanmadi.</p>
                )}
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Alohida e’tibor qaratilishi lozim bo‘lgan shartlar:</span>
                </h4>
                <ul className="space-y-2">
                  {result.attentionRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'glossary' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Matndagi bank atamalari va ularning oddiy izohi:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.glossary.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="text-xs font-bold text-teal-300">{item.term}</div>
                      <div className="text-xs text-slate-300">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legal Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
