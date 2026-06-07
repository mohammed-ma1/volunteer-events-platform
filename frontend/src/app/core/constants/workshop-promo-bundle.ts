/**
 * One source of truth for the 100-workshop bundle promo (AR + EN).
 * Marketing line on the bundle card / modal; checkout uses API `price` for `package-100-workshops`.
 */
export const WORKSHOP_PROMO_BUNDLE = {
  ar: {
    title: 'باقة الـ 100 ورشة التدريبية',
    badge: 'خصم 90\u066a',
    priceNow: '100 د.ك',
    priceWas: '1,000 د.ك',
    savePct: 'توفير 90\u066a',
    tagline: 'بدلاً من شراء كل ورشة على حدة، احصل على وصول فوري لجميع الـ 100 ورشة مع 100 شهادة معتمدة.',
    hint: 'عرض لفترة محدودة',
    cta: 'احصل على الباقة الآن',
    limitedBadge: '🟢 عرض خاص لفترة محدودة',
    trainerLine: 'نخبة من المدربين',
    venueLine: 'أونلاين عبر Zoom',
    installmentPrefix: 'ادفعها على 4 دفعات مع ديمه',
    installmentAmount: '25 د.ك',
    interestFree: 'بدون فوائد',
    modalBar: 'عرض الـ 100 ورشة',
  },
  en: {
    title: '100 Training Workshops Bundle',
    badge: 'Save 90%',
    priceNow: '100 KD',
    priceWas: '1,000 KD',
    savePct: 'Save 90%',
    tagline: 'Instead of buying each workshop separately, get instant access to all 100 workshops with 100 accredited certificates.',
    hint: 'Limited-time offer',
    cta: 'Get the package now',
    limitedBadge: '🟢 Special offer for a limited time',
    trainerLine: 'Elite trainers',
    venueLine: 'Online via Zoom',
    installmentPrefix: 'Pay in 4 installments with Deema',
    installmentAmount: '25 KD',
    interestFree: 'Interest-free',
    modalBar: 'The 100-workshop offer',
  },
} as const;
