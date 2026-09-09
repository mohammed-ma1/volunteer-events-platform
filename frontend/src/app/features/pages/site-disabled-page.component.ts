import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-site-disabled-page',
  standalone: true,
  template: `
    <div class="flex min-h-dvh flex-col bg-[var(--ve-surface,#f8fafc)]">
      <header class="border-b border-ink-200/80 bg-white/90">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
          <img
            src="/images/branding/next-levels-logo.png"
            alt="Next Levels"
            class="h-10 w-auto object-contain md:h-12"
          />
          <button
            type="button"
            class="rounded-full border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
            (click)="i18n.toggleLocale()"
          >
            {{ i18n.locale() === 'ar' ? i18n.t('nav.langOptionEnglish') : i18n.t('nav.langOptionArabic') }}
          </button>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
          {{ i18n.t('siteDisabled.title') }}
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-ink-600">{{ i18n.t('siteDisabled.body') }}</p>
        <p class="mt-3 text-sm text-ink-500">{{ i18n.t('siteDisabled.contact') }}</p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://api.whatsapp.com/send?phone=96599974367"
            class="ve-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a href="mailto:info@nextlevels.education" class="ve-btn-secondary">
            info&#64;nextlevels.education
          </a>
        </div>
      </main>
    </div>
  `,
})
export class SiteDisabledPageComponent {
  readonly i18n = inject(I18nService);
}
