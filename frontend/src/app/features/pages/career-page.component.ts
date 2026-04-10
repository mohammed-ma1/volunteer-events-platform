import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-career-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-500">{{ i18n.t('nav.career') }}</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {{ i18n.t('careerPage.title') }}
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-ink-600">{{ i18n.t('careerPage.intro') }}</p>

      <h2 class="mt-12 text-xl font-bold text-brand-900">{{ i18n.t('careerPage.pathsTitle') }}</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-1">
        <article class="rounded-2xl bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] md:p-7">
          <h3 class="text-lg font-bold text-brand-900">{{ i18n.t('careerPage.path1Title') }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ i18n.t('careerPage.path1Text') }}</p>
        </article>
        <article class="rounded-2xl bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] md:p-7">
          <h3 class="text-lg font-bold text-brand-900">{{ i18n.t('careerPage.path2Title') }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ i18n.t('careerPage.path2Text') }}</p>
        </article>
        <article class="rounded-2xl bg-white p-6 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] md:p-7">
          <h3 class="text-lg font-bold text-brand-900">{{ i18n.t('careerPage.path3Title') }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ i18n.t('careerPage.path3Text') }}</p>
        </article>
      </div>

      <section class="mt-12">
        <h2 class="text-xl font-bold text-brand-900">{{ i18n.t('careerPage.stepsTitle') }}</h2>
        <ol class="mt-6 space-y-4">
          <li class="flex gap-4">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white"
              >1</span
            >
            <p class="pt-1 leading-relaxed text-ink-600">{{ i18n.t('careerPage.step1') }}</p>
          </li>
          <li class="flex gap-4">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white"
              >2</span
            >
            <p class="pt-1 leading-relaxed text-ink-600">{{ i18n.t('careerPage.step2') }}</p>
          </li>
          <li class="flex gap-4">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white"
              >3</span
            >
            <p class="pt-1 leading-relaxed text-ink-600">{{ i18n.t('careerPage.step3') }}</p>
          </li>
        </ol>
      </section>

      <div class="mt-10">
        <a
          routerLink="/"
          fragment="workshops"
          class="ve-focus-ring inline-flex rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          {{ i18n.t('careerPage.ctaBrowse') }}
        </a>
      </div>
    </div>
  `,
})
export class CareerPageComponent {
  readonly i18n = inject(I18nService);
}
