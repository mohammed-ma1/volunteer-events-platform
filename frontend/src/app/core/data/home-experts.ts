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
  { nameAr: 'زينب الغضبان', nameEn: 'Zainab Al-Ghadhban', imageUrl: SRC_IMG_D },
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
  { nameAr: 'دلال الحشاش', nameEn: 'Dalal Al-Hashash', imageUrl: SRC_IMG_C },
  { nameAr: 'أبرار أشكناني', nameEn: 'Abrar Ashkanani', imageUrl: SRC_IMG_A },
  { nameAr: 'سارة المنيس', nameEn: 'Sarah Al-Munais', imageUrl: SRC_IMG_D },
  { nameAr: 'غدير الكندري', nameEn: 'Ghadeer Al-Kandari', imageUrl: SRC_IMG_A },
  { nameAr: 'د. جواد أبو الحسن', nameEn: 'Dr. Jawad Abu Al-Hasan', imageUrl: SRC_IMG_C },
  { nameAr: 'ريم الفرحان', nameEn: 'Reem Al-Farhan', imageUrl: SRC_IMG_B },
  { nameAr: 'شهد العطار و حمزه فيصل', nameEn: 'Shahd Al-Attar & Hamza Faisal', imageUrl: SRC_IMG_A },
  { nameAr: 'عبدالرحمن حماد', nameEn: 'Abdulrahman Hammad', imageUrl: SRC_IMG_D },
  { nameAr: 'هيا بوراشد', nameEn: 'Haya Bourashed', imageUrl: SRC_IMG_C },
  { nameAr: 'فاطمة القطان', nameEn: 'Fatima Al-Qattan', imageUrl: SRC_IMG_D },
  { nameAr: 'فيصل الدويسان', nameEn: 'Faisal Al-Duwaisan', imageUrl: SRC_IMG_C },
  { nameAr: 'هاجر النصار', nameEn: 'Hajar Al-Nassar', imageUrl: SRC_IMG_B },
  { nameAr: 'عبدالعزيز الضبيب', nameEn: 'Abdulaziz Al-Dhabib', imageUrl: SRC_IMG_D },
];

// ── Local presenter photo overrides ───────────────────────────────────
// Local photos for trainers we have. Keys use the source trainer's exact name
// where possible; we also build a normalized index so naming variants
// (د.بسام vs د. بسام, سليمان المراغى vs سليمان المراغي) resolve correctly.
const PRESENTER_AVATAR_OVERRIDES: Record<string, string> = {
  'د. بسام الجزاف': '/images/presenters/bassam-al-jazzaf.jpg',
  'د.بسام الجزاف': '/images/presenters/bassam-al-jazzaf.jpg',
  'بدر الفيلكاوي': '/images/presenters/badr-al-failakawi.jpg',
  'حسن سيد': '/images/presenters/hassan-syed.jpg',
  'أحمد سمير': '/images/presenters/ahmed-sameer.jpg',
  'دلال النخيلان': '/images/presenters/dalal-al-nakhelan.jpg',
  'علي الأنصاري': '/images/presenters/ali-al-ansari.jpg',
  'سليمان المراغي': '/images/presenters/sulaiman-al-maraghi.jpg',
  'المحامي إبراهيم السماعيل': '/images/presenters/ibrahim-al-samael.jpg',
  'عبدالرحمن التركيت': '/images/presenters/abdulrahman-al-turkait.jpg',
  'آلاء النصار': '/images/presenters/alaa-al-nassar.jpg',
  'عبدالرحمن خاجه': '/images/presenters/abdulrahman-khajah.jpg',
  'د. محمد إسماعيل': '/images/presenters/mohammed-ismail.jpg',
  'دانا العوضي': '/images/presenters/dana-al-awadi.jpg',
  'شيماء الطباخ': '/images/presenters/shaimaa-al-tabbakh.jpg',
  'محمد الجيماز': '/images/presenters/mohammed-al-jaimaz.jpg',
  'أبرار أشكناني': '/images/presenters/abrar-ashkanani.jpg',
  'سارة المنيس': '/images/presenters/sarah-al-munais.jpg',
  'فاطمة القطان': '/images/presenters/fatima-al-qattan.jpg',
  'فيصل الدويسان': '/images/presenters/faisal-al-duwaisan.jpg',
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
  return s;
}

const NORMALIZED_AVATAR_OVERRIDES: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(PRESENTER_AVATAR_OVERRIDES)) {
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
    const localOverride = NORMALIZED_AVATAR_OVERRIDES[normalizeArName(t.nameAr)];
    return {
      id,
      nameAr: t.nameAr,
      nameEn: t.nameEn,
      specialtyAr: SOURCE_ROLE_AR,
      specialtyEn: SOURCE_ROLE_EN,
      bioAr: SOURCE_BIO_AR,
      bioEn: SOURCE_BIO_EN,
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
