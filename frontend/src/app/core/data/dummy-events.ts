import { VolunteerEvent } from '../models/api.types';

/** Inferred / stored on each event (keywords). */
export type WorkshopCategory = 'personal' | 'professional';

/** Filter chips on the workshops grid (matches source project's 2-category system). */
export type WorkshopFilterCategory = 'all' | 'personal' | 'professional';

export function workshopCategoryToFilterGroup(
  c: WorkshopCategory,
): Exclude<WorkshopFilterCategory, 'all'> {
  return c;
}

export function eventMatchesWorkshopFilter(
  filter: WorkshopFilterCategory,
  c: WorkshopCategory,
): boolean {
  if (filter === 'all') {
    return true;
  }
  return c === filter;
}

export interface HomeListEvent extends VolunteerEvent {
  category: WorkshopCategory;
  /** Arabic display title when `title` holds English (legacy dummy); API uses `title` as Arabic. */
  titleAr?: string;
  summaryAr?: string;
  locationAr?: string;
}

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

/** Placeholder workshops for UI until real content is wired; negative IDs skip cart API. */
export const DUMMY_HOME_EVENTS: HomeListEvent[] = [
  {
    id: -1,
    title: 'أساسيات الذكاء الاصطناعي',
    title_en: 'Basics of Artificial Intelligence',
    slug: 'basics-of-artificial-intelligence',
    summary:
      'ورشة تمهيدية تغطي مفاهيم الذكاء الاصطناعي الأساسية، حالات الاستخدام العملية، والاعتبارات الأخلاقية.',
    summary_en:
      'An introductory workshop covering core AI concepts, practical use cases, and ethical considerations for students entering the field.',
    description: null,
    description_en: null,
    image_url: img('photo-1677442136019-21780ecad995'),
    starts_at: '2026-05-22T10:00:00.000Z',
    ends_at: '2026-05-22T14:00:00.000Z',
    location: 'عبر الإنترنت — زوم',
    location_en: 'Online via Zoom',
    price: 5,
    currency: 'KWD',
    capacity: 80,
    is_featured: true,
    is_published: true,
    category: 'professional',
  },
  {
    id: -2,
    title: 'هاكاثون الابتكار الطلابي',
    title_en: 'Student Innovation Hackathon',
    slug: 'student-innovation-hackathon',
    summary:
      'شارك في فريق لبناء نماذج أولية مع إرشاد من الخبراء ويوم عرض تقديمي مع ضيوف من القطاع.',
    summary_en:
      'Team up for a weekend of building prototypes, mentorship rounds, and a friendly demo day with industry guests.',
    description: null,
    description_en: null,
    image_url: img('photo-1540575467063-178a50c2df87'),
    starts_at: '2026-06-03T09:00:00.000Z',
    ends_at: '2026-06-04T18:00:00.000Z',
    location: 'حرم الشدادية — مختبر الابتكار',
    location_en: 'Shadadiyah Campus — Innovation Lab',
    price: 5,
    currency: 'KWD',
    capacity: 120,
    is_featured: true,
    is_published: true,
    category: 'professional',
  },
  {
    id: -3,
    title: 'ملتقى تخطيط المسار المهني',
    title_en: 'Career Path Planning Forum',
    slug: 'career-path-planning-forum',
    summary: 'جلسات مع خريجين ومسؤولي توظيف حول اختيار التخصص والتدريب وتخطيط المسار المهني.',
    summary_en:
      'Panel discussions with alumni and recruiters on choosing majors, internships, and long-term career planning.',
    description: null,
    description_en: null,
    image_url: img('photo-1524178232363-1fb2b075b655'),
    starts_at: '2026-05-18T16:00:00.000Z',
    ends_at: '2026-05-18T19:00:00.000Z',
    location: 'القاعة الرئيسية',
    location_en: 'Main Auditorium',
    price: 5,
    currency: 'KWD',
    capacity: 300,
    is_featured: true,
    is_published: true,
    category: 'professional',
  },
  {
    id: -4,
    title: 'مهارات العرض والتواصل',
    title_en: 'Presentation and Communication Skills',
    slug: 'presentation-and-communication-skills',
    summary: 'تدريب على السرد البصري وتصميم الشرائح والثقة في العرض مع ملاحظات من الزملاء.',
    summary_en:
      'Practice storytelling, slide design, and confident delivery with peer feedback in small breakout groups.',
    description: null,
    description_en: null,
    image_url: img('photo-1552664730-d307ca884978'),
    starts_at: '2026-05-30T11:00:00.000Z',
    ends_at: '2026-05-30T15:00:00.000Z',
    location: 'كلية إدارة الأعمال — قاعة 204',
    location_en: 'College of Business — Room 204',
    price: 5,
    currency: 'KWD',
    capacity: 40,
    is_featured: false,
    is_published: true,
    category: 'personal',
  },
  {
    id: -5,
    title: 'أساسيات القيادة للفرق الطلابية',
    title_en: 'Leadership Essentials for Student Teams',
    slug: 'leadership-essentials-student-teams',
    summary: 'أطر عمل للتفويض والملاحظات وإدارة الأندية الطلابية والمبادرات التطوعية بفعالية.',
    summary_en:
      'Frameworks for delegation, feedback, and running effective student clubs and volunteer initiatives.',
    description: null,
    description_en: null,
    image_url: img('photo-1517245386807-bb43f82c33c4'),
    starts_at: '2026-06-10T14:00:00.000Z',
    ends_at: '2026-06-10T17:00:00.000Z',
    location: 'مركز القيادة',
    location_en: 'Leadership Center',
    price: 5,
    currency: 'KWD',
    capacity: 50,
    is_featured: false,
    is_published: true,
    category: 'personal',
  },
  {
    id: -6,
    title: 'عيادة السيرة الذاتية والمقابلات الوهمية',
    title_en: 'CV Clinic & Mock Interviews',
    slug: 'cv-clinic-mock-interviews',
    summary: 'مراجعة فردية للسيرة ومقابلات تجريبية مسجلة مع ملاحظات من مستشارين مهنيين.',
    summary_en:
      'One-on-one CV reviews and recorded mock interviews with structured feedback from career advisors.',
    description: null,
    description_en: null,
    image_url: img('photo-1560250097-0b93528c311a'),
    starts_at: '2026-06-01T09:00:00.000Z',
    ends_at: '2026-06-01T13:00:00.000Z',
    location: 'مكتب الخدمات المهنية',
    location_en: 'Career Services Office',
    price: 5,
    currency: 'KWD',
    capacity: 30,
    is_featured: false,
    is_published: true,
    category: 'professional',
  },
];

/** Keyword fallback when seeder hasn't tagged the summary with [personal]/[professional]. */
const PERSONAL_KEYWORDS = [
  'رسم', 'فن', 'مشاعر', 'استرخاء', 'صمود', 'توتر', 'غذاء', 'سناكات', 'عاطفي', 'شخصيات',
  'اتيكيت', 'لغة', 'إلقاء', 'سأكتب', 'تسويق', 'إنتاج فني', 'سيناريو', 'فيلم', 'كرة',
  'تحكيم', 'صناعة الحظ', 'عقلية', 'الذكاء العاطفي', 'الشموع', 'مسئولية', 'السبع عادات',
  'تخطيط', 'بوصلة', 'كسر قيود', 'محطة', 'صناعة الأثر',
];

const PROFESSIONAL_KEYWORDS = [
  'مقابلة', 'سيرة', 'مهني', 'قانون', 'تجاري', 'موظف', 'وظيفة', 'بايثون', 'ذكاء اصطناعي',
  'ai ', 'أمن سيبراني', 'بيانات', 'تحليل', 'mvp', 'تداول', 'أتمتة', 'ui', 'tech',
  'تصميم', 'جرافيك', 'ديجتال', 'تصوير', 'فيديو', 'الايميل', 'إيميل', 'العمل',
];

export function inferCategory(ev: {
  title: string;
  title_en?: string | null;
  summary?: string | null;
}): WorkshopCategory {
  // Prefer explicit tag from seeder ("[personal] ..." or "[professional] ...").
  const summary = (ev.summary ?? '').trim();
  if (summary.startsWith('[personal]')) {
    return 'personal';
  }
  if (summary.startsWith('[professional]')) {
    return 'professional';
  }
  const blob = `${ev.title} ${ev.title_en ?? ''} ${summary}`.toLowerCase();
  for (const k of PERSONAL_KEYWORDS) {
    if (blob.includes(k)) {
      return 'personal';
    }
  }
  for (const k of PROFESSIONAL_KEYWORDS) {
    if (blob.includes(k)) {
      return 'professional';
    }
  }
  return 'professional';
}

export function volunteerToHome(ev: VolunteerEvent): HomeListEvent {
  const partial = ev as Partial<HomeListEvent>;
  return {
    ...ev,
    image_url: ev.image_url ?? `https://picsum.photos/seed/ve-${ev.id}/800/520`,
    category: inferCategory(ev),
    titleAr: partial.titleAr ?? ev.title,
    summaryAr: partial.summaryAr ?? ev.summary ?? undefined,
    locationAr: partial.locationAr ?? ev.location ?? undefined,
  };
}

export function getDummyBySlug(slug: string): HomeListEvent | undefined {
  return DUMMY_HOME_EVENTS.find((e) => e.slug === slug);
}
