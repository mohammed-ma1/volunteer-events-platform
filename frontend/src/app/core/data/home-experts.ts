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
  'أحمد سمير': 'Ahmed Sameer',
  'المحامي إبراهيم السماعيل': 'Lawyer Ibrahim Al-Samaeel',
  'بدر الفيلكاوي': 'Bader Al-Failakawi',
  'حسن سيد': 'Hassan Sayed',
  'خالد الشمري': 'Khalid Al-Shammari',
  'د. بسام الجزاف': 'Dr. Bassam Al-Jazzaf',
  'د. جواد أبو الحسن': 'Dr. Jawad Abu Al-Hasan',
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
  'عبدالعزيز الضبيب': 'Abdulaziz Al-Dhabib',
  'علي الأنصاري': 'Ali Al-Ansari',
  'غدير الكندري': 'Ghadeer Al-Kandari',
  'فاطمة القطان': 'Fatima Al-Qattan',
  'فاطمة عباس': 'Fatima Abbas',
  'فيصل الدويسان': 'Faisal Al-Duwaisan',
  'محمد الجيماز': 'Mohammed Al-Jaimaz',
  'مرزوق السعيد': 'Marzouq Al-Saeed',
  'منيرة النخيلان': 'Munira Al-Nakhelan',
  'هاجر النصار': 'Hajar Al-Nassar',
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

const PRESENTER_AVATAR_OVERRIDES: Record<string, string> = {
  'د. بسام الجزاف': '/images/presenters/bassam-al-jazzaf.jpg',
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

/** Brand-aligned palette for UI Avatars (deterministic per expert id). */
const AVATAR_BG_COLORS = ['001a33', '0c4a6e', '164e63', '1e3a5f', '312e81', '3730a3', '4c1d95', '831843'];

function professionalExpertAvatarUrl(expertId: string, nameEn: string): string {
  const label = nameEn.trim() || 'Expert';
  const idx = Math.abs(parseInt(expertId.replace(/\D/g, '') || '0', 10)) % AVATAR_BG_COLORS.length;
  const bg = AVATAR_BG_COLORS[idx];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&size=512&background=${bg}&color=ffffff&bold=true&format=png`;
}

const DEFAULT_SOCIALS: ExpertSocial[] = [];

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

    const id = presenterId(nameAr);
    const nameEn = PRESENTER_NAME_EN[nameAr] ?? nameAr;
    const avatarOverride = PRESENTER_AVATAR_OVERRIDES[nameAr];
    return {
      id,
      nameAr,
      nameEn,
      specialtyAr,
      specialtyEn,
      bioAr,
      bioEn,
      imageUrl: avatarOverride ?? professionalExpertAvatarUrl(id, nameEn),
      socials: DEFAULT_SOCIALS,
      workshopSlugs: slugs,
    };
  });
}

/** Facilitators grouped by `presenter_ar` from `ku_student_week_workshops_schedule_full.json`. */
export const HOME_EXPERTS: HomeExpert[] = buildHomeExperts();
