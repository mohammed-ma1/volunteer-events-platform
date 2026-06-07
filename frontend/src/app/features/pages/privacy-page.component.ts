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
<h2>1. مقدمة</h2>
<p>نحن في منصة نكست ليفل نولي أهمية قصوى لخصوصية زوارنا ومستخدمينا. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لموقعنا وخدماتنا.</p>

<h2>2. المعلومات التي نجمعها</h2>
<ul>
<li><strong>المعلومات الشخصية:</strong> مثل الاسم، البريد الإلكتروني، ورقم الهاتف عند التسجيل أو الشراء.</li>
<li><strong>معلومات الدفع:</strong> تفاصيل البطاقة الائتمانية (والتي تتم معالجتها بشكل آمن عبر بوابات الدفع المعتمدة ولا يتم تخزينها لدينا).</li>
<li><strong>معلومات الاستخدام:</strong> بيانات حول كيفية تفاعلك مع المنصة، مثل الدورات التي تشاهدها والوقت الذي تقضيه.</li>
<li><strong>معلومات الجهاز:</strong> عنوان IP، نوع المتصفح، ونظام التشغيل.</li>
</ul>

<h2>3. كيف نستخدم معلوماتك</h2>
<p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
<ul>
<li>توفير وإدارة حسابك والخدمات التي تطلبها.</li>
<li>معالجة المدفوعات وإصدار الفواتير.</li>
<li>التواصل معك بشأن التحديثات، العروض، والدعم الفني.</li>
<li>تحسين وتطوير المنصة وتجربة المستخدم.</li>
</ul>

<h2>4. مشاركة المعلومات</h2>
<p>نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة (مثل بوابات الدفع وخدمات الاستضافة)، وذلك بموجب اتفاقيات سرية صارمة، أو إذا كان ذلك مطلوباً بموجب القانون.</p>

<h2>5. أمان البيانات</h2>
<p>نتخذ تدابير أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به، التعديل، أو الإتلاف. نستخدم تشفير SSL لتأمين نقل البيانات بين متصفحك وخوادمنا.</p>

<h2>6. حقوقك</h2>
<p>لديك الحق في:</p>
<ul>
<li>الوصول إلى معلوماتك الشخصية التي نحتفظ بها.</li>
<li>طلب تصحيح أو تحديث معلوماتك غير الدقيقة.</li>
<li>طلب حذف حسابك وبياناتك من أنظمتنا.</li>
</ul>
<p>للتواصل بشأن خصوصيتك: <strong>info@nextlevels.education</strong></p>

<h2>7. التعديلات على سياسة الخصوصية</h2>
<p>نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام المنصة بعد هذه التغييرات يُعد قبولاً للسياسة المعدلة.</p>
<p><strong>آخر تحديث:</strong> 31 مايو 2026</p>
`;

  readonly privacyEn = `
<h2>1. Introduction</h2>
<p>At Next Levels, we place the utmost importance on the privacy of our visitors and users. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>

<h2>2. Information We Collect</h2>
<ul>
<li><strong>Personal information:</strong> such as name, email address, and phone number when you register or make a purchase.</li>
<li><strong>Payment information:</strong> credit card details (processed securely through certified payment gateways and not stored on our systems).</li>
<li><strong>Usage information:</strong> data about how you interact with the platform, such as which courses you watch and how long you spend on them.</li>
<li><strong>Device information:</strong> IP address, browser type, and operating system.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect for the following purposes:</p>
<ul>
<li>Providing and managing your account and the services you request.</li>
<li>Processing payments and issuing invoices.</li>
<li>Communicating with you about updates, offers, and technical support.</li>
<li>Improving and developing the platform and user experience.</li>
</ul>

<h2>4. Information Sharing</h2>
<p>We do not sell or rent your personal information to third parties. We may share your information only with trusted service providers who help us operate the platform (such as payment gateways and hosting services), under strict confidentiality agreements, or when required by law.</p>

<h2>5. Data Security</h2>
<p>We apply technical and organizational security measures to protect your data from unauthorized access, alteration, or destruction. We use SSL encryption to secure the transfer of data between your browser and our servers.</p>

<h2>6. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access the personal information we hold about you.</li>
<li>Request correction or update of any inaccurate information.</li>
<li>Request deletion of your account and data from our systems.</li>
</ul>
<p>For privacy inquiries: <strong>info@nextlevels.education</strong></p>

<h2>7. Updates to This Privacy Policy</h2>
<p>We reserve the right to modify this Privacy Policy at any time. Any changes will be posted on this page along with an updated "Last updated" date. Your continued use of the platform after such changes constitutes acceptance of the revised policy.</p>
<p><strong>Last updated:</strong> 31 May 2026</p>
`;
}
