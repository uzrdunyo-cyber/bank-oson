import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Send,
  AlertCircle,
  Building,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  Info,
} from 'lucide-react';
import { Language, ComplaintResult } from '../types';
import { translations } from '../locales/translations';

interface ComplaintBuilderPageProps {
  language: Language;
}

export const ComplaintBuilderPage: React.FC<ComplaintBuilderPageProps> = ({ language }) => {
  const t = translations[language];

  const [bankName, setBankName] = useState('');
  const [topic, setTopic] = useState(t.complaint.topics[0]);
  const [problemDetails, setProblemDetails] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplaintResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDetails.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          topic,
          problemDetails,
          dateOfIncident,
          transactionAmount,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error generating complaint:', err);
      // Fallback
      setResult({
        isDemo: true,
        letterText: `"${bankName || 'Tijorat banki'}" Boshqaruv raisi nomiga\nMurojaat etuvchi: [F.I.SH]\nManzil: [Yashash manzili]\nTelefon: [Telefon raqami]\n\nARIZA / SHIKOYAT\n\nMen, [F.I.SH], ${dateOfIncident ? `${dateOfIncident} sanasida ` : ''}bankingiz xizmatlaridan foydalanish jarayonida quyidagi muammoga duch keldim:\n${problemDetails}\n${transactionAmount ? `Tranzaksiya summasi: ${transactionAmount} so'm.\n` : ''}\nO‘zbekiston Respublikasining "Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida"gi hamda "Banklar va bank faoliyati to‘g‘risida"gi Qonunlariga muvofiq, murojaatimni ko‘rib chiqib, tushunarsiz komissiya/yechilgan mablag‘ bo‘yicha oydinlik kiritishingizni va qonuniy tartibda yozma javob berishingizni so‘rayman.\n\nIlova: Chek va pasport nusxalari.\nSana: ${new Date().toLocaleDateString('uz-UZ')}\nImzo: ____________`,
        checklist: [
          'Shaxsiy ma\'lumotlarni (F.I.SH, manzil, telefon) to\'ldirish',
          'Chek, to\'lov kvitansiyasi yoki bank ilovasi skrinshotini ilova qilish',
          'Arizani bank filialiga yoki rasmiy elektron pochtasiga yuborish',
        ],
        officialChannels: [
          { name: 'O‘zbekiston Respublikasi Markaziy banki Ishonch telefoni', contact: '1114' },
          { name: 'Yagona interaktiv davlat xizmatlari portali', contact: 'my.gov.uz' },
          { name: 'O‘zbekiston Respublikasi Prezidentining virtual qabulxonasi', contact: 'pm.gov.uz' },
        ],
        notice: t.complaint.disclaimer,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.letterText) return;
    navigator.clipboard.writeText(result.letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-teal-400" />
          <span>{t.complaint.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.complaint.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.complaint.bankNameLabel}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t.complaint.bankNamePlaceholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.complaint.topicLabel}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {t.complaint.topics.map((tp, i) => (
                  <option key={i} value={tp}>{tp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.complaint.detailsLabel} <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder={t.complaint.detailsPlaceholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.complaint.dateLabel}
                </label>
                <input
                  type="date"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.complaint.amountLabel}
                </label>
                <input
                  type="text"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="Masalan: 350 000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!problemDetails.trim() || loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition cursor-pointer mt-4"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? t.complaint.generating : t.complaint.generateBtn}</span>
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <span>{t.complaint.resultTitle}</span>
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.complaint.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.complaint.copyBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Letter Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {result.letterText}
              </div>

              {/* Checklist */}
              {result.checklist && result.checklist.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                    <Paperclip className="w-4 h-4" />
                    <span>{t.complaint.checklistTitle}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.checklist.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Channels */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.complaint.channelsTitle}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="text-[11px] text-slate-400">Markaziy bank ishonch telefoni:</div>
                    <div className="text-sm font-bold text-white mt-0.5">1114</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="text-[11px] text-slate-400">Yagona davlat portali:</div>
                    <div className="text-sm font-bold text-white mt-0.5">my.gov.uz</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="text-[11px] text-slate-400">Prezident portali:</div>
                    <div className="text-sm font-bold text-white mt-0.5">pm.gov.uz</div>
                  </div>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-[11px] text-amber-200/90 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{result.notice || t.complaint.disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                {language === 'uz' ? 'Murojaat matni bu yerda shakllanadi' : 'Здесь появится текст претензии'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {language === 'uz'
                  ? 'Chapdagi shaklga muammoingizni yozib, "Murojaat matnini tayyorlash" tugmasini bosing.'
                  : 'Заполните форму слева и нажмите "Составить официальный текст".'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
