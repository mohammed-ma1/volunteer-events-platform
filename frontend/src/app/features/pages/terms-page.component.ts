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
<h2>1. قبول الشروط</h2>
<p>مرحباً بك في منصة نكست ليفل. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.</p>

<h2>2. حساب المستخدم</h2>
<ul>
<li>يجب أن تقدم معلومات دقيقة وكاملة عند إنشاء حساب.</li>
<li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وحسابك.</li>
<li>يُمنع مشاركة حسابك مع أشخاص آخرين. كل حساب مخصص لمستخدم واحد فقط.</li>
<li>نحتفظ بالحق في تعليق أو إنهاء حسابك إذا تبين وجود انتهاك لهذه الشروط.</li>
</ul>

<h2>3. الوصول للدورات والورش</h2>
<p>عند شراء ورشة أو باقة، يتم منحك ترخيصاً شخصياً، غير حصري، وغير قابل للتحويل لمشاهدة المحتوى.</p>
<ul>
<li>يُمنع منعاً باتاً تحميل، نسخ، توزيع، أو بث المحتوى لأغراض تجارية أو غير تجارية.</li>
<li>الوصول للورش المسجلة متاح طوال فترة اشتراكك أو حسب ما هو محدد في تفاصيل الورشة.</li>
</ul>

<h2>4. الدفع والاسترداد</h2>
<ul>
<li>جميع الأسعار المعروضة بالدينار الكويتي (د.ك) ما لم يذكر خلاف ذلك.</li>
<li>نحن لا نقدم المبالغ المستردة بعد إتمام عملية الشراء والوصول إلى المحتوى الرقمي، إلا في حالات استثنائية (مثل عدم عمل المحتوى لأسباب تقنية من طرفنا).</li>
<li>في حال استخدام خدمة التقسيط (مثل ديمه)، يجب الالتزام بشروط وأحكام مزود خدمة التقسيط.</li>
</ul>

<h2>5. الملكية الفكرية</h2>
<p>جميع المحتويات على المنصة، بما في ذلك الفيديوهات، النصوص، التصاميم، الشعارات، والمواد التعليمية، هي ملكية حصرية لمنصة نكست ليفل ومحمية بموجب قوانين حقوق النشر. أي استخدام غير مصرح به يعرضك للمساءلة القانونية.</p>

<h2>6. السلوك المقبول</h2>
<p>يُتوقع من المستخدمين التصرف باحترام ومهنية أثناء الجلسات المباشرة (Zoom) وفي أي تفاعل مع المدربين أو الطلاب الآخرين. يُمنع استخدام المنصة لأي أغراض غير قانونية أو مسيئة.</p>

<h2>7. شروط الإلغاء والتأجيل والتمديد</h2>
<p>يحق للجهة المستفيدة إلغاء أو تأجيل البرنامج التدريبي قبل موعد التنفيذ بـ 14 يوم عمل أو أكثر دون أي رسوم، وفي حال الإلغاء خلال الفترة من 7 إلى 13 يوم عمل يتم استحقاق 50% من قيمة البرنامج، أما في حال الإلغاء خلال أقل من 7 أيام عمل من موعد التنفيذ فيتم استحقاق 100% من قيمة البرنامج. كما يحق للمستفيد إلغاء أو تأجيل الجلسات الاستشارية أو الفردية قبل موعدها بـ 12 ساعة على الأقل دون رسوم، وفي حال الإلغاء أو التأجيل خلال أقل من 12 ساعة أو عدم الحضور دون إشعار مسبق، تعتبر الجلسة منفذة بالكامل ويتم استحقاق كامل قيمتها. ويجوز تمديد مدة تنفيذ البرنامج لمدة لا تتجاوز شهراً واحداً فقط من نهاية المدة المتفق عليها في العرض أو العقد، شريطة وجود مبرر مقبول وموافقة الطرفين، وبعد انقضاء فترة التمديد يعتبر البرنامج منتهياً وتُسقط أي خدمات أو جلسات أو ساعات تدريبية غير مستفاد منها ما لم يتم الاتفاق خطياً على خلاف ذلك. ويجوز لشركة المستوى الأعلى الموافقة على إعادة الجدولة في الحالات الطارئة والاستثنائية وفق ما تراه مناسباً. أما مدة صلاحية هذا العرض فهي 60 يوماً من تاريخ إصداره ما لم يُذكر خلاف ذلك في العرض.</p>

<h2>8. التعديلات</h2>
<p>نحتفظ بالحق في تحديث أو تعديل هذه الشروط والأحكام في أي وقت دون إشعار مسبق. يُعتبر استمرارك في استخدام المنصة بعد أي تعديلات بمثابة موافقة منك على الشروط الجديدة.</p>
<p><strong>آخر تحديث:</strong> 31 مايو 2026</p>
`;

  readonly termsEn = `
<h2>1. Acceptance of Terms</h2>
<p>Welcome to the Next Levels platform. By using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use the platform.</p>

<h2>2. User Account</h2>
<ul>
<li>You must provide accurate and complete information when creating an account.</li>
<li>You are responsible for keeping your password and account confidential.</li>
<li>Sharing your account with others is prohibited. Each account is for a single user only.</li>
<li>We reserve the right to suspend or terminate your account if a violation of these terms is detected.</li>
</ul>

<h2>3. Access to Courses and Workshops</h2>
<p>When you purchase a workshop or bundle, you are granted a personal, non-exclusive, non-transferable licence to view the content.</p>
<ul>
<li>Downloading, copying, distributing, or broadcasting the content for commercial or non-commercial purposes is strictly prohibited.</li>
<li>Access to recorded workshops is available throughout your subscription period or as specified in the workshop details.</li>
</ul>

<h2>4. Payment and Refunds</h2>
<ul>
<li>All prices are shown in Kuwaiti Dinar (K.D.) unless otherwise stated.</li>
<li>We do not provide refunds after the purchase is completed and the digital content has been accessed, except in exceptional cases (such as the content not working due to technical reasons on our side).</li>
<li>When using an instalment service (such as Deema), you must comply with the instalment provider's terms and conditions.</li>
</ul>

<h2>5. Intellectual Property</h2>
<p>All content on the platform, including videos, text, designs, logos, and educational materials, is the exclusive property of Next Levels and is protected by copyright laws. Any unauthorized use exposes you to legal liability.</p>

<h2>6. Acceptable Conduct</h2>
<p>Users are expected to behave respectfully and professionally during live sessions (Zoom) and in any interaction with trainers or other learners. The platform may not be used for any illegal or abusive purposes.</p>

<h2>7. Cancellation, Postponement and Extension Terms</h2>
<p>The beneficiary is entitled to cancel or postpone the training programme 14 working days or more before the scheduled date with no fees. In the case of cancellation 7 to 13 working days before the date, 50% of the programme value is due. In the case of cancellation less than 7 working days from the scheduled date, 100% of the programme value is due. The beneficiary is also entitled to cancel or postpone individual consultation or one-on-one sessions at least 12 hours before the appointment with no fees; if cancelled or postponed within less than 12 hours, or if the beneficiary does not attend without prior notice, the session is considered fully executed and the full value is due. The programme execution period may be extended for a maximum of one month from the end of the period agreed in the offer or contract, subject to an acceptable justification and agreement of both parties; after the extension period expires the programme is considered closed and any unused services, sessions or training hours are forfeited unless agreed otherwise in writing. Next Levels may agree to reschedule in emergency and exceptional cases as it deems appropriate. The validity period of this offer is 60 days from the date of issue unless otherwise stated in the offer.</p>

<h2>8. Modifications</h2>
<p>We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Your continued use of the platform after any modifications constitutes acceptance of the new terms.</p>
<p><strong>Last updated:</strong> 31 May 2026</p>
`;
}
