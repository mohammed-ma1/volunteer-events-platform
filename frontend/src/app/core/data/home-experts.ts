import type { TranslationKey } from '../i18n/translations';
import kuWorkshopSchedule from './ku_student_week_workshops_schedule_full.json';

export type ExpertSocial = { href: string; aria: TranslationKey; kind: 'mail' | 'linkedin' | 'x' };

export interface HomeExpert {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  bioAr: string;
  bioEn: string;
  /** Local presenter photo path, or empty when the UI should show initials instead of a stock image. */
  imageUrl: string;
  socials: ExpertSocial[];
  /** Match `slug` on seeded / API workshops for the grid below the profile. */
  workshopSlugs: string[];
}

/** Mirror of `backend/database/data/ku_student_week_workshops_schedule_full.json` — copy when the backend file changes. */
const SCHEDULE = kuWorkshopSchedule as {
  workshops: { n: number; presenter_ar: string }[];
};

// ── Source trainers (35) ──────────────────────────────────────────────
// Mirror of next-levels source project's rawTrainers list. All share the same
// role + bio. Image URLs are stock fallbacks; we override with local photos
// where we have them.
const SOURCE_ROLE_AR = 'مدرب معتمد';
const SOURCE_ROLE_EN = 'Certified Trainer';
const SOURCE_BIO_AR = 'مدرب خبير في مجاله يقدم ورش عمل متخصصة.';
const SOURCE_BIO_EN = 'An expert trainer providing specialized workshops.';

const SRC_IMG_A = 'https://vibe.filesafe.space/1775667546795098704/assets/2b5d5897-4792-47e5-a27d-ef7ceb12e3c9.png';
const SRC_IMG_B = 'https://vibe.filesafe.space/1775667546795098704/assets/16cb75dc-c027-44b0-b98f-943ef62525ac.png';
const SRC_IMG_C = 'https://vibe.filesafe.space/1775667546795098704/assets/21745c71-fbb6-4b4a-9b72-0bf530f63351.png';
const SRC_IMG_D = 'https://vibe.filesafe.space/1775667546795098704/assets/391318d0-0148-4fd1-8d24-b082191e5682.png';

interface SourceTrainer {
  nameAr: string;
  nameEn: string;
  imageUrl: string;
}

const SOURCE_TRAINERS: SourceTrainer[] = [
  { nameAr: 'سنابل المسلم', nameEn: 'Sanabel Al-Muslim', imageUrl: SRC_IMG_A },
  { nameAr: 'منيرة النخيلان', nameEn: 'Munira Al-Nakhelan', imageUrl: SRC_IMG_B },
  { nameAr: 'د.بسام الجزاف', nameEn: 'Dr. Bassam Al-Jazzaf', imageUrl: SRC_IMG_C },
  { nameAr: 'بدر الفيلكاوي', nameEn: 'Bader Al-Failakawi', imageUrl: SRC_IMG_B },
  { nameAr: 'حسن سيد', nameEn: 'Hassan Sayed', imageUrl: SRC_IMG_A },
  { nameAr: 'م. زينب الغضبان', nameEn: 'Eng. Zainab Al-Ghadhban', imageUrl: SRC_IMG_D },
  { nameAr: 'أحمد سمير', nameEn: 'Ahmed Sameer', imageUrl: SRC_IMG_C },
  { nameAr: 'دلال النخيلان', nameEn: 'Dalal Al-Nakhelan', imageUrl: SRC_IMG_B },
  { nameAr: 'علي عادل', nameEn: 'Ali Adel', imageUrl: SRC_IMG_A },
  { nameAr: 'سليمان المراغى', nameEn: 'Sulaiman Al-Muraghi', imageUrl: SRC_IMG_D },
  { nameAr: 'المحامي إبراهيم السماعيل', nameEn: 'Lawyer Ibrahim Al-Samaeel', imageUrl: SRC_IMG_C },
  { nameAr: 'عبدالرحمن التركيت', nameEn: 'Abdulrahman Al-Turkait', imageUrl: SRC_IMG_B },
  { nameAr: 'آلاء النصار', nameEn: 'Alaa Al-Nassar', imageUrl: SRC_IMG_A },
  { nameAr: 'مرزوق السعيد', nameEn: 'Marzouq Al-Saeed', imageUrl: SRC_IMG_D },
  { nameAr: 'عبدالرحمن خاجه', nameEn: 'Abdulrahman Khaja', imageUrl: SRC_IMG_C },
  { nameAr: 'فاطمة عباس', nameEn: 'Fatima Abbas', imageUrl: SRC_IMG_A },
  { nameAr: 'الحكم خالد الشمري', nameEn: 'Referee Khaled Al-Shammari', imageUrl: SRC_IMG_D },
  { nameAr: 'ريم العلي', nameEn: 'Reem Al-Ali', imageUrl: SRC_IMG_C },
  { nameAr: 'د. محمد إسماعيل', nameEn: 'Dr. Mohammed Ismail', imageUrl: SRC_IMG_B },
  { nameAr: 'دانا العوضي', nameEn: 'Dana Al-Awadi', imageUrl: SRC_IMG_B },
  { nameAr: 'شيماء الطباخ', nameEn: 'Shaimaa Al-Tabbakh', imageUrl: SRC_IMG_A },
  { nameAr: 'محمد الجيماز', nameEn: 'Mohammed Al-Jaimaz', imageUrl: SRC_IMG_D },
  { nameAr: 'م. الجازي العجمي', nameEn: 'Eng. Al-Jazi Al-Ajmi', imageUrl: SRC_IMG_C },
  { nameAr: 'أبرار أشكناني', nameEn: 'Abrar Ashkanani', imageUrl: SRC_IMG_A },
  { nameAr: 'سارة المنيس', nameEn: 'Sarah Al-Munais', imageUrl: SRC_IMG_D },
  { nameAr: 'غدير الكندري', nameEn: 'Ghadeer Al-Kandari', imageUrl: SRC_IMG_A },
  { nameAr: 'د. جواد أبو الحسن', nameEn: 'Dr. Jawad Abu Al-Hasan', imageUrl: SRC_IMG_C },
  { nameAr: 'ريم الفرحان', nameEn: 'Reem Al-Farhan', imageUrl: SRC_IMG_B },
  { nameAr: 'شهد العطار', nameEn: 'Shahd Al-Attar', imageUrl: SRC_IMG_A },
  { nameAr: 'عبدالرحمن حماد', nameEn: 'Abdulrahman Hammad', imageUrl: SRC_IMG_D },
  { nameAr: 'هيا بوراشد', nameEn: 'Haya Bourashed', imageUrl: SRC_IMG_C },
  { nameAr: 'فاطمة القطان', nameEn: 'Fatima Al-Qattan', imageUrl: SRC_IMG_D },
  { nameAr: 'فيصل الدويسان', nameEn: 'Faisal Al-Duwaisan', imageUrl: SRC_IMG_C },
  { nameAr: 'هاجر النصار', nameEn: 'Hajar Al-Nassar', imageUrl: SRC_IMG_B },
  { nameAr: 'عبدالعزيز الضبيب', nameEn: 'Abdulaziz Al-Dhabib', imageUrl: SRC_IMG_D },
  // ── June 2026 KU week additions (جدول الورش.xlsx) ──
  { nameAr: 'سالم الهاجري', nameEn: 'Salem Al-Hajri', imageUrl: SRC_IMG_A },
  { nameAr: 'هلال الهلال', nameEn: 'Hilal Al-Hilal', imageUrl: SRC_IMG_B },
  { nameAr: 'منال المسلم', nameEn: 'Manal Al-Muslim', imageUrl: SRC_IMG_C },
  { nameAr: 'محمد الهاجري', nameEn: 'Mohammed Al-Hajri', imageUrl: SRC_IMG_D },
  // ── June 2026 KU week (For Programer Final.xlsx) additions ──
  { nameAr: 'سحر الشمري', nameEn: 'Sahar Al-Shammari', imageUrl: SRC_IMG_C },
  { nameAr: 'د. إسراء الدايل', nameEn: 'Dr. Israa Al-Dayel', imageUrl: SRC_IMG_D },
  { nameAr: 'أشواق العنزي', nameEn: 'Ashwaq Al-Anzi', imageUrl: SRC_IMG_A },
];

// ── Local presenter photo overrides ───────────────────────────────────
// Local photos for trainers we have. Keys use the source trainer's exact name
// where possible; we also build a normalized index so naming variants
// (د.بسام vs د. بسام, سليمان المراغى vs سليمان المراغي) resolve correctly.
const R2_BASE = 'https://pub-b242a57539404e6c9709cad496bd5b5b.r2.dev';

const PRESENTER_AVATAR_OVERRIDES: Record<string, string> = {
  'د. بسام الجزاف': `${R2_BASE}/bassam-al-jazzaf.jpg`,
  'د.بسام الجزاف': `${R2_BASE}/bassam-al-jazzaf.jpg`,
  'بدر الفيلكاوي': `${R2_BASE}/badr-al-failakawi.jpg`,
  'حسن سيد': `${R2_BASE}/hassan-syed.jpg`,
  'أحمد سمير': `${R2_BASE}/ahmed-sameer.jpg`,
  'دلال النخيلان': `${R2_BASE}/dalal-al-nakhelan.jpg`,
  'علي عادل': `${R2_BASE}/ali.jpg`,
  'سليمان المراغي': `${R2_BASE}/sulaiman-al-maraghi.jpg`,
  'المحامي إبراهيم السماعيل': `${R2_BASE}/ibrahim-al-samael.jpg`,
  'عبدالرحمن التركيت': `${R2_BASE}/abdulrahman-al-turkait.jpg`,
  'آلاء النصار': `${R2_BASE}/alaa-al-nassar.jpg`,
  'عبدالرحمن خاجه': `${R2_BASE}/abdulrahman-khajah.jpg`,
  'د. محمد إسماعيل': `${R2_BASE}/mohammed-ismail.jpg`,
  'دانا العوضي': `${R2_BASE}/dana-al-awadi.jpg`,
  'شيماء الطباخ': `${R2_BASE}/shaimaa-al-tabbakh.jpg`,
  'محمد الجيماز': `${R2_BASE}/mohammed-al-jaimaz.jpg`,
  'أبرار أشكناني': `${R2_BASE}/abrar-ashkanani.jpg`,
  'سارة المنيس': '/images/presenters/sara-al-munais.png',
  'فاطمة القطان': `${R2_BASE}/fatima-al-qattan.jpg`,
  'فيصل الدويسان': `${R2_BASE}/faisal-al-duwaisan.jpg`,
  'م. الجازي العجمي': `${R2_BASE}/aljazzi.jpg`,
  'منيرة النخيلان': `${R2_BASE}/moneera.jpg`,
  'زينب الغضبان': `${R2_BASE}/zainab.jpg`,
  'مرزوق السعيد': `${R2_BASE}/marzooq.jpg`,
  'فاطمة عباس': `${R2_BASE}/fatema.jpg`,
  'غدير الكندري': `${R2_BASE}/ghadeer.jpg`,
  'د. جواد أبو الحسن': `${R2_BASE}/jawaad.jpg`,
  'شهد العطار': `${R2_BASE}/shahad.jpg`,
  'عبدالرحمن حماد': `${R2_BASE}/abd-alrhahman.jpg`,
  'هيا بوراشد': '/images/presenters/hia-bourashed.png',
  'هاجر النصار': `${R2_BASE}/hajr.jpg`,
  'عبدالعزيز الضبيب': `${R2_BASE}/abd-alazeez.jpg`,
  'د. إسراء الدايل': '/images/presenters/israa-al-dayel.png',
  'سالم الهاجري': '/images/presenters/salem-al-hajri.png',
  'محمد الهاجري': '/images/presenters/mohammed-al-hajri.png',
  'منال المسلم': '/images/presenters/manal-al-muslim.png',
};

/** Strip diacritics + unify alif/ya/spaces so name variants match. */
function normalizeArName(name: string): string {
  if (!name) return '';
  let s = name.normalize('NFKC');
  // strip diacritics
  s = s.replace(/[\u0610-\u0615\u064B-\u0652\u0670]/g, '');
  // unify alif variants
  s = s.replace(/[\u0623\u0625\u0622]/g, '\u0627');
  // unify ya variants (final ى -> ي)
  s = s.replace(/\u0649/g, '\u064A');
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // strip leading honorifics so name variants resolve to the same key
  // (e.g. "الحكم خالد الشمري" ↔ "خالد الشمري", "د.بسام" ↔ "د. بسام الجزاف").
  // Single-letter honorifics require a dot so real names (محمد) aren't touched.
  s = s.replace(/^(?:د|م|ا)\.\s*/u, '');
  s = s.replace(/^(?:المحامي|الحكم|الاستاذ|الكابتن|كابتن|الكوتش|كوتش)\s+/u, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

const NORMALIZED_AVATAR_OVERRIDES: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(PRESENTER_AVATAR_OVERRIDES)) {
    out[normalizeArName(k)] = v;
  }
  return out;
})();

// ── Per-presenter role + bio (from the «ارقام المحاضرين» sheet: title column →
// specialty, «نبذة عن المحاضر» → bio). Matched by normalized name; any field left
// out falls back to the generic SOURCE_ROLE_* / SOURCE_BIO_* values.
interface PresenterInfo {
  specialtyAr?: string;
  specialtyEn?: string;
  bioAr?: string;
  bioEn?: string;
}

const PRESENTER_INFO_OVERRIDES: Record<string, PresenterInfo> = {
  'سنابل المسلم': {
    specialtyAr: 'روائية',
    specialtyEn: 'Novelist',
    bioAr: 'خبرة في مجال إعلام الطفل المقروء (مجلة العربي الصغير) وفي مجال الإعلام والتسويق.',
    bioEn: "Experience in children's print media (Al-Arabi Al-Sagheer magazine) and in media and marketing.",
  },
  'بدر الفيلكاوي': { specialtyAr: 'فنان تشكيلي', specialtyEn: 'Visual Artist' },
  'م. زينب الغضبان': {
    specialtyAr: 'مهندسة',
    specialtyEn: 'Engineer',
    bioAr: 'كبير مهندسين بترول ومدربة معتمدة في الوعي.',
    bioEn: 'Senior petroleum engineer and certified awareness trainer.',
  },
  'أحمد سمير': {
    specialtyAr: 'مصمم فنون بالذكاء الاصطناعي وموشن جرافيك',
    specialtyEn: 'AI Art & Motion Graphic Designer',
    bioAr: 'مصمم فنون بالذكاء الاصطناعي وموشن جرافيك.',
    bioEn: 'AI art & motion graphic designer.',
  },
  'دلال النخيلان': {
    specialtyAr: 'أخصائية تغذية علاجية',
    specialtyEn: 'Clinical Nutritionist',
    bioAr: 'خبرة مهنية تمتد لأكثر من 15 عاماً، وأؤمن بأن الصحة ليست مجرد نظام غذائي أو هدف مؤقت بل استثمار طويل الأمد.',
    bioEn: 'Over 15 years of professional experience; I believe health is not just a diet or a temporary goal, but a long-term investment.',
  },
  'عبدالرحمن التركيت': {
    specialtyAr: 'فنان تشكيلي',
    specialtyEn: 'Visual Artist',
    bioAr: 'فنان تشكيلي وتربوي ومدرب معتمد TOT.',
    bioEn: 'Visual artist, educator, and certified TOT trainer.',
  },
  'آلاء النصار': {
    bioAr: 'أخصائية اجتماعية في تعديل السلوك.',
    bioEn: 'Social specialist in behavior modification.',
  },
  'مرزوق السعيد': {
    bioAr: 'مستشار تطوير مهارات التواصل والخطابة.',
    bioEn: 'Consultant in developing communication and public-speaking skills.',
  },
  'فاطمة عباس': {
    bioAr: 'مصورة فوتوغرافية بخبرة منذ 2006، ومدربة معتمدة حاصلة على شهادات من مصورين عالميين ومحليين.',
    bioEn: 'Photographer since 2006 and certified trainer, with certifications from international and local photographers.',
  },
  'الحكم خالد الشمري': {
    bioAr: 'الحكم الدولي خالد الشمري.',
    bioEn: 'International referee Khaled Al-Shammari.',
  },
  'دانا العوضي': {
    bioAr: 'مختصة في رفع إنتاجية المنظمة وتقليل الهدر، ومهتمة بنشر ثقافة بيئة العمل الصحية، ومدربة معتمدة.',
    bioEn: 'Specialist in raising organizational productivity and reducing waste, advocate for healthy work environments, and certified trainer.',
  },
  'سارة المنيس': {
    bioAr: 'اختصاصية نفسية أولى ومدربة معتمدة لمرحلة الطفولة.',
    bioEn: 'Senior psychologist and certified early-childhood trainer.',
  },
  'فاطمة القطان': {
    bioAr: 'مدربة جلسات دعم نفسي وعاطفي، ومتخصصة في تقنيات التنفس لمنهج نسمة.',
    bioEn: 'Psychological and emotional support trainer, specialized in breathing techniques (Nasma method).',
  },
  'هيا بوراشد': {
    bioAr: 'مدربة معتمدة في صناعة الشموع الصديقة للبيئة من المواد الطبيعية، وشغوفة بنشر ثقافة الحرف اليدوية المستدامة.',
    bioEn: 'Certified trainer in eco-friendly, natural-material candle making, passionate about sustainable handicrafts.',
  },
  'محمد الهاجري': {
    bioAr: 'رائد أعمال يبني عقلية المبادرة ويحوّل الطموح إلى إنجاز — الفرص تُصنع لا تُنتظر.',
    bioEn: 'Entrepreneur building an initiative mindset and turning ambition into achievement — opportunities are made, not awaited.',
  },
  'سالم الهاجري': {
    bioAr: 'مصور وصانع محتوى.',
    bioEn: 'Photographer and content creator.',
  },
  'منال المسلم': {
    bioAr: 'مدربة في تقنيات التنفس ومهارات الحياة، ومؤسسة منهج نسمة.',
    bioEn: 'Trainer in breathing techniques and life skills, founder of the Nasma method.',
  },
  'سحر الشمري': {
    bioAr: 'مدربة متخصصة في الهيئة العامة للتعليم التطبيقي والتدريب.',
    bioEn: 'Specialized trainer at the Public Authority for Applied Education and Training.',
  },
  'د. إسراء الدايل': {
    specialtyAr: 'دكتوراه في العلاج الطبيعي',
    specialtyEn: 'PhD in Physical Therapy',
    bioAr: 'دكتوراه في التأهيل الحركي والعصبي، متخصصة في تحليل حركة الجسم وتعديل أخطاء المشي، وخبرة في العلاج الطبيعي للأمراض العصبية والعمود الفقري.',
    bioEn: 'PhD in motor and neuro rehabilitation, specialized in body-movement analysis and gait correction, with experience in physical therapy for neurological and spinal conditions.',
  },
  'م. الجازي العجمي': {
    bioAr: 'مستشارة ومدربة في ريادة الأعمال.',
    bioEn: 'Consultant and trainer in entrepreneurship.',
  },
};

const NORMALIZED_INFO_OVERRIDES: Record<string, PresenterInfo> = (() => {
  const out: Record<string, PresenterInfo> = {};
  for (const [k, v] of Object.entries(PRESENTER_INFO_OVERRIDES)) {
    out[normalizeArName(k)] = v;
  }
  return out;
})();

/** Exposed for the events-home component to match a parsed presenter name to a trainer. */
export function normalizePresenterName(name: string | null | undefined): string {
  return normalizeArName(name ?? '');
}

/** First meaningful letter of a segment (Arabic / Latin letters). */
function firstLetterOfSegment(segment: string): string {
  for (const ch of segment.normalize('NFKC')) {
    if (/[\u0600-\u06FF]/.test(ch) || /[A-Za-z]/.test(ch)) {
      return ch;
    }
  }
  return '';
}

function secondLetterOfSegment(segment: string): string {
  const first = firstLetterOfSegment(segment);
  if (!first) {
    return '';
  }
  const i = segment.indexOf(first);
  if (i < 0) {
    return '';
  }
  return firstLetterOfSegment(segment.slice(i + first.length));
}

/**
 * Two-letter initials for experts without a photo, always from the English name
 * (honorifics stripped, then first + last word; A–Z uppercase).
 */
export function getExpertInitials(ex: HomeExpert): string {
  const pick = (name: string): string => {
    let s = name.normalize('NFKC').trim();
    s = s
      .replace(/^د\.?\s*/u, '')
      .replace(/^Dr\.?\s+/i, '')
      .replace(/^المحامي\s+/u, '')
      .replace(/^الحكم\s+/u, '')
      .replace(/^Lawyer\s+/i, '')
      .replace(/^Referee\s+/i, '')
      .trim();
    s = s.replace(/\s*&\s*/g, ' ').replace(/\s+و\s+/g, ' ');
    const parts = s.split(/\s+/).filter((p) => p.length > 0 && !/^(&|و|and)$/i.test(p));
    if (parts.length >= 2) {
      const a = firstLetterOfSegment(parts[0]);
      const lastSeg = parts[parts.length - 1];
      let b = firstLetterOfSegment(lastSeg);
      if (a.toLowerCase() === b.toLowerCase()) {
        b = secondLetterOfSegment(lastSeg) || b;
      }
      return (a + b).trim();
    }
    if (parts.length === 1) {
      const p = parts[0];
      const a = firstLetterOfSegment(p);
      const rest = p.slice(p.indexOf(a) + 1);
      const b = firstLetterOfSegment(rest);
      if (b) {
        return (a + b).trim();
      }
      return (a + firstLetterOfSegment(p.slice(1))).trim() || a;
    }
    return name.slice(0, 2).trim();
  };

  const out = pick(ex.nameEn);
  const letters = out.length > 0 ? out : pick(ex.nameAr);
  return letters.replace(/[a-z]/g, (ch) => ch.toUpperCase());
}

/**
 * English-style initials for a presenter line from API `host_name`
 * (matches `HOME_EXPERTS` when possible, otherwise initials from the string).
 */
export function getPresenterInitialsFromHostName(hostName: string | null | undefined): string {
  const h = (hostName ?? '').trim();
  if (!h) {
    return '?';
  }
  const hit = HOME_EXPERTS.find((e) => normalizeArName(e.nameAr) === normalizeArName(h));
  if (hit) {
    return getExpertInitials(hit);
  }
  const pseudo: HomeExpert = {
    id: '_host',
    nameAr: h,
    nameEn: h,
    specialtyAr: '',
    specialtyEn: '',
    bioAr: '',
    bioEn: '',
    imageUrl: '',
    socials: [],
    workshopSlugs: [],
  };
  return getExpertInitials(pseudo);
}

const DEFAULT_SOCIALS: ExpertSocial[] = [];

function presenterId(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return `p${String(Math.abs(h) % 100000).padStart(5, '0')}`;
}

/** Strip honorifics for sort comparison (matches source's localeCompare ordering). */
function nameSortKey(name: string): string {
  return name.replace(/^(د\.\s*|د\.|المحامي\s|الحكم\s)/, '').trim();
}

function buildHomeExperts(): HomeExpert[] {
  const sorted = [...SOURCE_TRAINERS].sort((a, b) =>
    nameSortKey(a.nameAr).localeCompare(nameSortKey(b.nameAr), 'ar'),
  );

  return sorted.map((t) => {
    const id = presenterId(t.nameAr);
    const key = normalizeArName(t.nameAr);
    const localOverride = NORMALIZED_AVATAR_OVERRIDES[key];
    const info = NORMALIZED_INFO_OVERRIDES[key];
    return {
      id,
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      specialtyAr: info?.specialtyAr ?? SOURCE_ROLE_AR,
      specialtyEn: info?.specialtyEn ?? SOURCE_ROLE_EN,
      bioAr: info?.bioAr ?? SOURCE_BIO_AR,
      bioEn: info?.bioEn ?? SOURCE_BIO_EN,
      imageUrl: localOverride ?? '',
      socials: DEFAULT_SOCIALS,
      // Empty — the events-home component derives the trainer's workshops by
      // parsing the instructor name from each event's summary (set by the
      // backend EventSeeder using source-aligned instructor names).
      workshopSlugs: [],
    };
  });
}

/** 35 source trainers, sorted Arabic-locale with honorifics stripped. */
export const HOME_EXPERTS: HomeExpert[] = buildHomeExperts();

/**
 * Returns a new array where each expert's `imageUrl` is replaced with the
 * matching entry from `overridesByNormalizedName` when present. Used to merge
 * admin-portal-managed avatar URLs into the static `HOME_EXPERTS` list at
 * runtime so admin edits flow through without a frontend rebuild.
 *
 * Matching is exact on the canonical name first; if no exact match is found,
 * we fall back to substring matching either way (handles composite labels
 * like `زينب الغضبان وفريق الطلبة` ↔ admin-portal entry `زينب الغضبان`).
 *
 * `overridesByNormalizedName` keys must be canonicalised via
 * `normalizePresenterName` (or `normalizeArName`) — same as the public
 * `ExpertsService.avatarOverrides` computed signal.
 */
export function applyExpertAvatarOverrides(
  experts: readonly HomeExpert[],
  overridesByNormalizedName: Record<string, string>,
): HomeExpert[] {
  const keys = Object.keys(overridesByNormalizedName ?? {});
  if (keys.length === 0) {
    return [...experts];
  }
  return experts.map((e) => {
    const target = normalizeArName(e.nameAr);
    let live = overridesByNormalizedName[target];
    if (!live) {
      const partial = keys.find((k) => k && (target.includes(k) || k.includes(target)));
      if (partial) live = overridesByNormalizedName[partial];
    }
    return live ? { ...e, imageUrl: live } : e;
  });
}

/**
 * Filters the static `HOME_EXPERTS` list down to the names that exist as
 * active rows in the admin-portal-managed `experts` table (passed in as a
 * Set of normalized names from `ExpertsService.activeNamesSet`).
 *
 * When the active set is empty (API hasn't loaded or failed) we return the
 * full list unchanged so the home page never goes blank during a network
 * blip — admin deletions only take effect after the API responds.
 *
 * Matching is forgiving: exact-normalized first, then substring either way
 * to handle composite labels like `زينب الغضبان وفريق الطلبة` matching the
 * admin-portal entry `زينب الغضبان`.
 */
export function filterExpertsByActive(
  experts: readonly HomeExpert[],
  activeNamesSet: ReadonlySet<string>,
): HomeExpert[] {
  if (!activeNamesSet || activeNamesSet.size === 0) {
    return [...experts];
  }
  const activeKeys = Array.from(activeNamesSet);
  return experts.filter((e) => {
    const target = normalizeArName(e.nameAr);
    if (activeNamesSet.has(target)) return true;
    return activeKeys.some((k) => k && (target.includes(k) || k.includes(target)));
  });
}
