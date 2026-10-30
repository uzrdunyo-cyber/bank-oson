import { OfficialSource, FeedbackSubmission } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

const DEFAULT_SOURCES: OfficialSource[] = [
  {
    id: '1',
    name: 'O‘zbekiston Respublikasi Markaziy banki',
    shortDescription: 'Barcha banklarning bosh davlat regulyatori. Rasmiy valyuta kurslari, kredit stavkalari sharhlari va yangiliklar.',
    url: 'https://cbu.uz/',
    category: 'Regulyator',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '2',
    name: 'Markaziy bank: Iste’molchilar huquqlarini himoya qilish xizmati',
    shortDescription: 'Bank xizmatlari iste’molchilari murojaatlarini ko‘rib chiqish, noqonuniy komissiyalardan himoyalanish va ishonch telefoni: 1114.',
    url: 'https://cbu.uz/oz/consumer-protection/',
    category: 'Iste’molchi huquqlari',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '3',
    name: 'Lex.uz — Qonunchilik ma’lumotlari milliy bazasi',
    shortDescription: 'Banklar, iste’mol krediti, garov va fuqarolar murojaatlari to‘g‘risidagi qonunlarning eng oxirgi tahrirlari.',
    url: 'https://lex.uz/',
    category: 'Qonunchilik',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '4',
    name: 'O‘zbekiston Banklar Assotsiatsiyasi (UBA)',
    shortDescription: 'Tijorat banklari faoliyatini muvofiqlashtirish, xalqaro hamkorlik va bank xizmatlari standartlari.',
    url: 'https://uba.uz/',
    category: 'Bank tarmog‘i',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '5',
    name: 'Xalqaro Valyuta Jamg‘armasi (IMF)',
    shortDescription: 'O‘zbekiston iqtisodiyoti va bank sektorining barqarorligi bo‘yicha mustaqil hisobotlar va tahlillar.',
    url: 'https://www.imf.org/',
    category: 'Xalqaro moliya',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '6',
    name: 'Jahon banki (World Bank)',
    shortDescription: 'O‘zbekistonda moliyaviy ochiqlik, kichik biznesni qo‘llab-quvvatlash va ijtimoiy dasturlar.',
    url: 'https://www.worldbank.org/',
    category: 'Xalqaro moliya',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
  {
    id: '7',
    name: 'Yagona interaktiv davlat xizmatlari portali (my.gov.uz)',
    shortDescription: 'Davlat idoralari va bank tizimiga rasmiy ariza va shikoyatlarni elektron yuborish davlat portali.',
    url: 'https://my.gov.uz/',
    category: 'Davlat xizmatlari',
    verified: true,
    lastVerifiedAt: '2026-10-27',
  },
];

export async function fetchOfficialSources(): Promise<OfficialSource[]> {
  // If Supabase is connected in the future, can fetch via REST API
  // Otherwise return verified local source records
  return DEFAULT_SOURCES;
}

export async function submitFeedback(data: FeedbackSubmission): Promise<{ success: boolean; isDemo: boolean }> {
  try {
    const feedbackList = JSON.parse(localStorage.getItem('bank_oson_feedback') || '[]');
    feedbackList.push({
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('bank_oson_feedback', JSON.stringify(feedbackList));
    return { success: true, isDemo: !isSupabaseConfigured };
  } catch (err) {
    console.error('Error saving feedback:', err);
    return { success: false, isDemo: true };
  }
}

export function getSavedCalculations(): any[] {
  try {
    return JSON.parse(localStorage.getItem('bank_oson_saved_calcs') || '[]');
  } catch {
    return [];
  }
}

export function saveCalculation(calc: any): void {
  try {
    const list = getSavedCalculations();
    list.unshift({ ...calc, id: Date.now().toString(), savedAt: new Date().toISOString() });
    localStorage.setItem('bank_oson_saved_calcs', JSON.stringify(list.slice(0, 10)));
  } catch (err) {
    console.error('Failed to save calculation:', err);
  }
}
