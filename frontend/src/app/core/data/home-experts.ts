import { TranslationKey } from '../i18n/translations';

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

export const HOME_EXPERTS: HomeExpert[] = [
  {
    id: 'ahmed',
    nameAr: 'د. أحمد عبدالله',
    nameEn: 'Dr. Ahmed Abdullah',
    specialtyAr: 'خبير الذكاء الاصطناعي',
    specialtyEn: 'AI specialist',
    bioAr:
      'أكاديمي وباحث في تطبيقات التعلم الآلي واللغة الطبيعية، يقدّم ورشاً تطبيقية للطلاب حول الأدوات الحديثة والممارسات الأخلاقية للذكاء الاصطناعي.',
    bioEn:
      'Academic and researcher in applied machine learning and NLP, delivering hands-on student workshops on modern tooling and responsible AI practice.',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=720&q=80',
    socials: [
      { href: 'mailto:hello@example.com', aria: 'experts.socialEmail', kind: 'mail' },
      { href: 'https://www.linkedin.com', aria: 'experts.socialLinkedin', kind: 'linkedin' },
      { href: 'https://x.com', aria: 'experts.socialX', kind: 'x' },
    ],
    workshopSlugs: ['basics-of-artificial-intelligence', 'student-innovation-hackathon'],
  },
  {
    id: 'sarah',
    nameAr: 'م. سارة محمد',
    nameEn: 'Eng. Sarah Mohammed',
    specialtyAr: 'مدربة مهارات العرض والتواصل',
    specialtyEn: 'Presentation & communication trainer',
    bioAr:
      'تساعد الفرق الطلابية على بناء ثقة بالعام وبناء محتوى واضح، مع تغذية راجعة عملية بعد كل جلسة تدريبية.',
    bioEn:
      'Helps student teams build confident delivery and clear narratives, with practical feedback after every training block.',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=80',
    socials: [
      { href: 'mailto:sarah@example.com', aria: 'experts.socialEmail', kind: 'mail' },
      { href: 'https://www.linkedin.com', aria: 'experts.socialLinkedin', kind: 'linkedin' },
    ],
    workshopSlugs: ['presentation-and-communication-skills', 'career-path-planning-forum'],
  },
  {
    id: 'khalid',
    nameAr: 'م. خالد الدوسري',
    nameEn: 'Eng. Khalid Al-Dosari',
    specialtyAr: 'ميسّر ورش الابتكار والعمل الجماعي',
    specialtyEn: 'Innovation & teamwork facilitator',
    bioAr:
      'يركّز على تحويل الأفكار إلى تجارب قابلة للاختبار عبر ورش مكثفة وجلسات عصف ذهني منظّمة.',
    bioEn:
      'Focuses on turning ideas into testable experiences through intensive workshops and structured ideation sessions.',
    imageUrl:
      'https://images.leadconnectorhq.com/image/f_webp/q_80/r_800/u_https://assets.cdn.filesafe.space/YAuEX9ihHtdKDKEvbw4a/media/69d7a8ef982fd67a35d9f15e.webp',
    socials: [
      { href: 'mailto:khalid@example.com', aria: 'experts.socialEmail', kind: 'mail' },
      { href: 'https://www.linkedin.com', aria: 'experts.socialLinkedin', kind: 'linkedin' },
      { href: 'https://x.com', aria: 'experts.socialX', kind: 'x' },
    ],
    workshopSlugs: ['leadership-essentials-student-teams', 'cv-clinic-mock-interviews'],
  },
  {
    id: 'norah',
    nameAr: 'د. نورة العجمي',
    nameEn: 'Dr. Norah Al-Ajmi',
    specialtyAr: 'خبيرة المسارات المهنية والتوجيه الأكاديمي',
    specialtyEn: 'Career pathways & academic advising',
    bioAr:
      'تربط بين احتياجات سوق العمل وخيارات الطلاب الأكاديمية من خلال جلسات إرشاد جماعية وفردية.',
    bioEn:
      'Connects labour-market signals with student academic choices through group and one-to-one advising sessions.',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=80',
    socials: [
      { href: 'mailto:norah@example.com', aria: 'experts.socialEmail', kind: 'mail' },
      { href: 'https://www.linkedin.com', aria: 'experts.socialLinkedin', kind: 'linkedin' },
    ],
    workshopSlugs: ['career-path-planning-forum', 'presentation-and-communication-skills'],
  },
];
