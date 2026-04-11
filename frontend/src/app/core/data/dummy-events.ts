import { VolunteerEvent } from '../models/api.types';

export type WorkshopCategory =
  | 'all'
  | 'leadership'
  | 'digital'
  | 'ai'
  | 'personal'
  | 'cv'
  | 'career';

export interface HomeListEvent extends VolunteerEvent {
  category: WorkshopCategory;
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
    title: 'Basics of Artificial Intelligence',
    titleAr: 'أساسيات الذكاء الاصطناعي',
    slug: 'basics-of-artificial-intelligence',
    summary:
      'An introductory workshop covering core AI concepts, practical use cases, and ethical considerations for students entering the field.',
    summaryAr:
      'ورشة تمهيدية تغطي مفاهيم الذكاء الاصطناعي الأساسية، حالات الاستخدام العملية، والاعتبارات الأخلاقية.',
    description: null,
    image_url: img('photo-1677442136019-21780ecad995'),
    starts_at: '2026-05-22T10:00:00.000Z',
    ends_at: '2026-05-22T14:00:00.000Z',
    location: 'Online via Zoom',
    locationAr: 'عبر الإنترنت — زوم',
    price: 10,
    currency: 'KWD',
    capacity: 80,
    is_featured: true,
    is_published: true,
    category: 'ai',
  },
  {
    id: -2,
    title: 'Student Innovation Hackathon',
    titleAr: 'هاكاثون الابتكار الطلابي',
    slug: 'student-innovation-hackathon',
    summary:
      'Team up for a weekend of building prototypes, mentorship rounds, and a friendly demo day with industry guests.',
    summaryAr:
      'شارك في فريق لبناء نماذج أولية مع إرشاد من الخبراء ويوم عرض تقديمي مع ضيوف من القطاع.',
    description: null,
    image_url: img('photo-1540575467063-178a50c2df87'),
    starts_at: '2026-06-03T09:00:00.000Z',
    ends_at: '2026-06-04T18:00:00.000Z',
    location: 'Shadadiyah Campus — Innovation Lab',
    locationAr: 'حرم الشدادية — مختبر الابتكار',
    price: 20,
    currency: 'KWD',
    capacity: 120,
    is_featured: true,
    is_published: true,
    category: 'digital',
  },
  {
    id: -3,
    title: 'Career Path Planning Forum',
    titleAr: 'ملتقى تخطيط المسار المهني',
    slug: 'career-path-planning-forum',
    summary:
      'Panel discussions with alumni and recruiters on choosing majors, internships, and long-term career planning.',
    summaryAr:
      'جلسات مع خريجين ومسؤولي توظيف حول اختيار التخصص والتدريب وتخطيط المسار المهني.',
    description: null,
    image_url: img('photo-1524178232363-1fb2b075b655'),
    starts_at: '2026-05-18T16:00:00.000Z',
    ends_at: '2026-05-18T19:00:00.000Z',
    location: 'Main Auditorium',
    locationAr: 'القاعة الرئيسية',
    price: 0,
    currency: 'KWD',
    capacity: 300,
    is_featured: true,
    is_published: true,
    category: 'career',
  },
  {
    id: -4,
    title: 'Presentation and Communication Skills',
    titleAr: 'مهارات العرض والتواصل',
    slug: 'presentation-and-communication-skills',
    summary:
      'Practice storytelling, slide design, and confident delivery with peer feedback in small breakout groups.',
    summaryAr:
      'تدريب على السرد البصري وتصميم الشرائح والثقة في العرض مع ملاحظات من الزملاء.',
    description: null,
    image_url: img('photo-1552664730-d307ca884978'),
    starts_at: '2026-05-30T11:00:00.000Z',
    ends_at: '2026-05-30T15:00:00.000Z',
    location: 'College of Business — Room 204',
    locationAr: 'كلية إدارة الأعمال — قاعة 204',
    price: 15,
    currency: 'KWD',
    capacity: 40,
    is_featured: false,
    is_published: true,
    category: 'personal',
  },
  {
    id: -5,
    title: 'Leadership Essentials for Student Teams',
    titleAr: 'أساسيات القيادة للفرق الطلابية',
    slug: 'leadership-essentials-student-teams',
    summary:
      'Frameworks for delegation, feedback, and running effective student clubs and volunteer initiatives.',
    summaryAr:
      'أطر عمل للتفويض والملاحظات وإدارة الأندية الطلابية والمبادرات التطوعية بفعالية.',
    description: null,
    image_url: img('photo-1517245386807-bb43f82c33c4'),
    starts_at: '2026-06-10T14:00:00.000Z',
    ends_at: '2026-06-10T17:00:00.000Z',
    location: 'Leadership Center',
    locationAr: 'مركز القيادة',
    price: 12,
    currency: 'KWD',
    capacity: 50,
    is_featured: false,
    is_published: true,
    category: 'leadership',
  },
  {
    id: -6,
    title: 'CV Clinic & Mock Interviews',
    titleAr: 'عيادة السيرة الذاتية والمقابلات الوهمية',
    slug: 'cv-clinic-mock-interviews',
    summary:
      'One-on-one CV reviews and recorded mock interviews with structured feedback from career advisors.',
    summaryAr:
      'مراجعة فردية للسيرة ومقابلات تجريبية مسجلة مع ملاحظات من مستشارين مهنيين.',
    description: null,
    image_url: img('photo-1560250097-0b93528c311a'),
    starts_at: '2026-06-01T09:00:00.000Z',
    ends_at: '2026-06-01T13:00:00.000Z',
    location: 'Career Services Office',
    locationAr: 'مكتب الخدمات المهنية',
    price: 8,
    currency: 'KWD',
    capacity: 30,
    is_featured: false,
    is_published: true,
    category: 'cv',
  },
];

const CATEGORY_KEYWORDS: { cat: WorkshopCategory; keys: string[] }[] = [
  {
    cat: 'ai',
    keys: [
      'ai',
      'artificial',
      'machine learning',
      'ذكاء',
      'اصطناعي',
      'python',
      'react',
      'سايبر',
      'أمن',
      'تحليل البيانات',
    ],
  },
  {
    cat: 'digital',
    keys: ['digital', 'code', 'hack', 'tech', 'ابتكار', 'برمج', 'فيديو', 'زوايا', 'لقطات', 'ui'],
  },
  { cat: 'leadership', keys: ['leadership', 'lead', 'team', 'قيادة', 'إدارة', 'وقت', 'ضغط', '90 يوم'] },
  {
    cat: 'personal',
    keys: [
      'communication',
      'presentation',
      'personal',
      'عرض',
      'تواصل',
      'رسم',
      'مشاعر',
      'استرخاء',
      'صمود',
      'توتر',
      'غذاء',
      'سناكات',
      'عطر',
      'عاطفي',
      'شخصيات',
      'اتيكيت',
      'علاقات',
    ],
  },
  {
    cat: 'cv',
    keys: ['cv', 'interview', 'resume', 'سيرة', 'مقابلة', 'smart', 'star', 'أهداف', 'سيرة'],
  },
  {
    cat: 'career',
    keys: ['career', 'path', 'forum', 'mentor', 'مسار', 'مهني', 'قانون', 'تسويق', 'مسؤولية', 'مجتمع'],
  },
];

export function inferCategory(ev: VolunteerEvent): WorkshopCategory {
  const blob = `${ev.title} ${ev.summary ?? ''}`.toLowerCase();
  for (const { cat, keys } of CATEGORY_KEYWORDS) {
    if (keys.some((k) => blob.includes(k))) {
      return cat;
    }
  }
  return 'career';
}

export function volunteerToHome(ev: VolunteerEvent): HomeListEvent {
  return {
    ...ev,
    image_url: ev.image_url ?? `https://picsum.photos/seed/ve-${ev.id}/800/520`,
    category: inferCategory(ev),
  };
}

export function getDummyBySlug(slug: string): HomeListEvent | undefined {
  return DUMMY_HOME_EVENTS.find((e) => e.slug === slug);
}
