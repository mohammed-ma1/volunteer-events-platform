import {
  PACKAGE_CAREER_PREP_SLUG,
  PACKAGE_SOFT_SKILLS_SLUG,
  PACKAGE_AI_SLUG,
  PACKAGE_DIGITAL_SLUG,
} from './package-offer';

export interface CategoryPackagePromo {
  slug: string;
  workshopCount: number;
  ar: {
    title: string;
    priceNow: string;
    priceWas: string;
    savePct: string;
    cta: string;
  };
  en: {
    title: string;
    priceNow: string;
    priceWas: string;
    savePct: string;
    cta: string;
  };
}

export const CATEGORY_PACKAGES: readonly CategoryPackagePromo[] = [
  {
    slug: PACKAGE_CAREER_PREP_SLUG,
    workshopCount: 26,
    ar: {
      title: 'الاستعداد المهني',
      priceNow: '179 د.ك',
      priceWas: '260 د.ك',
      savePct: 'توفير 31%',
      cta: 'اشترِ الباقة',
    },
    en: {
      title: 'Career Readiness',
      priceNow: '179 K.D.',
      priceWas: '260 K.D.',
      savePct: 'Save 31%',
      cta: 'Get this bundle',
    },
  },
  {
    slug: PACKAGE_SOFT_SKILLS_SLUG,
    workshopCount: 48,
    ar: {
      title: 'الكفاءة الشخصية',
      priceNow: '299 د.ك',
      priceWas: '480 د.ك',
      savePct: 'توفير 38%',
      cta: 'اشترِ الباقة',
    },
    en: {
      title: 'Personal Competence',
      priceNow: '299 K.D.',
      priceWas: '480 K.D.',
      savePct: 'Save 38%',
      cta: 'Get this bundle',
    },
  },
  {
    slug: PACKAGE_AI_SLUG,
    workshopCount: 11,
    ar: {
      title: 'الذكاء الاصطناعي',
      priceNow: '79 د.ك',
      priceWas: '110 د.ك',
      savePct: 'توفير 28%',
      cta: 'اشترِ الباقة',
    },
    en: {
      title: 'Artificial Intelligence',
      priceNow: '79 K.D.',
      priceWas: '110 K.D.',
      savePct: 'Save 28%',
      cta: 'Get this bundle',
    },
  },
  {
    slug: PACKAGE_DIGITAL_SLUG,
    workshopCount: 15,
    ar: {
      title: 'المهارات الرقمية',
      priceNow: '99 د.ك',
      priceWas: '150 د.ك',
      savePct: 'توفير 34%',
      cta: 'اشترِ الباقة',
    },
    en: {
      title: 'Digital Skills',
      priceNow: '99 K.D.',
      priceWas: '150 K.D.',
      savePct: 'Save 34%',
      cta: 'Get this bundle',
    },
  },
];
