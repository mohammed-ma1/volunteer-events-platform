import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ i18n.t('nav.faq') }}</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {{ i18n.t('faq.title') }}
      </h1>
      <p class="mt-3 text-base leading-relaxed text-ink-600 md:text-lg">{{ i18n.t('faq.subtitle') }}</p>

      <div class="mt-10 space-y-4">
        @for (item of faqItems; track item.q) {
          <div class="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm md:p-6">
            <h2 class="text-base font-bold text-brand-900 md:text-lg">{{ i18n.t(item.q) }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-ink-600 md:text-base">{{ i18n.t(item.a) }}</p>
          </div>
        }
      </div>

      <p class="mt-10 text-center text-sm text-ink-500">
        <a routerLink="/" class="font-semibold text-brand-900 underline-offset-2 hover:underline">{{ i18n.t('footer.linkHome') }}</a>
      </p>
    </div>
  `,
})
export class FaqPageComponent {
  readonly i18n = inject(I18nService);

  readonly faqItems: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'faq.q1', a: 'faq.a1' },
    { q: 'faq.q2', a: 'faq.a2' },
    { q: 'faq.q3', a: 'faq.a3' },
    { q: 'faq.q4', a: 'faq.a4' },
  ];
}
