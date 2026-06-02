import {
  PACKAGE_PERSONAL_50_SLUG,
  PACKAGE_PROFESSIONAL_50_SLUG,
} from './package-offer';

export interface CategoryPackagePromo {
  slug: string;
  workshopCount: number;
  /** Filter category this bundle is associated with. */
  filterCategory: 'personal' | 'professional';
  ar: {
    title: string;
    tagline: string;
    priceNow: string;
    priceWas: string;
    savePct: string;
    installmentPrefix: string;
    installmentAmount: string;
    interestFree: string;
    cta: string;
  };
  en: {
    title: string;
    tagline: string;
    priceNow: string;
    priceWas: string;
    savePct: string;
    installmentPrefix: string;
    installmentAmount: string;
    interestFree: string;
    cta: string;
  };
}

export const CATEGORY_PACKAGES: readonly CategoryPackagePromo[] = [
  {
    slug: PACKAGE_PERSONAL_50_SLUG,
    workshopCount: 50,
    filterCategory: 'personal',
    ar: {
      title: 'باقة مهارات الكفاءة الشخصية',
      tagline:
        'بدلاً من شراء كل ورشة على حدة، احصل على وصول فوري لجميع الـ 50 ورشة في هذا التصنيف مع 50 شهادة معتمدة.',
      priceNow: '50 د.ك',
      priceWas: '500 د.ك',
      savePct: 'وفر 90%',
      installmentPrefix: 'ادفعها على 4 دفعات مع ديمه',
      installmentAmount: '12.500 د.ك',
      interestFree: 'بدون فوائد',
      cta: 'احصل على الباقة الآن',
    },
    en: {
      title: 'Personal Competence Skills Bundle',
      tagline:
        'Instead of buying each workshop separately, get instant access to all 50 workshops in this category with 50 accredited certificates.',
      priceNow: '50 KD',
      priceWas: '500 KD',
      savePct: 'Save 90%',
      installmentPrefix: 'Pay in 4 installments with Deema',
      installmentAmount: '12.500 KD',
      interestFree: 'Interest-free',
      cta: 'Get the package now',
    },
  },
  {
    slug: PACKAGE_PROFESSIONAL_50_SLUG,
    workshopCount: 50,
    filterCategory: 'professional',
    ar: {
      title: 'باقة الاستعداد المهني والتقني',
      tagline:
        'بدلاً من شراء كل ورشة على حدة، احصل على وصول فوري لجميع الـ 50 ورشة في هذا التصنيف مع 50 شهادة معتمدة.',
      priceNow: '50 د.ك',
      priceWas: '500 د.ك',
      savePct: 'وفر 90%',
      installmentPrefix: 'ادفعها على 4 دفعات مع ديمه',
      installmentAmount: '12.500 د.ك',
      interestFree: 'بدون فوائد',
      cta: 'احصل على الباقة الآن',
    },
    en: {
      title: 'Professional & Technical Readiness Bundle',
      tagline:
        'Instead of buying each workshop separately, get instant access to all 50 workshops in this category with 50 accredited certificates.',
      priceNow: '50 KD',
      priceWas: '500 KD',
      savePct: 'Save 90%',
      installmentPrefix: 'Pay in 4 installments with Deema',
      installmentAmount: '12.500 KD',
      interestFree: 'Interest-free',
      cta: 'Get the package now',
    },
  },
];

export function findCategoryPackage(filterCategory: 'personal' | 'professional'): CategoryPackagePromo | undefined {
  return CATEGORY_PACKAGES.find((p) => p.filterCategory === filterCategory);
}
