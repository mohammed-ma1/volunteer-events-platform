export type Locale = 'ar' | 'en';

export type TranslationKey =
  | 'nav.home'
  | 'nav.workshops'
  | 'nav.career'
  | 'nav.about'
  | 'nav.searchAria'
  | 'nav.langShortAr'
  | 'nav.langShortEn'
  | 'hero.badge'
  | 'hero.title1'
  | 'hero.title2'
  | 'hero.body'
  | 'hero.ctaBrowse'
  | 'hero.ctaPaths'
  | 'hero.stat'
  | 'hero.imageAlt'
  | 'hero.promoLine'
  | 'feat1.title'
  | 'feat1.desc'
  | 'feat2.title'
  | 'feat2.desc'
  | 'feat3.title'
  | 'feat3.desc'
  | 'feat4.title'
  | 'feat4.desc'
  | 'workshops.title'
  | 'workshops.subtitle'
  | 'workshops.viewAll'
  | 'workshops.searchPlaceholder'
  | 'workshops.loadError'
  | 'workshops.loadMore'
  | 'workshops.loading'
  | 'workshops.demoHint'
  | 'workshops.empty'
  | 'cat.all'
  | 'cat.leadership'
  | 'cat.digital'
  | 'cat.ai'
  | 'cat.personal'
  | 'cat.cv'
  | 'cat.career'
  | 'card.addCart'
  | 'card.added'
  | 'card.buyNow'
  | 'card.free'
  | 'faq.title'
  | 'faq.subtitle'
  | 'faq.q1'
  | 'faq.a1'
  | 'faq.q2'
  | 'faq.a2'
  | 'faq.q3'
  | 'faq.a3'
  | 'faq.q4'
  | 'faq.a4'
  | 'footer.brand'
  | 'footer.quick'
  | 'footer.linkHome'
  | 'footer.linkWorkshops'
  | 'footer.linkCareer'
  | 'footer.linkAbout'
  | 'footer.policies'
  | 'footer.terms'
  | 'footer.privacy'
  | 'footer.refund'
  | 'footer.contact'
  | 'footer.newsletter'
  | 'footer.newsletterHint'
  | 'footer.emailPlaceholder'
  | 'footer.subscribe'
  | 'footer.copyright'
  | 'cart.title'
  | 'cart.subtitle'
  | 'cart.close'
  | 'cart.empty'
  | 'cart.loading'
  | 'cart.remove'
  | 'cart.subtotal'
  | 'cart.checkout'
  | 'cart.viewFull'
  | 'cart.reviewDetail'
  | 'cart.lineTotal'
  | 'cart.browseWorkshops'
  | 'checkout.title'
  | 'checkout.subtitle'
  | 'checkout.labelName'
  | 'checkout.labelEmail'
  | 'checkout.labelPhone'
  | 'checkout.payTap'
  | 'checkout.paying'
  | 'checkout.noPaymentUrl'
  | 'checkout.failed'
  | 'checkout.paySecureBelow'
  | 'checkout.openPaymentNewTab'
  | 'checkout.processingPayment'
  | 'checkout.iframeTitle'
  | 'checkout.paymentFailedOrCancelled'
  | 'checkout.paymentPollTimeout'
  | 'checkout.errorPaymentProvider'
  | 'checkout.errorMissingCart'
  | 'checkout.networkError'
  | 'checkout.localTapDevWarning'
  | 'checkout.tapLeavingSite'
  | 'checkout.preparingTap'
  | 'checkout.loadingTapFrame'
  | 'tapReturn.finishing'
  | 'complete.title'
  | 'complete.status'
  | 'complete.receipt'
  | 'complete.total'
  | 'complete.loading'
  | 'complete.back'
  | 'complete.missingOrder'
  | 'complete.loadError'
  | 'complete.paidBadge'
  | 'complete.capturedHint'
  | 'complete.notPaidYet'
  | 'failed.title'
  | 'failed.reasonTimeout'
  | 'failed.reasonError'
  | 'failed.reasonDeclined'
  | 'failed.orderRef'
  | 'failed.tryAgain'
  | 'failed.browseWorkshops'
  | 'detail.back'
  | 'detail.featured'
  | 'detail.registration'
  | 'detail.addCart'
  | 'detail.notFound'
  | 'about.title'
  | 'about.intro'
  | 'about.missionTitle'
  | 'about.missionText'
  | 'about.offerTitle'
  | 'about.offer1'
  | 'about.offer2'
  | 'about.offer3'
  | 'about.partnerTitle'
  | 'about.partnerText'
  | 'about.ctaWorkshops'
  | 'about.ctaCareer'
  | 'careerPage.title'
  | 'careerPage.intro'
  | 'careerPage.pathsTitle'
  | 'careerPage.path1Title'
  | 'careerPage.path1Text'
  | 'careerPage.path2Title'
  | 'careerPage.path2Text'
  | 'careerPage.path3Title'
  | 'careerPage.path3Text'
  | 'careerPage.stepsTitle'
  | 'careerPage.step1'
  | 'careerPage.step2'
  | 'careerPage.step3'
  | 'careerPage.ctaBrowse';

export const TRANSLATIONS: Record<Locale, Record<TranslationKey, string>> = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.workshops': 'الورش التدريبية',
    'nav.career': 'المسار المهني',
    'nav.about': 'عن المنصة',
    'nav.searchAria': 'بحث',
    'nav.langShortAr': 'ع',
    'nav.langShortEn': 'EN',
    'hero.badge': 'منصة التطوير الطلابي لجامعة الكويت',
    'hero.title1': 'طوّر مهاراتك،',
    'hero.title2': 'وابنِ مستقبلك المهني',
    'hero.body':
      'استكشف مجموعة واسعة من الورش والفعاليات المصممة لتعزيز قدراتك وإعدادك لسوق العمل—ورش مخصصة لطلاب جامعة الكويت بالتعاون مع شركة نكست لفل. تسجيل آمن عبر المنصة.',
    'hero.ctaBrowse': 'تصفح الورش المتاحة',
    'hero.ctaPaths': 'تعرف على المسارات',
    'hero.stat': '+100 ورشة معتمدة',
    'hero.imageAlt': 'طلاب يشاركون في ورشة تدريبية',
    'hero.promoLine': 'احصل على جميع الورش بخصم خاص لطلاب جامعة الكويت · الأحد ٢٦–٤–٢٠٢٦ حتى الخميس ٣٠–٤–٢٠٢٦',
    'feat1.title': 'تطوير مستمر',
    'feat1.desc': 'مسارات تعليمية متكاملة تواكب متطلبات العصر.',
    'feat2.title': 'محتوى تطبيقي',
    'feat2.desc': 'ورش عمل تركز على التطبيق العملي والمهارات الحقيقية.',
    'feat3.title': 'مدربون خبراء',
    'feat3.desc': 'تعلّم من نخبة الأكاديميين والمختصين في سوق العمل.',
    'feat4.title': 'شهادات معتمدة',
    'feat4.desc': 'احصل على شهادات موثقة تعزز سيرتك الذاتية.',
    'workshops.title': 'سجّل الآن في الورش',
    'workshops.subtitle':
      'اختر من بين مجموعة متنوعة من البرامج لتطوير مهاراتك. جميع الورش مباشرة في التوقيت المحدد ومسجّلة للمشاهدة لاحقاً عبر المنصة التعليمية.',
    'workshops.viewAll': 'عرض جميع الورش',
    'workshops.searchPlaceholder': 'ابحث عن ورشة…',
    'workshops.loadError': 'تعذر تحميل الورش. تأكد من تشغيل الخادم على المنفذ 8000.',
    'workshops.loadMore': 'تحميل المزيد',
    'workshops.loading': 'جاري التحميل…',
    'workshops.demoHint':
      'الورش أونلاين عبر زوم؛ يُرجى التأكد من تشغيل واجهة البرمجة (API) لإتمام الدفع والتسجيل عبر المنصة.',
    'workshops.empty': 'لا توجد ورش مطابقة.',
    'cat.all': 'الكل',
    'cat.leadership': 'القيادة والتطوير المهني',
    'cat.digital': 'المهارات الرقمية',
    'cat.ai': 'الذكاء الاصطناعي',
    'cat.personal': 'تطوير المهارات الشخصية',
    'cat.cv': 'السيرة الذاتية والمقابلات',
    'cat.career': 'التأهيل المهني',
    'card.addCart': 'أضف للسلة',
    'card.added': 'تمت الإضافة',
    'card.buyNow': 'اشتري مباشرة',
    'card.free': 'مجاناً',
    'faq.title': 'الأسئلة الشائعة',
    'faq.subtitle': 'كل ما تحتاج معرفته عن التسجيل والمشاركة في الورش التدريبية',
    'faq.q1': 'هل يمكنني التسجيل في أكثر من ورشة؟',
    'faq.a1': 'نعم، يمكنك التسجيل في عدة ورش طالما لا تتعارض أوقاتها، وسيظهر كل شيء في سلتك قبل الدفع.',
    'faq.q2': 'هل الورش مناسبة للخريجين فقط؟',
    'faq.a2': 'لا، الورش مفتوحة لطلاب الجامعة بمختلف المراحل، مع مسارات مخصصة حسب المستوى.',
    'faq.q3': 'هل أحصل على شهادة بعد الحضور؟',
    'faq.a3': 'تُمنح شهادة حضور إلكترونية للورش المعتمدة بعد إكمال المتطلبات.',
    'faq.q4': 'هل الورشات مسجلة؟',
    'faq.a4': 'نعم، سيتم تسجيل جميع الورش لتكون متاحة أونلاين وللمشاهدة في أي وقت عبر المنصة التعليمية.',
    'footer.brand':
      'منصة لتطوير المهارات الطلابية في جامعة الكويت—ورش معتمدة، مسارات مهنية، وتجربة تسجيل سلسة.',
    'footer.quick': 'روابط سريعة',
    'footer.linkHome': 'الرئيسية',
    'footer.linkWorkshops': 'الورش التدريبية',
    'footer.linkCareer': 'المسار المهني',
    'footer.linkAbout': 'عن المنصة',
    'footer.policies': 'الشروط والسياسات',
    'footer.terms': 'شروط الاستخدام',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.refund': 'سياسة الاسترجاع',
    'footer.contact': 'تواصل معنا',
    'footer.newsletter': 'النشرة البريدية',
    'footer.newsletterHint': 'اشترك ليصلك جديد الورش والفعاليات',
    'footer.emailPlaceholder': 'البريد الإلكتروني',
    'footer.subscribe': 'اشتراك',
    'footer.copyright': '© جامعة الكويت — منصة التطوير الطلابي',
    'cart.title': 'سلة التسجيل',
    'cart.subtitle': 'عناصر محجوزة',
    'cart.close': 'إغلاق',
    'cart.empty': 'سلتك فارغة. أضف ورشة للبدء.',
    'cart.loading': 'جاري تحميل السلة…',
    'cart.remove': 'حذف',
    'cart.subtotal': 'المجموع',
    'cart.checkout': 'متابعة الدفع',
    'cart.viewFull': 'عرض السلة كاملة',
    'cart.reviewDetail': 'راجع الورش المختارة قبل إتمام الدفع.',
    'cart.lineTotal': 'المجموع الفرعي',
    'cart.browseWorkshops': 'تصفح الورش',
    'checkout.title': 'إتمام الدفع',
    'checkout.subtitle': 'لا نجمع بيانات البطاقة هنا — الدفع يتم عبر Tap بشكل آمن.',
    'checkout.labelName': 'الاسم الكامل',
    'checkout.labelEmail': 'البريد الإلكتروني',
    'checkout.labelPhone': 'الهاتف (اختياري)',
    'checkout.payTap': 'الدفع عبر Tap',
    'checkout.paying': 'جاري بدء الدفع…',
    'checkout.noPaymentUrl': 'لم يُرجع رابط الدفع.',
    'checkout.failed': 'فشل الدفع. تأكد من أن السلة تحتوي عناصر وأن الخادم يعمل.',
    'checkout.paySecureBelow': 'أكمل الدفع بأمان عبر Tap',
    'checkout.openPaymentNewTab': 'فتح صفحة الدفع في تبويب جديد',
    'checkout.processingPayment': 'بعد إتمام الدفع ستعود تلقائياً إلى التأكيد.',
    'checkout.iframeTitle': 'دفع آمن عبر Tap',
    'checkout.paymentFailedOrCancelled': 'لم يكتمل الدفع أو تم إلغاؤه. يمكنك المحاولة مرة أخرى من السلة.',
    'checkout.paymentPollTimeout': 'استغرق التأكيد وقتاً أطول من المتوقع. تحقق من بريدك أو من حالة الطلب لاحقاً.',
    'checkout.errorPaymentProvider': 'تعذر الاتصال بمزود الدفع. تحقق من إعدادات Tap والخادم.',
    'checkout.errorMissingCart': 'انتهت جلسة السلة. أضف الورشة مرة أخرى ثم أعد المحاولة.',
    'checkout.networkError': 'تعذر الاتصال بالخادم. تأكد أن واجهة الـ API تعمل (مثلاً المنفذ 8000) وأن الوكيل مفعّل مع ng serve.',
    'checkout.localTapDevWarning':
      'المتصفح قد يمنع صفحة Tap العامة من إعادتك إلى localhost. إن بقي الطلب عالقاً بعد الدفع: شغّل نفق HTTPS عام (مثل ngrok أو cloudflared على المنفذ 4200)، واضبط FRONTEND_URL في Laravel على ذلك العنوان، وأضفه إلى CORS_ALLOWED_ORIGINS.',
    'checkout.tapLeavingSite': 'سيتم فتح Tap في هذه النافذة؛ بعد الدفع ستعود تلقائياً إلى التأكيد.',
    'checkout.preparingTap': 'جاري تجهيز صفحة الدفع…',
    'checkout.loadingTapFrame': 'جاري تحميل Tap…',
    'tapReturn.finishing': 'جاري إنهاء الدفع…',
    'complete.title': 'شكراً',
    'complete.status': 'حالة الطلب:',
    'complete.receipt': 'أرسلنا إيصالاً إلى',
    'complete.total': 'الإجمالي',
    'complete.loading': 'جاري تحميل التأكيد…',
    'complete.back': 'العودة للورش',
    'complete.missingOrder': 'مرجع الطلب مفقود.',
    'complete.loadError': 'تعذر تحميل هذا الطلب.',
    'complete.paidBadge': 'تم الدفع بنجاح',
    'complete.capturedHint': 'تمت عملية الدفع وتسجيل طلبك.',
    'complete.notPaidYet': 'هذا الطلب لم يُدفع بعد. يمكنك إكمال الدفع من صفحة الدفع.',
    'failed.title': 'لم يكتمل الدفع',
    'failed.reasonTimeout': 'استغرق التأكيد وقتاً طويلاً أو انقطع الاتصال. إن خُصم مبلغ من بطاقتك ولم يُؤكد الطلب، تواصل مع الدعم مع رقم الطلب.',
    'failed.reasonError': 'حدث خطأ أثناء التحقق من حالة الدفع. حاول مرة أخرى.',
    'failed.reasonDeclined': 'تم رفض الدفع أو إلغاؤه. يمكنك المحاولة مرة أخرى أو استخدام وسيلة دفع أخرى.',
    'failed.orderRef': 'مرجع الطلب',
    'failed.tryAgain': 'العودة إلى الدفع',
    'failed.browseWorkshops': 'تصفح الورش',
    'about.title': 'عن منصة التطوير الطلابي',
    'about.intro':
      'منصة رسمية لطلاب جامعة الكويت تجمع الورش التدريبية والفعاليات في مكان واحد، لتسهيل التعلم المستمر والاستعداد للمسار المهني.',
    'about.missionTitle': 'رسالتنا',
    'about.missionText':
      'تمكين الطلاب من اكتساب مهارات عملية ومعتمدة، وتعزيز جاهزيتهم لسوق العمل من خلال برامج منظمة وتجربة تسجيل واضحة.',
    'about.offerTitle': 'ماذا نوفر؟',
    'about.offer1': 'ورش تدريبية متنوعة: قيادة، مهارات رقمية، ذكاء اصطناعي، تواصل، سيرة ذاتية ومقابلات، وغيرها.',
    'about.offer2': 'تتبع التسجيل والدفع عبر سلّة موحّدة مع إيصال إلكتروني بعد إتمام الطلب.',
    'about.offer3': 'محتوى يُحدَّث باستمرار بالتنسيق مع وحدات الجامعة المعنية بالتطوير الطلابي.',
    'about.partnerTitle': 'لمن هذه المنصة؟',
    'about.partnerText':
      'لجميع طلاب جامعة الكويت الراغبين في تطوير مهاراتهم خارج المنهج التقليدي، والمشاركة في فعاليات معتمدة تدعم مسارهم الأكاديمي والمهني.',
    'about.ctaWorkshops': 'تصفح الورش',
    'about.ctaCareer': 'المسار المهني',
    'careerPage.title': 'المسار المهني',
    'careerPage.intro':
      'مسارك المهني يبدأ بخطوات واضحة: اكتشف المجالات التي تناسبك، طور المهارات المطلوبة، ثم اربطها بالورش والبرامج المتاحة على المنصة.',
    'careerPage.pathsTitle': 'مسارات تعلم مقترحة',
    'careerPage.path1Title': 'المهارات الرقمية والابتكار',
    'careerPage.path1Text':
      'ورش في الأدوات الرقمية، الابتكار، والذكاء الاصطناعي التطبيقي—مناسبة لمن يرغب في قطاع التقنية والتحول الرقمي.',
    'careerPage.path2Title': 'القيادة والتواصل المهني',
    'careerPage.path2Text':
      'تطوير العرض والتواصل، العمل الجماعي، والمهارات الإدارية الأساسية لبيئات العمل الحديثة.',
    'careerPage.path3Title': 'الاستعداد لسوق العمل',
    'careerPage.path3Text':
      'السيرة الذاتية، المقابلات، التخطيط المهني، والورش التي تساعدك على الانتقال من الجامعة إلى أول فرصة عمل.',
    'careerPage.stepsTitle': 'كيف تستخدم المنصة؟',
    'careerPage.step1': 'حدّد هدفك: مجال تهتم به أو مهارة تريد تقويتها.',
    'careerPage.step2': 'استعرض الورش حسب التصنيف أو البحث، وأضف ما يناسب جدولك إلى سلتك.',
    'careerPage.step3': 'أكمل التسجيل والدفع، واحضر الورشة لتحصل على شهادة الحضور عند توفرها.',
    'careerPage.ctaBrowse': 'استعرض الورش المتاحة',
    'detail.back': 'العودة للورش',
    'detail.featured': 'مميز',
    'detail.registration': 'الرسوم',
    'detail.addCart': 'أضف للسلة',
    'detail.notFound': 'تعذر العثور على هذه الورشة.',
  },
  en: {
    'nav.home': 'Home',
    'nav.workshops': 'Training workshops',
    'nav.career': 'Career path',
    'nav.about': 'About',
    'nav.searchAria': 'Search',
    'nav.langShortAr': 'AR',
    'nav.langShortEn': 'EN',
    'hero.badge': 'Kuwait University student development platform',
    'hero.title1': 'Grow your skills,',
    'hero.title2': 'build your career',
    'hero.body':
      'Explore certified workshops and events built for KU students—in partnership with Next Level. Practical tracks for employability, with a simple and secure registration flow.',
    'hero.ctaBrowse': 'Browse workshops',
    'hero.ctaPaths': 'Explore learning paths',
    'hero.stat': '100+ certified workshops',
    'hero.imageAlt': 'Students taking part in a live training workshop',
    'hero.promoLine':
      'Special pricing for KU students · Live week Sun 26 Apr–Thu 30 Apr 2026 (Asia/Kuwait)',
    'feat1.title': 'Continuous development',
    'feat1.desc': 'Learning paths that keep pace with today’s workplace expectations.',
    'feat2.title': 'Applied content',
    'feat2.desc': 'Sessions focused on real practice and transferable skills.',
    'feat3.title': 'Expert facilitators',
    'feat3.desc': 'Learn from academics and practitioners active in the market.',
    'feat4.title': 'Recognized certificates',
    'feat4.desc': 'Credentials that strengthen your CV when requirements are met.',
    'workshops.title': 'Register for workshops',
    'workshops.subtitle':
      'Pick the sessions that fit your schedule—live on Zoom at the listed times, with recordings available later on the learning platform.',
    'workshops.viewAll': 'View all workshops',
    'workshops.searchPlaceholder': 'Search workshops…',
    'workshops.loadError': 'Could not load workshops. Is the API running on port 8000?',
    'workshops.loadMore': 'Load more',
    'workshops.loading': 'Loading…',
    'workshops.demoHint':
      'Workshops are hosted on Zoom; keep the API running to complete checkout and enrollment through this demo app.',
    'workshops.empty': 'No workshops match your filters.',
    'cat.all': 'All',
    'cat.leadership': 'Leadership & professional development',
    'cat.digital': 'Digital skills',
    'cat.ai': 'Artificial intelligence',
    'cat.personal': 'Personal skills',
    'cat.cv': 'CV & interviewing',
    'cat.career': 'Career readiness',
    'card.addCart': 'Add to cart',
    'card.added': 'Added',
    'card.buyNow': 'Buy now',
    'card.free': 'Free',
    'faq.title': 'Frequently asked questions',
    'faq.subtitle': 'Everything you need to know about signing up and joining training workshops',
    'faq.q1': 'Can I register for more than one workshop?',
    'faq.a1':
      'Yes—you can join multiple workshops as long as schedules do not conflict. Everything appears in your cart before payment.',
    'faq.q2': 'Are workshops only for graduates?',
    'faq.a2':
      'No. Workshops are open to students at different levels, with tracks suited to your experience.',
    'faq.q3': 'Do I get a certificate after attending?',
    'faq.a3': 'Certified workshops may issue a digital certificate of attendance after requirements are met.',
    'faq.q4': 'Are sessions recorded?',
    'faq.a4':
      'Yes—sessions are recorded so you can watch online later on the learning platform when recordings are published.',
    'footer.brand':
      'A student skills platform for Kuwait University—certified workshops, career paths, and smooth registration.',
    'footer.quick': 'Quick links',
    'footer.linkHome': 'Home',
    'footer.linkWorkshops': 'Workshops',
    'footer.linkCareer': 'Career path',
    'footer.linkAbout': 'About',
    'footer.policies': 'Terms & policies',
    'footer.terms': 'Terms of use',
    'footer.privacy': 'Privacy policy',
    'footer.refund': 'Refund policy',
    'footer.contact': 'Contact us',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterHint': 'Get new workshops and events in your inbox',
    'footer.emailPlaceholder': 'Email address',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© Kuwait University — student development platform',
    'cart.title': 'Your cart',
    'cart.subtitle': 'items reserved',
    'cart.close': 'Close',
    'cart.empty': 'Your cart is empty. Add a workshop to get started.',
    'cart.loading': 'Loading cart…',
    'cart.remove': 'Remove',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Continue to checkout',
    'cart.viewFull': 'View full cart',
    'cart.reviewDetail': 'Review your selected workshops before checkout.',
    'cart.lineTotal': 'Line total',
    'cart.browseWorkshops': 'Browse workshops',
    'checkout.title': 'Checkout',
    'checkout.subtitle': 'We never collect card details in this app—Tap handles payment securely.',
    'checkout.labelName': 'Full name',
    'checkout.labelEmail': 'Email',
    'checkout.labelPhone': 'Phone (optional)',
    'checkout.payTap': 'Pay with Tap',
    'checkout.paying': 'Starting payment…',
    'checkout.noPaymentUrl': 'No payment URL returned.',
    'checkout.failed': 'Checkout failed. Ensure your cart has items and the API is running.',
    'checkout.paySecureBelow': 'Complete your payment securely with Tap',
    'checkout.openPaymentNewTab': 'Open payment page in a new tab',
    'checkout.processingPayment': 'When you finish paying, you will return to confirmation automatically.',
    'checkout.iframeTitle': 'Secure payment with Tap',
    'checkout.paymentFailedOrCancelled': 'Payment was not completed or was cancelled. You can try again from your cart.',
    'checkout.paymentPollTimeout': 'Confirmation is taking longer than expected. Check your email or try again later.',
    'checkout.errorPaymentProvider': 'Payment provider could not start the charge. Check Tap credentials and server logs.',
    'checkout.errorMissingCart': 'Your cart session is missing. Add the workshop again and retry checkout.',
    'checkout.networkError': 'Cannot reach the API. Ensure Laravel is running (e.g. port 8000) and `ng serve` uses the proxy.',
    'checkout.localTapDevWarning':
      'Your browser may block Tap’s public checkout from sending you back to localhost. If you finish paying but never return: expose this app on a public HTTPS URL (e.g. `ngrok http 4200` or Cloudflare Tunnel), set `FRONTEND_URL` in Laravel `.env` to that URL, and add the same origin to `CORS_ALLOWED_ORIGINS`. Tunnel the API too or keep using the dev proxy from that origin.',
    'checkout.tapLeavingSite': 'Tap will open in this window; after you pay you will return here for confirmation.',
    'checkout.preparingTap': 'Preparing secure checkout…',
    'checkout.loadingTapFrame': 'Loading Tap checkout…',
    'tapReturn.finishing': 'Finishing your payment…',
    'complete.title': 'Thanks',
    'complete.status': 'Your order status is',
    'complete.receipt': 'We emailed a receipt to',
    'complete.total': 'Total',
    'complete.loading': 'Loading confirmation…',
    'complete.back': 'Back to workshops',
    'complete.missingOrder': 'Missing order reference.',
    'complete.loadError': 'Unable to load this order.',
    'complete.paidBadge': 'Payment successful',
    'complete.capturedHint': 'Your payment was captured and your order is confirmed.',
    'complete.notPaidYet': 'This order has not been paid yet. Complete checkout to continue.',
    'failed.title': 'Payment not completed',
    'failed.reasonTimeout': 'Confirmation took too long or the connection dropped. If you were charged but the order did not confirm, contact support with your order reference.',
    'failed.reasonError': 'Something went wrong while checking payment status. Please try again.',
    'failed.reasonDeclined': 'The payment was declined or cancelled. You can try again or use another card.',
    'failed.orderRef': 'Order reference',
    'failed.tryAgain': 'Back to checkout',
    'failed.browseWorkshops': 'Browse workshops',
    'about.title': 'About the platform',
    'about.intro':
      'The official Kuwait University student development hub—bringing training workshops and events together in one place for continuous learning and career readiness.',
    'about.missionTitle': 'Our mission',
    'about.missionText':
      'To help students gain practical, recognized skills and strengthen employability through organized programs and a clear registration experience.',
    'about.offerTitle': 'What we offer',
    'about.offer1':
      'Diverse workshops: leadership, digital skills, AI, communication, CV & interviews, and more.',
    'about.offer2': 'A single cart for registration and payment, with email confirmation after checkout.',
    'about.offer3': 'Content that evolves in step with university student-development units.',
    'about.partnerTitle': 'Who it is for',
    'about.partnerText':
      'All KU students who want to grow beyond the classroom and join credentialed activities that support academic and career goals.',
    'about.ctaWorkshops': 'Browse workshops',
    'about.ctaCareer': 'Career path',
    'careerPage.title': 'Your career path',
    'careerPage.intro':
      'Start with clarity: explore fields that fit you, build the skills employers expect, then connect them to workshops on this platform.',
    'careerPage.pathsTitle': 'Suggested learning tracks',
    'careerPage.path1Title': 'Digital skills & innovation',
    'careerPage.path1Text':
      'Workshops on digital tools, innovation, and applied AI—ideal if you are aiming at tech and digital transformation roles.',
    'careerPage.path2Title': 'Leadership & workplace communication',
    'careerPage.path2Text':
      'Presentation, teamwork, and foundational management skills for modern workplaces.',
    'careerPage.path3Title': 'Job-market readiness',
    'careerPage.path3Text':
      'CVs, interviews, career planning, and sessions that bridge university and your first role.',
    'careerPage.stepsTitle': 'How to use the platform',
    'careerPage.step1': 'Pick a goal—a field you care about or a skill you want to strengthen.',
    'careerPage.step2': 'Browse workshops by category or search, then add sessions that fit your schedule to your cart.',
    'careerPage.step3': 'Complete registration and payment, attend, and collect a certificate of attendance when offered.',
    'careerPage.ctaBrowse': 'Browse available workshops',
    'detail.back': 'Back to workshops',
    'detail.featured': 'Featured',
    'detail.registration': 'Fee',
    'detail.addCart': 'Add to cart',
    'detail.notFound': 'This workshop could not be found.',
  },
};
