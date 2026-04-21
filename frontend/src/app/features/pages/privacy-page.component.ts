import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ i18n.t('footer.privacy') }}</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {{ i18n.t('legal.privacyTitle') }}
      </h1>
      <div class="ve-legal-prose mt-8 rounded-2xl border border-ink-200/80 bg-white p-6 shadow-sm md:p-8" [innerHTML]="i18n.isRtl() ? privacyAr : privacyEn"></div>
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
    :host ::ng-deep .ve-legal-prose li { margin-bottom: 0.375rem; line-height: 1.7; }
  `],
})
export class PrivacyPageComponent {
  readonly i18n = inject(I18nService);

  readonly privacyAr = `
<h2>مقدمة</h2>
<p>تلتزم شركة نكست لفل ("الشركة"، "نحن") بحماية خصوصية مستخدمي منصة التدريب الإلكترونية. توضح هذه السياسة كيفية جمع بياناتك الشخصية واستخدامها وحمايتها عند استخدامك للمنصة.</p>

<h2>البيانات التي نجمعها</h2>
<ul>
<li><strong>بيانات التسجيل:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف.</li>
<li><strong>بيانات الدفع:</strong> تتم معالجة المدفوعات عبر بوابة Tap، ولا نحتفظ ببيانات بطاقتك الائتمانية على خوادمنا.</li>
<li><strong>بيانات الاستخدام:</strong> سجل الورش المسجّل فيها، وتقدّمك في المحتوى التعليمي.</li>
<li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل، لأغراض تحسين الأداء والأمان.</li>
</ul>

<h2>كيف نستخدم بياناتك</h2>
<ul>
<li>إنشاء حسابك وإدارته على المنصة.</li>
<li>تسجيلك في الورش التدريبية ومنحك الوصول إلى المحتوى.</li>
<li>إرسال تأكيدات الطلبات وبيانات الدخول عبر البريد الإلكتروني.</li>
<li>إرسال روابط الزوم للورش المسجّل فيها.</li>
<li>تحسين تجربة المستخدم وتطوير خدمات المنصة.</li>
<li>الامتثال للمتطلبات القانونية والتنظيمية في دولة الكويت.</li>
</ul>

<h2>مشاركة البيانات</h2>
<p>لا نبيع أو نؤجّر بياناتك الشخصية لأي طرف ثالث. قد نشارك بياناتك فقط مع:</p>
<ul>
<li>بوابة الدفع (Tap) لمعالجة المدفوعات.</li>
<li>خدمة البريد الإلكتروني (SendGrid) لإرسال الإشعارات.</li>
<li>جامعة الكويت - كلية العلوم الاجتماعية، بصفتها الشريك الأكاديمي للبرنامج.</li>
<li>الجهات الحكومية عند الطلب القانوني.</li>
</ul>

<h2>حماية البيانات</h2>
<p>نتخذ تدابير أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح، بما في ذلك تشفير الاتصالات (SSL/TLS) وتخزين كلمات المرور بشكل مشفّر.</p>

<h2>حقوقك</h2>
<ul>
<li>طلب الاطلاع على بياناتك الشخصية المحفوظة لدينا.</li>
<li>طلب تصحيح أو تحديث بياناتك.</li>
<li>طلب حذف حسابك وبياناتك (مع مراعاة الالتزامات القانونية).</li>
</ul>
<p>للتواصل بشأن خصوصيتك: <strong>info@nextlevels.education</strong></p>

<h2>ملفات تعريف الارتباط (Cookies)</h2>
<p>نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة (مثل رمز سلة المشتريات وجلسة تسجيل الدخول). لا نستخدم ملفات تتبع إعلانية.</p>

<h2>تحديث السياسة</h2>
<p>نحتفظ بحق تعديل هذه السياسة في أي وقت. سيتم نشر أي تحديثات على هذه الصفحة مع تاريخ آخر تعديل.</p>
<p><strong>آخر تحديث:</strong> أبريل 2026</p>
`;

  readonly privacyEn = `
<h2>Introduction</h2>
<p>Next Levels ("the Company", "we") is committed to protecting the privacy of users of our training platform. This policy explains how we collect, use, and protect your personal data when you use the platform.</p>

<h2>Data We Collect</h2>
<ul>
<li><strong>Registration data:</strong> Full name, email address, phone number.</li>
<li><strong>Payment data:</strong> Payments are processed through Tap payment gateway. We do not store your credit card details on our servers.</li>
<li><strong>Usage data:</strong> Workshops you're enrolled in, your progress in educational content.</li>
<li><strong>Technical data:</strong> IP address, browser type, operating system — for performance and security purposes.</li>
</ul>

<h2>How We Use Your Data</h2>
<ul>
<li>Create and manage your account on the platform.</li>
<li>Enroll you in workshops and grant access to content.</li>
<li>Send order confirmations and login credentials via email.</li>
<li>Send Zoom links for your enrolled workshops.</li>
<li>Improve user experience and develop platform services.</li>
<li>Comply with legal and regulatory requirements in Kuwait.</li>
</ul>

<h2>Data Sharing</h2>
<p>We do not sell or rent your personal data to any third party. We may share your data only with:</p>
<ul>
<li>Tap payment gateway for processing payments.</li>
<li>SendGrid email service for sending notifications.</li>
<li>Kuwait University — College of Social Sciences, as the academic partner of the program.</li>
<li>Government authorities when legally required.</li>
</ul>

<h2>Data Protection</h2>
<p>We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure, including encrypted communications (SSL/TLS) and hashed password storage.</p>

<h2>Your Rights</h2>
<ul>
<li>Request access to your personal data stored with us.</li>
<li>Request correction or update of your data.</li>
<li>Request deletion of your account and data (subject to legal obligations).</li>
</ul>
<p>For privacy inquiries: <strong>info@nextlevels.education</strong></p>

<h2>Cookies</h2>
<p>We use essential cookies required for platform operation (such as cart token and login session). We do not use advertising tracking cookies.</p>

<h2>Policy Updates</h2>
<p>We reserve the right to modify this policy at any time. Updates will be posted on this page with the date of last modification.</p>
<p><strong>Last updated:</strong> April 2026</p>
`;
}
