import { Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <main
      class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[var(--ve-surface)] bg-hero-mesh px-6 py-16 text-center"
    >
      <!-- decorative blobs -->
      <div
        class="pointer-events-none absolute -top-24 -start-24 h-72 w-72 rounded-full bg-gold-400/25 blur-3xl animate-ve-blob"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-28 -end-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl animate-ve-blob"
        aria-hidden="true"
      ></div>

      <div class="relative flex w-full max-w-xl flex-col items-center animate-ve-fade-up">
        <img
          src="/images/branding/next-levels-logo.png"
          [attr.alt]="alt()"
          class="h-12 w-auto object-contain sm:h-14"
          width="200"
          height="56"
          fetchpriority="high"
        />

        <span
          class="mt-10 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-700 shadow-soft backdrop-blur"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-500/70"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
          </span>
          {{ badge() }}
        </span>

        <h1 class="mt-6 text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
          {{ heading() }}
        </h1>

        <p class="mt-4 max-w-md text-base leading-relaxed text-ink-500">
          {{ body() }}
        </p>

        <button
          type="button"
          (click)="i18n.toggleLocale()"
          class="ve-focus-ring mt-10 inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white/80 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-soft backdrop-blur transition hover:bg-white"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.75"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9L21 3m-5 5l4 9M9.5 9a18.022 18.022 0 003.636 5.5"
            />
          </svg>
          {{ toggleLabel() }}
        </button>
      </div>

      <p class="relative mt-16 text-xs text-ink-400">{{ copyright() }}</p>
    </main>
  `,
})
export class ComingSoonComponent {
  readonly i18n = inject(I18nService);

  private readonly ar = this.i18n.isRtl;

  readonly alt = computed(() => (this.ar() ? 'نيكست ليفيلز' : 'Next Levels'));

  readonly badge = computed(() => (this.ar() ? 'قريبًا' : 'Coming soon'));

  readonly heading = computed(() =>
    this.ar() ? 'الموقع سيكون متاحًا قريبًا' : "Our site will be available soon",
  );

  readonly body = computed(() =>
    this.ar()
      ? 'نضع اللمسات الأخيرة على منصة نيكست ليفيلز التعليمية. سيكون الموقع متاحًا قريبًا جدًا — شكرًا لصبركم.'
      : "We're putting the finishing touches on the Next Levels education platform. It will be available very soon — thank you for your patience.",
  );

  readonly toggleLabel = computed(() => (this.ar() ? 'English' : 'العربية'));

  readonly copyright = computed(() =>
    this.ar()
      ? `© ${new Date().getFullYear()} نيكست ليفيلز`
      : `© ${new Date().getFullYear()} Next Levels`,
  );
}
