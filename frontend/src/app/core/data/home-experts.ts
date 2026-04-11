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
  imageUrl: string;
  socials: ExpertSocial[];
  /** Match `slug` on seeded / API workshops for the grid below the profile. */
  workshopSlugs: string[];
}

/** Mirror of `backend/database/data/ku_student_week_workshops_schedule_full.json` — copy when the backend file changes. */
const SCHEDULE = kuWorkshopSchedule as {
  workshops: { n: number; presenter_ar: string }[];
};

/**
 * English names for schedule presenters. Only keys that exist in the schedule JSON are used (see `presenterNameEnForSchedule`).
 */
const PRESENTER_NAME_EN_SOURCE: Record<string, string> = {
  'آلاء النصار': 'Alaa Al-Nassar',
  'أبرار أشكناني': 'Abrar Ashkanani',
  'أحمد سعيد': 'Ahmed Saeed',
  'المحامي إبراهيم السماعيل': 'Lawyer Ibrahim Al-Samaeel',
  'بدر الفيلكاوي': 'Bader Al-Failakawi',
  'حسن سيد': 'Hassan Sayed',
  'خالد الشمري': 'Khalid Al-Shammari',
  'د. بسام الجزاف': 'Dr. Bassam Al-Jazzaf',
  'د. جواد أبو الحسن': 'Dr. Jawad Abu Al-Hasan',
  'د. رفيدة الميعان': 'Dr. Rafida Al-Mian',
  'د. محمد إسماعيل': 'Dr. Mohammed Ismail',
  'دانا العوضي': 'Dana Al-Awadi',
  'دلال الحشاش': 'Dalal Al-Hashash',
  'دلال النخيلان': 'Dalal Al-Nakhelan',
  'ريم العلي': 'Reem Al-Ali',
  'ريم الفرحان': 'Reem Al-Farhan',
  'زينب الغضبان': 'Zainab Al-Ghadhban',
  'سارة المنيس': 'Sarah Al-Munais',
  'سليمان المراغي': 'Sulaiman Al-Muraghi',
  'سنابل المسلم': 'Sanabel Al-Muslim',
  'شهد العطار و حمزه فيصل': 'Shahd Al-Attar & Hamza Faisal',
  'شيماء الطباخ': 'Shaima Al-Tabbakh',
  'عبدالرحمن التركيت': 'Abdulrahman Al-Turkait',
  'عبدالرحمن حماد': 'Abdulrahman Hammad',
  'عبدالرحمن خاجه': 'Abdulrahman Khaja',
  'علي الأنصاري': 'Ali Al-Ansari',
  'غدير الكندري': 'Ghadeer Al-Kandari',
  'فاطمة تقي': 'Fatima Taqi',
  'فاطمة عباس': 'Fatima Abbas',
  'محمد الجيماز': 'Mohammed Al-Jaimaz',
  'مرزوق السعيد': 'Marzouq Al-Saeed',
  'منيرة النخيلان': 'Munira Al-Nakhelan',
  'هيا النصار': 'Haya Al-Nassar',
  'هيا بوراشد': 'Haya Bourashed',
};

/** Only `presenter_ar` values that appear in the schedule file. */
function presenterNameEnForSchedule(schedule: { workshops: { presenter_ar: string }[] }): Record<string, string> {
  const present = new Set(schedule.workshops.map((w) => w.presenter_ar));
  const out: Record<string, string> = {};
  for (const p of present) {
    const en = PRESENTER_NAME_EN_SOURCE[p];
    if (en) {
      out[p] = en;
    }
  }
  return out;
}

const PRESENTER_NAME_EN = presenterNameEnForSchedule(SCHEDULE);

/** Served from `frontend/public/` → `/images/experts/...` at runtime. */
const EXPERT_PORTRAIT_URL = '/images/experts/trump_coach_style.svg';

const DEFAULT_SOCIALS: ExpertSocial[] = [
      { href: 'mailto:hello@example.com', aria: 'experts.socialEmail', kind: 'mail' },
      { href: 'https://www.linkedin.com', aria: 'experts.socialLinkedin', kind: 'linkedin' },
      { href: 'https://x.com', aria: 'experts.socialX', kind: 'x' },
];

function presenterId(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return `p${String(Math.abs(h) % 100000).padStart(5, '0')}`;
}

function specialtyFor(name: string): { ar: string; en: string } {
  if (name.startsWith('المحامي')) {
    return { ar: 'مستشار قانوني', en: 'Lawyer' };
  }
  if (name.startsWith('د. ')) {
    return { ar: 'أكاديمي ومقدّم ورش', en: 'Academic & workshop facilitator' };
  }
  return { ar: 'مقدّم ورش تدريبية', en: 'Workshop facilitator' };
}

function buildHomeExperts(): HomeExpert[] {
  const byPresenter = new Map<string, string[]>();
  for (const w of SCHEDULE.workshops) {
    const slug = `ms-w-${String(w.n).padStart(3, '0')}`;
    const list = byPresenter.get(w.presenter_ar) ?? [];
    list.push(slug);
    byPresenter.set(w.presenter_ar, list);
  }

  const names = [...byPresenter.keys()].sort((a, b) => a.localeCompare(b, 'ar'));

  return names.map((nameAr) => {
    const slugs = [...(byPresenter.get(nameAr) ?? [])].sort();
    const nw = slugs.length;
    const { ar: specialtyAr, en: specialtyEn } = specialtyFor(nameAr);
    const bioAr =
      nw === 1
        ? 'يقدّم ورشة ضمن أسبوع التدريب لطلاب جامعة الكويت (26–30 أبريل 2026).'
        : `يقدّم ${nw} ورشاً ضمن أسبوع التدريب لطلاب جامعة الكويت (26–30 أبريل 2026).`;
    const bioEn =
      nw === 1
        ? 'Delivers a workshop in the Kuwait University student training week (26–30 April 2026).'
        : `Delivers ${nw} workshops in the Kuwait University student training week (26–30 April 2026).`;

    return {
      id: presenterId(nameAr),
      nameAr,
      nameEn: PRESENTER_NAME_EN[nameAr] ?? nameAr,
      specialtyAr,
      specialtyEn,
      bioAr,
      bioEn,
      imageUrl: EXPERT_PORTRAIT_URL,
      socials: DEFAULT_SOCIALS,
      workshopSlugs: slugs,
    };
  });
}

/** Facilitators grouped by `presenter_ar` from `ku_student_week_workshops_schedule_full.json`. */
export const HOME_EXPERTS: HomeExpert[] = buildHomeExperts();
