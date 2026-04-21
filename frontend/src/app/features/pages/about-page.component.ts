import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ i18n.t('nav.about') }}</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {{ i18n.t('about.title') }}
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-ink-600">{{ i18n.t('about.intro') }}</p>

      <section class="mt-10 rounded-2xl bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] md:p-8">
        <h2 class="text-xl font-bold text-brand-900">{{ i18n.t('about.missionTitle') }}</h2>
        <p class="mt-3 leading-relaxed text-ink-600">{{ i18n.t('about.missionText') }}</p>
      </section>

      <section class="mt-8">
        <h2 class="text-xl font-bold text-brand-900">{{ i18n.t('about.offerTitle') }}</h2>
        <ul class="mt-4 space-y-3 text-ink-600">
          <li class="flex gap-3">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-900" aria-hidden="true"></span>
            <span>{{ i18n.t('about.offer1') }}</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-900" aria-hidden="true"></span>
            <span>{{ i18n.t('about.offer2') }}</span>
          </li>
          <li class="flex gap-3">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-900" aria-hidden="true"></span>
            <span>{{ i18n.t('about.offer3') }}</span>
          </li>
        </ul>
      </section>

      <section class="mt-8 rounded-2xl bg-ink-100/60 p-6 md:p-8">
        <h2 class="text-xl font-bold text-brand-900">{{ i18n.t('about.partnerTitle') }}</h2>
        <p class="mt-3 leading-relaxed text-ink-600">{{ i18n.t('about.partnerText') }}</p>
      </section>

      <div class="mt-10 flex flex-wrap gap-3">
        <a
          routerLink="/"
          fragment="workshops"
          class="ve-btn-primary"
        >
          {{ i18n.t('about.ctaWorkshops') }}
        </a>
        <a
          routerLink="/career"
          class="ve-btn-secondary !border-ink-200 !bg-ink-100 hover:!bg-ink-200"
        >
          {{ i18n.t('about.ctaCareer') }}
        </a>
      </div>
    </div>
  `,
})
export class AboutPageComponent {
  readonly i18n = inject(I18nService);
}
