import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Tag,
  AlertCircle,
  Building,
  CheckCircle,
} from 'lucide-react';
import { Language, OfficialSource } from '../types';
import { translations } from '../locales/translations';
import { fetchOfficialSources } from '../lib/supabaseClient';

interface SourcesPageProps {
  language: Language;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({ language }) => {
  const t = translations[language];
  const [sources, setSources] = useState<OfficialSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficialSources()
      .then((data) => setSources(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpenCheck className="w-8 h-8 text-teal-400" />
          <span>{t.sources.title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          {t.sources.subtitle}
        </p>
      </div>

      {/* Trust Notice Box */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-start gap-3.5 shadow-md">
        <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-teal-400 block">
            {language === 'uz' ? 'IShonchlilik va tekshiruv tamoyili' : 'ПРИНЦИП ДОСТОВЕРНОСТИ'}
          </span>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {t.sources.trustNote}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <span>Demo ma’lumot — haqiqiy bank taklifi emas</span>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-800/80">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{src.category}</span>
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{src.lastVerifiedAt}</span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mb-2">
                {src.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {src.shortDescription}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {src.url}
              </span>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition"
              >
                <span>{t.sources.visitBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
