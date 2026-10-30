import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// System instructions for the Bank Oson AI
const BANK_ADVISOR_SYSTEM_PROMPT = `
Siz 'Bank Oson AI' platformasining O'zbekiston bank va moliya xizmatlari bo'yicha mustaqil, xolis va tushunarli tilda maslahat beruvchi ekspertisiz.
Vazifangiz:
1. O'zbekiston Respublikasi fuqarolari va kichik tadbirkorlariga bank xizmatlarini (kreditlar, omonatlar, kartalar, komissiyalar, to'lovlar, valyuta amaliyotlari) oddiy, tushunarli va imloviy to'g'ri o'zbek tilida (yoki savol rus tilida bo'lsa, rus tilida) tushuntirish.
2. Oddiy va hayotiy misollar keltirish (masalan: 10 mln so'm kredit olinganda foiz va komissiya hisobi).
3. Tegishli bo'lganda O'zbekiston Respublikasi Markaziy banki (cbu.uz), "Banklar va bank faoliyati to'g'risida"gi yoki "Iste'mol krediti to'g'risida"gi qonunlarga havola bering.
4. Qat'iy qoidalar:
   - Hech qachon bank nomidan kafolatlangan kredit yoki tasdiqlanmagan foiz stavkalarini to'qib chiqarmang.
   - Foydalanuvchiga moliyaviy daromad kafolatlamang.
   - Joriy stavkalar banklar bo'yicha o'zgarishi mumkinligini va yakuniy qaror bank kredit qo'mitasida qabul qilinishini eslating.
   - Hech qachon foydalanuvchidan shaxsiy karta raqami, PIN-kod yoki SMS-kod so'ramang.
`;

// Helper: Demo Fallback responses when API key is not present or API fails
function getDemoChatResponse(prompt: string, lang: 'uz' | 'ru' = 'uz'): { text: string; sources: string[]; isDemo: boolean } {
  const p = prompt.toLowerCase();
  if (lang === 'ru') {
    if (p.includes('процент') || p.includes('кредит') || p.includes('переплат')) {
      return {
        text: `Общая стоимость кредита состоит не только из номинальной годовой ставки, но и из сопутствующих расходов:
1. Номинальные проценты — плата за пользование деньгами (например, 24% годовых).
2. Единовременные комиссии — комиссия за рассмотрение, выдачу или кассовое обслуживание (если предусмотрено тарифом).
3. Страхование — часто обязательно при автокредите или ипотеке.
4. Оценка и нотариальное оформление залога.

По закону РУз «О потребительском кредите», банк обязан предоставить Памятку заемщика с указанием Полной стоимости кредита (ПСК). Всегда проверяйте график платежей до подписания договора.`,
        sources: ['Центральный банк РУз (cbu.uz)', 'lex.uz — Закон о потребительском кредите'],
        isDemo: true,
      };
    }
    return {
      text: `Здравствуйте! Я виртуальный финансовый консультант Bank Oson AI. Моя задача — помочь вам разобраться в банковских тарифах, кредитных договорах, защите от мошенников и подготовить обращение в банк на понятном языке. Задайте любой вопрос касательно банковских услуг Узбекистана!`,
      sources: ['Центральный банк РУз (cbu.uz)'],
      isDemo: true,
    };
  }

  // Uzbek fallback
  if (p.includes('penya') || p.includes('jarima')) {
    return {
      text: `**Penya nima?**
Penya — bu to'lov muddatini kechiktirganlik uchun bank tomonidan belgilanadigan kunlik moliyaviy jarima.
- Agar siz oylik kredit to'lovini belgilangan sanada to'lamasangiz, kechiktirilgan har bir kun uchun shartnomada ko'rsatilgan foizda (odatda 0.1% - 0.5%) penya hisoblanadi.
- **Muhim me'yor:** O'zbekiston Respublikasi Fuqarolik kodeksi va Markaziy bank qoidalariga ko'ra, penyaning umumiy miqdori asosiy qarz summasidan oshib ketishi mumkin emas.
- Agar kutilmagan vaziyat yuzaga kelsa, bankka oldindan rasmiy ariza bilan murojaat qilib, kredit ta'tili yoki muddatni uzaytirishni (restrukturizatsiya) so'rash tavsiya etiladi.`,
      sources: ['O‘zbekiston Respublikasi Fuqarolik kodeksi', 'Markaziy bank me’yoriy hujjatlari (cbu.uz)'],
      isDemo: true,
    };
  }

  if (p.includes('komissiya') || p.includes('xarajat')) {
    return {
      text: `**Bank komissiyasi nimani anglatadi?**
Bank komissiyasi — bu bank tomonidan ko'rsatilgan aniq xizmat (masalan, pul o'tkazish, naqd pul yechish, hisobvaraq ochish yoki kredit ajratish) uchun olinadigan xizmat haqidir.
E'tibor berish kerak bo'lgan asosiy jihatlar:
1. **Yashirin komissiyalar:** Ba'zi shartnomalarda past foiz stavkasi ko'rsatilib, har oylik xizmat ko'rsatish komissiyasi qo'shiladi. Bu kreditning haqiqiy qiymatini oshiradi.
2. **Qonuniy talab:** Markaziy bank talabiga ko'ra, banklar kredit ajratishdan oldin mijozga **"Kreditning to'liq qiymati varaqasi" (PSK)**ni taqdim etishi va barcha to'lovlarni ochiq ko'rsatishi shart.`,
      sources: ['O‘zbekiston Respublikasi Markaziy banki (cbu.uz)', 'lex.uz'],
      isDemo: true,
    };
  }

  if (p.includes('kredit') || p.includes('hisoblanadi') || p.includes('xarajat')) {
    return {
      text: `**Kreditning haqiqiy xarajati qanday hisoblanadi?**
Kredit faqat yillik foiz stavkasidan iborat emas. Haqiqiy to'liq xarajat quyidagilarni o'z ichiga oladi:
1. **Asosiy qarz va yillik foiz:** Masalan, 20 mln so'm 24% yillik stavkada 12 oyga annuitet usulida olinsa, faqat foiz xarajati taxminan 2.7 mln so'mni tashkil etadi.
2. **Bir martalik to'lovlar:** Shartnomani rasmiylashtirish yoki limit ajratish komissiyasi.
3. **Sug'urta to'lovi:** Iste'mol yoki avtokreditlarda ko'pincha majburiy bo'lib, kredit summasining 1-2% ini tashkil etishi mumkin.
4. **Garov xarajatlari:** Garovni mustaqil baholovchi xizmati va notarial tasdiqlash xarajatlari.

Kredit olishdan avval doimo bankdan **"To'lovlarning to'liq grafigi"**ni so'rang va "Annuitet" hamda "Differensial" to'lov usullarini solishtiring.`,
      sources: ['Markaziy bank: Iste’molchilar huquqlarini himoya qilish xizmati', 'cbu.uz'],
      isDemo: true,
    };
  }

  if (p.includes('murojaat') || p.includes('shikoyat') || p.includes('yozaman')) {
    return {
      text: `**Bankka rasmiy murojaat yoki shikoyat qanday yoziladi?**
1. **Ariza kimga yo'naltiriladi:** Bank Boshqaruv raisi yoki filial boshqaruvchisi nomiga.
2. **Mazmun:** O'zbekiston Respublikasining "Jismoniy va yuridik shaxslarning murojaatlari to'g'risida"gi qonuniga asosan, arizangizda:
   - To'liq F.I.SH, yashash manzilingiz va telefon raqamingiz;
   - Muammoning aniq sanasi, tranzaksiya summasi va kartangizning oxirgi 4 ta raqami (PIN-kod aslo yozilmaydi!);
   - Aniq talabingiz (masalan, "Asossiz yechilgan 150 000 so'mni qaytarish").
3. **Ilova:** Bank kvitansiyasi, chek yoki ilovadagi skrinshot ilova qilinishi kerak.
4. **Platformadagi vosita:** Siz bizning "Murojaat & Shikoyat" bo'limimizda tayyor qonuniy rasmiy andozani bir necha soniyada yaratib, nusxalab olishingiz mumkin!`,
      sources: ['O‘zbekiston Respublikasi Qonuni (lex.uz)', 'Markaziy bank ishonch telefoni: 1114'],
      isDemo: true,
    };
  }

  if (p.includes('oldin') || p.includes('e’tibor') || p.includes('e\'tibor') || p.includes('maslahat')) {
    return {
      text: `**Kredit olishdan oldin nimalarga e’tibor berish kerak? (Asosiy qoidalar):**
1. **Kreditning to'liq qiymati (PSK):** Faqat reklama qilinayotgan foizga emas, barcha sug'urta va komissiyalarni o'z ichiga olgan haqiqiy to'liq stavkaga qarang.
2. **Daromad va qarz yuki (DTI):** Oylik kredit to'lovingiz oilaviy sof daromadingizning 40-50% idan oshmasligi kerak. Aks holda moliyaviy qiyinchilikka uchrash ehtimoli yuqori.
3. **To'lov turi:** Annuitet yoki differensial to'lov usulini tanlash. Agar imkoningiz bo'lsa, differensial to'lov umumiy foiz xarajatini sezilarli kamaytiradi.
4. **Erta so'ndirish shartlari:** Muddatidan oldin kreditni yopishda jarima yoki komissiya yo'qligini tekshiring.
5. **Garov va sug'urta:** Garov baholash va har yillik sug'urta to'lovlari qancha turishini oldindan hisoblang.`,
      sources: ['Markaziy bank me’yoriy hujjatlari (cbu.uz)', 'lex.uz — Iste’mol krediti to‘g‘risidagi qonun'],
      isDemo: true,
    };
  }

  if (p.includes('garov') || p.includes('kafil') || p.includes('ipoteka')) {
    return {
      text: `**Kreditda garov va kafillik talablari:**
1. **Garov ta'minoti:** Odatda kredit summasining kamida 125-130% ini qoplashi lozim (masalan, 100 mln so'm kredit uchun kamida 125-130 mln so'mlik ko'chmas mulk yoki avtotransport).
2. **Kafillik:** Uchinchi shaxs (tanish yoki qarindosh) kafil bo'lsa, qarz oluvchi to'lay olmagan taqdirda, bank qarzni kafilning oyligidan yoki hisobidan ushlab qolishga qonunan haqlidir.
3. **Garov sug'urtasi:** Garovga qo'yilgan mulk kredit to'liq to'languncha bank foydasiga majburiy tartibda sug'urtalanadi.`,
      sources: ['O‘zbekiston Respublikasi Fuqarolik kodeksi', 'cbu.uz'],
      isDemo: true,
    };
  }

  return {
    text: `Assalomu alaykum! Men Bank Oson AI moliyaviy maslahatchisiman.
Bank xizmatlari, kredit shartnomalari, to'lovlar, komissiyalar, penya yoki bankka rasmiy murojaat yozish bo'yicha istalgan savolingizni berishingiz mumkin.
Sizga sodda, qonuniy asoslangan va mustaqil ma'lumot berishga tayyorman.`,
    sources: ['O‘zbekiston Respublikasi Markaziy banki (cbu.uz)'],
    isDemo: true,
  };
}

// Helper: generateContent with resilient timeout
async function generateWithTimeout(params: any, timeoutMs = 3500): Promise<any> {
  if (!ai) throw new Error('AI not configured');
  const callPromise = ai.models.generateContent(params);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
  );
  return Promise.race([callPromise, timeoutPromise]);
}

// 1. API: AI Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], language = 'uz' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      const demo = getDemoChatResponse(message, language);
      return res.json({
        reply: demo.text,
        sources: demo.sources,
        isDemo: true,
        note: 'Demo rejim — Gemini API kaliti aniqlanmagan, namunaviy mustaqil javob berildi.',
      });
    }

    // Call Gemini 3.8 Flash with timeout
    const formattedHistory = conversationHistory.slice(-6).map((c: { role: string; content: string }) => ({
      role: c.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: c.content }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [
          {
            text: `[Til: ${language === 'ru' ? 'Rus tili' : 'Oʻzbek tili'}]. Foydalanuvchi savoli: ${message}`,
          },
        ],
      },
    ];

    const response = await generateWithTimeout({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: BANK_ADVISOR_SYSTEM_PROMPT,
        temperature: 0.3,
      },
    }, 4000);

    const reply = response.text || '';
    return res.json({
      reply,
      sources: ['O‘zbekiston Respublikasi Markaziy banki (cbu.uz)', 'lex.uz'],
      isDemo: false,
    });
  } catch (error: any) {
    console.warn('Fallback to demo chat response due to:', error?.message || error);
    const demo = getDemoChatResponse(req.body.message || '', req.body.language || 'uz');
    return res.json({
      reply: demo.text,
      sources: demo.sources,
      isDemo: true,
      errorNotice: 'AI xizmati yuqori talabda bo‘lganligi sababli, namunaviy tahlil taqdim etildi.',
    });
  }
});

// Helper for Tariff analysis
function getDemoTariffAnalysis(contractText: string, language: 'uz' | 'ru' = 'uz') {
  return {
    isDemo: true,
    summary: language === 'ru'
      ? 'Представленный текст регулирует условия пользования банковским продуктом. В тексте отражены обязательства сторон, процентные выплаты и штрафные санкции.'
      : 'Ushbu taqdim etilgan matn bank xizmatidan (kredit yoki karta xizmati) foydalanish shartlarini belgilaydi. Unda mijozning to\'lov majburiyatlari, foizlar va to\'lov kechiktirilgandagi javobgarlik bayon etilgan.',
    commissionsAndFees: [
      language === 'ru' ? 'Единовременная комиссия за рассмотрение заявки (при наличии)' : 'Arizani ko\'rib chiqish yoki shartnomani rasmiylashtirish uchun bir martalik to\'lov',
      language === 'ru' ? 'Комиссия за безналичный перевод или снятие наличных средств' : 'Hisobdan naqd pul yechish yoki o\'tkazmalar uchun komissiya foizi',
      language === 'ru' ? 'Плата за смс-информирование или ежемесячное обслуживание счета' : 'SMS-xabarnoma yoki kartani har oylik xizmat ko\'rsatish to\'lovi',
    ],
    interestAndPenalties: [
      language === 'ru' ? 'Процентная ставка начисляется ежедневно на остаток основного долга' : 'Yillik foiz stavkasi asosiy qarz qoldig\'iga har kuni hisoblanadi',
      language === 'ru' ? 'Пеня за каждый день просрочки: от 0.1% до 0.5% от суммы просроченного платежа' : 'To\'lov kechiktirilgan har bir kun uchun penya (kuniga 0.1% dan 0.5% gacha)',
    ],
    attentionRisks: [
      language === 'ru' ? 'Банк оставляет за собой право безакцептного списания средств при наличии задолженности' : 'Bank to\'lov muddati o\'tganda mijozning boshqa kartalaridan avtomatik (akseptsiz) pul yechib olish huquqiga ega bo\'lishi mumkin',
      language === 'ru' ? 'Обязательное страхование предмета залога на весь срок кредитования' : 'Garov mulkini butun kredit muddati davomida majburiy sug\'urtalash talabi',
    ],
    glossary: [
      { term: 'Annuitet', definition: language === 'ru' ? 'Ежемесячный платеж равными суммами на протяжении всего срока кредита' : 'Kredit muddati davomida har oy bir xil teng miqdorda to\'lanadigan to\'lov usuli' },
      { term: 'Penya', definition: language === 'ru' ? 'Штраф за нарушение сроков обязательного платежа' : 'To\'lov muddati buzilgan har bir kun uchun hisoblanadigan jarima to\'lovi' },
      { term: 'PSK (To\'liq qiymat)', definition: language === 'ru' ? 'Полная стоимость кредита, включающая все комиссии и страховки' : 'Kreditning barcha foiz, komissiya va qo\'shimcha xarajatlarini o\'z ichiga olgan haqiqiy to\'liq qiymati' },
    ],
    disclaimer: language === 'ru'
      ? 'Данный анализ сгенерирован автоматически и не является официальным юридическим заключением. Перед подписанием внимательно изучите официальный договор банка.'
      : 'Ushbu tahlil avtomatik dastur tomonidan tayyorlangan bo\'lib, rasmiy yuridik xulosa o\'rnini bosmaydi. Shartnoma imzolashdan oldin bank xodimidan barcha noaniq bandlarni so\'rab oling.',
  };
}

// 2. API: Translate Tariff & Contract
app.post('/api/ai/translate-tariff', async (req: Request, res: Response) => {
  const { contractText, language = 'uz' } = req.body;
  if (!contractText || typeof contractText !== 'string') {
    return res.status(400).json({ error: 'Contract text is required' });
  }

  try {
    if (!ai) {
      return res.json(getDemoTariffAnalysis(contractText, language));
    }

    const prompt = `
Siz bank shartnomalari va tariflarini oddiy xalq tilida tahlil qiluvchi mutaxassissiz.
Quyidagi bank matnini tahlil qiling va faqat to'g'ri JSON formatida javob bering.
Matn:
"""${contractText}"""

Quyidagi tuzilishdagi JSON qaytaring:
{
  "summary": "Oddiy ${language === 'ru' ? 'rus' : 'o\'zbek'} tilida matnning 2-3 jumlali qisqa mazmuni",
  "commissionsAndFees": ["Komissiya 1", "Komissiya 2"],
  "interestAndPenalties": ["Foiz yoki penya bandi 1", "band 2"],
  "attentionRisks": ["Mijoz diqqat qilishi shart bo'lgan xatarli yoki qaltis shart 1", "shart 2"],
  "glossary": [
    { "term": "Atama", "definition": "Oddiy tushuntirish" }
  ],
  "disclaimer": "Ogohlantirish matni"
}
`;

    const response = await generateWithTimeout({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    }, 3500);

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isDemo: false });
  } catch (error) {
    console.warn('Fallback to demo tariff analysis due to:', error);
    return res.json(getDemoTariffAnalysis(contractText, language));
  }
});

// Helper for Fraud Check
function getFraudAnalysis(messageText: string, language: 'uz' | 'ru' = 'uz') {
  const lower = messageText.toLowerCase();
  const hasSmsCode = lower.includes('kod') || lower.includes('sms') || lower.includes('tasdiq') || lower.includes('parol') || lower.includes('код') || lower.includes('смс');
  const hasUrgency = lower.includes('tezda') || lower.includes('shoshilinch') || lower.includes('bloklanadi') || lower.includes('zudlik') || lower.includes('срочно') || lower.includes('заблокирован');
  const hasLink = lower.includes('http') || lower.includes('.me') || lower.includes('.cc') || lower.includes('.xyz') || lower.includes('t.me') || lower.includes('click') || lower.includes('bonus');
  const hasPrize = lower.includes('yutuq') || lower.includes('sovg\'a') || lower.includes('mukofot') || lower.includes('kompensatsiya') || lower.includes('выигрыш') || lower.includes('подарок');

  let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let score = 20;
  const flags: string[] = [];

  if (hasSmsCode) {
    flags.push(language === 'ru' ? 'Запрос СМС-кода или пароля карты' : 'SMS-kod yoki karta parolini taqdim etish talabi');
    score += 50;
  }
  if (hasUrgency) {
    flags.push(language === 'ru' ? 'Психологическое давление и требование срочных действий' : 'Shoshilinchlik hissini uyg\'otish (bloklash yoki hisob yopilishi tahdidi)');
    score += 25;
  }
  if (hasLink) {
    flags.push(language === 'ru' ? 'Подозрительная ссылка на сторонний сайт' : 'Shubhali yoki norasmiy havola (fishing)');
    score += 20;
  }
  if (hasPrize) {
    flags.push(language === 'ru' ? 'Обещание легкого выигрыша или внезапной компенсации' : 'Kutilmagan yutuq yoki davlat kompensatsiyasi va\'dasi');
    score += 20;
  }

  if (score >= 60 || hasSmsCode) {
    riskLevel = 'HIGH';
  } else if (score >= 35) {
    riskLevel = 'MEDIUM';
  }

  return {
    isDemo: true,
    riskLevel,
    riskScore: Math.min(score, 99),
    detectedFlags: flags.length > 0 ? flags : [language === 'ru' ? 'Явных критических триггеров не обнаружено, но сохраняйте бдительность' : 'To\'g\'ridan-to\'g\'ri xavfli belgilar topilmadi, biroq doimo hushyor bo\'ling'],
    explanation: riskLevel === 'HIGH'
      ? (language === 'ru'
        ? 'Внимание! Данное сообщение содержит признаки финансового мошенничества. Банки никогда не запрашивают секретные СМС-коды подтверждения.'
        : 'DIQQAT! Ushbu xabarda moliyaviy firibgarlikning (fishing) kuchli belgilari mavjud. Bank xodimlari hech qachon SMS orqali kelgan tasdiqlash kodini so\'ramaydi!')
      : (language === 'ru'
        ? 'Сообщение содержит определенные настораживающие факторы. Не переходите по непроверенным ссылкам.'
        : 'Xabarda ba\'zi shubhali jihatlar bor. Noma\'lum havolalarga kirmang va ma\'lumotlarni kiritmang.'),
    safetySteps: [
      language === 'ru' ? 'Никому и никогда не сообщайте СМС-код из 4-6 цифр' : 'SMS orqali kelgan 4-6 xonali maxfiy kodni hech kimga aytmang va yubormang',
      language === 'ru' ? 'Не переходите по ссылкам из СМС или сообщений в Telegram' : 'SMS yoki Telegramdagi notanish havolalarni ochmang',
      language === 'ru' ? 'При сомнениях позвоните по официальному номеру банка' : 'Shubha tug\'ilsa, kartangiz orqasidagi rasmiy bank telefoniga qo\'ng\'iroq qiling',
    ],
    officialDisclaimer: language === 'ru'
      ? 'Данная проверка носит рекомендательный характер. Платформа не гарантирует 100% безопасность любых сообщений.'
      : 'Ushbu tekshiruv tavsiyaviy xarakterga ega. Bank Oson AI xabarning mutlaq xavfsizligiga kafolat bermaydi.',
  };
}

// 3. API: Check Fraud
app.post('/api/ai/check-fraud', async (req: Request, res: Response) => {
  const { messageText, language = 'uz' } = req.body;
  if (!messageText || typeof messageText !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    if (!ai) {
      return res.json(getFraudAnalysis(messageText, language));
    }

    const prompt = `
Siz O'zbekistonda moliyaviy xavfsizlik va kiber-firibgarlik (fishing, soxta bank qo'ng'iroqlari, Telegram botlar) bo'yicha ekspert tahlilchisiz.
Quyidagi xabarni tahlil qiling:
"""${messageText}"""

Faqat to'g'ri JSON formatida javob bering:
{
  "riskLevel": "HIGH" yoki "MEDIUM" yoki "LOW",
  "riskScore": 1 dan 100 gacha son,
  "detectedFlags": ["Aniqlangan xavf belgisi 1", "Belgi 2"],
  "explanation": "Nima sababdan bu xavfli ekanligining oddiy ${language === 'ru' ? 'rus' : 'o\'zbek'} tilidagi tushuntirishi",
  "safetySteps": ["Foydalanuvchi hozir nima qilishi kerak bo'lgan 3 ta qadam"],
  "officialDisclaimer": "Ogohlantirish"
}
`;

    const response = await generateWithTimeout({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    }, 3500);

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isDemo: false });
  } catch (error) {
    console.warn('Fallback to rule-based fraud check due to:', error);
    return res.json(getFraudAnalysis(messageText, language));
  }
});

// Helper for Complaint generation
function getDemoComplaint(params: { bankName?: string; topic?: string; problemDetails: string; dateOfIncident?: string; transactionAmount?: string; language?: 'uz' | 'ru' }) {
  const { bankName, topic, problemDetails, dateOfIncident, transactionAmount, language = 'uz' } = params;
  const isUz = language === 'uz';
  const letterText = isUz
    ? `"${bankName || 'Tijorat banki'}" Boshqaruv raisi nomiga
Murojaat etuvchi: [F.I.SH]
Manzil: [Yashash manzili]
Telefon: [Telefon raqami]

ARIZA / SHIKOYAT

Men, [F.I.SH], ${dateOfIncident ? `${dateOfIncident} sanasida ` : ''}Sizning bankingiz xizmatlaridan foydalanish jarayonida quyidagi muammoga duch keldim:
${problemDetails}
${transactionAmount ? `Tranzaksiya summasi: ${transactionAmount} so'm.\n` : ''}
O‘zbekiston Respublikasining "Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida"gi hamda "Banklar va bank faoliyati to‘g‘risida"gi Qonunlariga muvofiq, iste’molchi sifatida mening huquqlarim himoya qilinishi kafolatlangan.

Yuqoridagilarni inobatga olgan holda, Sizdan:
1. Ushbu holatni atroflicha o‘rganib chiqib, yuzaga kelgan tushunarsiz to‘lov / komissiya / xizmat ko‘rsatish kamchiligiga oydinlik kiritishingizni;
2. Asossiz hisoblangan to‘lovlar mavjud bo‘lsa, mablag‘ni qaytarish choralarini ko‘rishingizni;
3. Natijasi to‘g‘risida qonunda belgilangan muddatda yozma yoki elektron shaklda javob berishingizni so‘rayman.

Ilova: 
- Pasport/ID-karta nusxasi
- Chek yoki to‘lov kvitansiyalari nusxasi

Sana: ${new Date().toLocaleDateString('uz-UZ')}
Imzo: ____________`
    : `Председателю Правления "${bankName || 'Коммерческого банка'}"
От: [Ф.И.О заявителя]
Адрес: [Адрес проживания]
Телефон: [Номер телефона]

ЗАЯВЛЕНИЕ / ПРЕТЕНЗИЯ

Я, [Ф.И.О], ${dateOfIncident ? `в дату ${dateOfIncident} ` : ''}при пользовании услугами вашего банка столкнулся со следующей ситуацией:
${problemDetails}
${transactionAmount ? `Сумма транзакции: ${transactionAmount} сум.\n` : ''}
В соответствии с Законами Республики Узбекистан «Об обращениях физических и юридических лиц» и «О банках и банковской деятельности», права потребителей банковских услуг защищены государством.

На основании изложенного, прошу:
1. Провести проверку по факту данного обращения и предоставить подробное разъяснение;
2. В случае необоснованно удержанных комиссий или списаний произвести перерасчет и возврат средств;
3. Направить официальный ответ в установленные законом сроки.

Приложение:
- Копия документа, удостоверяющего личность
- Чеки / выписки по операциям

Дата: ${new Date().toLocaleDateString()}
Подпись: ____________`;

  return {
    isDemo: true,
    letterText,
    checklist: isUz
      ? ['Shaxsiy ma\'lumotlarni (F.I.SH, manzil, telefon) to\'ldirish', 'Chek, kvitansiya yoki skrinshotlarni ilova qilish', 'Arizani bankning rasmiy pochtasiga yoki filialiga taqdim etish']
      : ['Заполнить персональные данные (ФИО, адрес, телефон)', 'Приложить чеки или выписки', 'Отправить в банк письменно или через официальный email'],
    officialChannels: [
      { name: 'O‘zbekiston Respublikasi Markaziy banki Ishonch telefoni', contact: '1114' },
      { name: 'Yagona interaktiv davlat xizmatlari portali', contact: 'my.gov.uz' },
      { name: 'Prezident Xalq qabulxonasi', contact: 'pm.gov.uz' },
    ],
    notice: isUz
      ? 'Platforma arizani bankka to\'g\'ridan-to\'g\'ri yubormaydi. Siz tayyor matnni nusxalab, bankning rasmiy qabulxonasiga taqdim etishingiz kerak.'
      : 'Платформа не отправляет обращение автоматически. Скопируйте текст и подайте его через официальные каналы банка.',
  };
}

// 4. API: Generate Complaint / Inquiry Letter
app.post('/api/ai/generate-complaint', async (req: Request, res: Response) => {
  const { bankName, topic, problemDetails, dateOfIncident, transactionAmount, language = 'uz' } = req.body;
  if (!problemDetails) {
    return res.status(400).json({ error: 'Problem details are required' });
  }

  try {
    if (!ai) {
      return res.json(getDemoComplaint({ bankName, topic, problemDetails, dateOfIncident, transactionAmount, language }));
    }

    const prompt = `
Siz bank huquqi bo'yicha yurist va arizalar tuzish bo'yicha mutaxassissiz.
Foydalanuvchi ma'lumotlari:
Bank nomi: ${bankName || 'Tijorat banki'}
Mavzu: ${topic || 'Bank xizmati bo\'yicha murojaat'}
Muammo tafsilotlari: ${problemDetails}
Sana: ${dateOfIncident || 'Yaqinda'}
Summa: ${transactionAmount || 'Mavjud emas'}
Til: ${language === 'ru' ? 'Rus tili' : 'O\'zbek tili'}

O'zbekiston Respublikasi qonunlariga asoslangan, rasmiy, hurmatli va to'liq ariza/shikoyat matnini tuzing.
Faqat JSON qaytaring:
{
  "letterText": "To'liq rasmiy ariza matni",
  "checklist": ["Ilova qilinishi kerak bo'lgan hujjat 1", "2"],
  "officialChannels": [
    { "name": "Markaziy bank ishonch telefoni", "contact": "1114" },
    { "name": "my.gov.uz", "contact": "my.gov.uz" }
  ],
  "notice": "Eslatma"
}
`;

    const response = await generateWithTimeout({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    }, 3500);

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, isDemo: false });
  } catch (error) {
    console.warn('Fallback to demo complaint due to:', error);
    return res.json(getDemoComplaint({ bankName, topic, problemDetails, dateOfIncident, transactionAmount, language }));
  }
});

// 5. API: Status check
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    hasGeminiKey: Boolean(apiKey),
    mode: apiKey ? 'live' : 'demo',
    supportedFeatures: ['chat', 'translate-tariff', 'check-fraud', 'generate-complaint', 'loan-calculator', 'business-helper'],
    serverTime: new Date().toISOString(),
  });
});

// Serve frontend in dev or prod
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Bank Oson AI server is running on http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}, ai: ${apiKey ? 'live' : 'demo'}]`);
  });
}

setupServer();
