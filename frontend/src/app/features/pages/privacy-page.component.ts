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
      <div class="mt-8 rounded-2xl border border-ink-200/80 bg-white p-6 shadow-sm md:p-8">
        <p class="leading-relaxed text-ink-600">{{ i18n.t('legal.privacyBody') }}</p>
      </div>
      <p class="mt-8 text-center text-sm text-ink-500">
        <a routerLink="/" class="font-semibold text-brand-900 underline-offset-2 hover:underline">{{ i18n.t('footer.linkHome') }}</a>
      </p>
    </div>
  `,
})
export class PrivacyPageComponent {
  readonly i18n = inject(I18nService);
}
