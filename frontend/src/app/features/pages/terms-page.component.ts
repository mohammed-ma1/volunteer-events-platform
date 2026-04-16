import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ i18n.t('footer.terms') }}</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {{ i18n.t('legal.termsTitle') }}
      </h1>
      <div class="ve-legal-prose mt-8 rounded-2xl border border-ink-200/80 bg-white p-6 shadow-sm md:p-8" [innerHTML]="i18n.isRtl() ? termsAr : termsEn"></div>
      <p class="mt-8 text-center text-sm text-ink-500">
        <a routerLink="/" class="font-semibold text-brand-900 underline-offset-2 hover:underline">{{ i18n.t('footer.linkHome') }}</a>
      </p>
    </div>
  `,
  styles: [`
    :host ::ng-deep .ve-legal-prose h2 { font-size: 1.25rem; font-weight: 800; color: #0a1628; margin-top: 2rem; margin-bottom: 0.75rem; }
    :host ::ng-deep .ve-legal-prose h2:first-child { margin-top: 0; }
    :host ::ng-deep .ve-legal-prose p { color: #475569; line-height: 1.75; margin-bottom: 1rem; }
    :host ::ng-deep .ve-legal-prose ul { list-style: disc; padding-inline-start: 1.5rem; color: #475569; margin-bottom: 1rem; }
    :host ::ng-deep .ve-legal-prose ol { list-style: decimal; padding-inline-start: 1.5rem; color: #475569; margin-bottom: 1rem; }
    :host ::ng-deep .ve-legal-prose li { margin-bottom: 0.375rem; line-height: 1.7; }
  `],
})
export class TermsPageComponent {
  readonly i18n = inject(I18nService);

  readonly termsAr = `
<h2>مقدمة</h2>
<p>مرحباً بك في منصة نكست لفل للتدريب ("المنصة"). باستخدامك للمنصة أو التسجيل فيها، فإنك توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل الاستخدام.</p>

<h2>التعريفات</h2>
<ul>
<li><strong>المنصة:</strong> الموقع الإلكتروني وتطبيقاته التابعة لشركة نكست لفل.</li>
<li><strong>المستخدم:</strong> أي شخص يسجل في المنصة أو يستخدمها.</li>
<li><strong>الورشة:</strong> أي برنامج تدريبي أو جلسة تعليمية متاحة على المنصة.</li>
<li><strong>الباقة:</strong> مجموعة ورش مجمّعة بسعر مخفّض.</li>
</ul>

<h2>التسجيل والحساب</h2>
<ul>
<li>يجب تقديم بيانات صحيحة ودقيقة عند التسجيل.</li>
<li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</li>
<li>يحق لنا تعليق أو إلغاء أي حساب يخالف هذه الشروط.</li>
</ul>

<h2>الورش والمحتوى</h2>
<ul>
<li>جميع الورش تُقدّم عبر الإنترنت من خلال تطبيق Zoom.</li>
<li>مواعيد الورش محددة مسبقاً وقابلة للتغيير بإشعار مسبق.</li>
<li>المحتوى التعليمي محمي بحقوق الملكية الفكرية ولا يجوز نسخه أو توزيعه.</li>
<li>تسجيل الجلسات أو بثّها دون إذن مسبق ممنوع.</li>
</ul>

<h2>الأسعار والدفع</h2>
<ul>
<li>جميع الأسعار معروضة بالدينار الكويتي (د.ك) وتشمل الضريبة إن وُجدت.</li>
<li>يتم الدفع إلكترونياً عبر بوابة Tap الآمنة.</li>
<li>عند إتمام الدفع، يتم تسجيلك تلقائياً في الورش المشتراة.</li>
<li>خدمة التقسيط متاحة عبر ديمه وفق الشروط المعلنة.</li>
</ul>

<h2>سياسة الاسترداد والإلغاء</h2>
<ul>
<li>يمكن طلب استرداد كامل المبلغ قبل 48 ساعة من بدء الورشة.</li>
<li>لا يتم الاسترداد بعد بدء الورشة أو حضورها.</li>
<li>في حال إلغاء ورشة من قبل المنصة، يتم استرداد المبلغ كاملاً.</li>
<li>باقات الورش غير قابلة للاسترداد الجزئي.</li>
</ul>

<h2>الشهادات</h2>
<ul>
<li>تُمنح شهادة حضور معتمدة لكل ورشة يتم إكمالها.</li>
<li>الشهادات صادرة بالتعاون مع جامعة الكويت - كلية العلوم الاجتماعية - مكتب الاستشارات والتدريب.</li>
</ul>

<h2>سلوك المستخدم</h2>
<p>يلتزم المستخدم بما يلي:</p>
<ul>
<li>احترام المدربين والمشاركين الآخرين أثناء الجلسات.</li>
<li>عدم استخدام المنصة لأغراض غير قانونية أو مسيئة.</li>
<li>عدم محاولة الوصول غير المصرح به إلى أنظمة المنصة.</li>
</ul>

<h2>تحديد المسؤولية</h2>
<p>المنصة توفّر المحتوى التعليمي "كما هو" ولا تضمن نتائج مهنية محددة. نكست لفل غير مسؤولة عن أي أضرار غير مباشرة ناتجة عن استخدام المنصة.</p>

<h2>القانون الحاكم</h2>
<p>تخضع هذه الشروط لقوانين دولة الكويت. أي نزاع ينشأ عن استخدام المنصة يُحال إلى المحاكم المختصة في دولة الكويت.</p>

<h2>التواصل</h2>
<p>لأي استفسار بخصوص هذه الشروط، يُرجى التواصل معنا عبر:</p>
<ul>
<li>البريد الإلكتروني: <strong>info@nextlevels.education</strong></li>
<li>الهاتف / واتساب: <strong>+965 9997 4367</strong></li>
</ul>

<h2>تحديث الشروط</h2>
<p>نحتفظ بحق تعديل هذه الشروط في أي وقت. يُعدّ استمرارك في استخدام المنصة بعد التعديل موافقة على الشروط المحدّثة.</p>
<p><strong>آخر تحديث:</strong> أبريل 2026</p>
`;

  readonly termsEn = `
<h2>Introduction</h2>
<p>Welcome to the Next Levels training platform ("the Platform"). By using or registering on the Platform, you agree to comply with these terms and conditions. Please read them carefully before use.</p>

<h2>Definitions</h2>
<ul>
<li><strong>Platform:</strong> The website and its associated applications operated by Next Levels.</li>
<li><strong>User:</strong> Any person who registers on or uses the Platform.</li>
<li><strong>Workshop:</strong> Any training program or educational session available on the Platform.</li>
<li><strong>Bundle:</strong> A group of workshops packaged at a discounted price.</li>
</ul>

<h2>Registration and Account</h2>
<ul>
<li>You must provide accurate and truthful information when registering.</li>
<li>You are responsible for maintaining the confidentiality of your account credentials.</li>
<li>We reserve the right to suspend or terminate any account that violates these terms.</li>
</ul>

<h2>Workshops and Content</h2>
<ul>
<li>All workshops are delivered online via Zoom.</li>
<li>Workshop schedules are predetermined and subject to change with prior notice.</li>
<li>Educational content is protected by intellectual property rights and may not be copied or distributed.</li>
<li>Recording or broadcasting sessions without prior permission is prohibited.</li>
</ul>

<h2>Pricing and Payment</h2>
<ul>
<li>All prices are displayed in Kuwaiti Dinar (K.D.) and include applicable taxes if any.</li>
<li>Payment is processed electronically through the secure Tap payment gateway.</li>
<li>Upon successful payment, you are automatically enrolled in the purchased workshops.</li>
<li>Installment payments are available through Deema subject to the announced terms.</li>
</ul>

<h2>Refund and Cancellation Policy</h2>
<ul>
<li>A full refund may be requested up to 48 hours before the workshop start time.</li>
<li>No refunds are issued after the workshop has started or been attended.</li>
<li>If a workshop is cancelled by the Platform, a full refund will be issued.</li>
<li>Workshop bundles are not eligible for partial refunds.</li>
</ul>

<h2>Certificates</h2>
<ul>
<li>A certified attendance certificate is issued for each completed workshop.</li>
<li>Certificates are issued in partnership with Kuwait University — College of Social Sciences — Office of Consultation and Training.</li>
</ul>

<h2>User Conduct</h2>
<p>Users agree to:</p>
<ul>
<li>Respect trainers and other participants during sessions.</li>
<li>Not use the Platform for illegal or abusive purposes.</li>
<li>Not attempt unauthorized access to Platform systems.</li>
</ul>

<h2>Limitation of Liability</h2>
<p>The Platform provides educational content "as is" and does not guarantee specific professional outcomes. Next Levels is not liable for any indirect damages arising from Platform use.</p>

<h2>Governing Law</h2>
<p>These terms are governed by the laws of the State of Kuwait. Any disputes arising from Platform use shall be referred to the competent courts in the State of Kuwait.</p>

<h2>Contact</h2>
<p>For any inquiries about these terms, please contact us:</p>
<ul>
<li>Email: <strong>info@nextlevels.education</strong></li>
<li>Phone / WhatsApp: <strong>+965 9997 4367</strong></li>
</ul>

<h2>Terms Updates</h2>
<p>We reserve the right to modify these terms at any time. Continued use of the Platform after modifications constitutes acceptance of the updated terms.</p>
<p><strong>Last updated:</strong> April 2026</p>
`;
}
