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
    tagline: 'وصول كامل لجميع الورش التدريبية الـ 100 مع شهادات معتمدة.',
    hint: 'عرض محدود لطلاب جامعة الكويت',
    cta: 'احصل على العرض الآن 💳',
    limitedBadge: '🟢 عرض خاص لفترة محدودة',
    trainerLine: 'نخبة من المدربين',
    venueLine: 'أونلاين عبر Zoom',
    installmentPrefix: 'قسطها على 4 دفعات مع ديمه ',
    installmentAmount: '25 د.ك',
    interestFree: 'بدون فوائد',
    modalBar: 'عرض الـ 100 ورشة',
  },
  en: {
    title: 'The 100 training workshops bundle',
    badge: 'Save 90%',
    priceNow: '100 K.D.',
    priceWas: '1,000 K.D.',
    savePct: 'Save 90%',
    tagline: 'Full access to all 100 training workshops with certified certificates.',
    hint: 'Limited offer for Kuwait University students',
    cta: 'Get the offer now 💳',
    limitedBadge: '🟢 Special offer for a limited time',
    trainerLine: 'Elite trainers',
    venueLine: 'Online via Zoom',
    installmentPrefix: 'Split into 4 payments with Deema ',
    installmentAmount: '25 K.D.',
    interestFree: 'Interest-free',
    modalBar: 'The 100-workshop offer',
  },
} as const;
