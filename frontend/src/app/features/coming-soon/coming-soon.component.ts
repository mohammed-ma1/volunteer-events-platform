import { Component, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Locale } from '../../core/i18n/translations';

/**
 * Full-screen "Coming Soon" landing page shown while `SITE_DISABLED` is
 * `true`. Designed to be self-contained: no shell, no header, no API
 * calls, no router navigation away from itself.
 *
 * Visual design:
 *   - Brand-deep navy gradient background.
 *   - Three slow-floating gradient blobs (brand purple, indigo, gold)
 *     give the page motion without distracting from the message.
 *   - Subtle dotted grid overlay adds texture.
 *   - Centered glass card holds the logo, headline and bilingual copy.
 *   - Pulsing dots replace any spinner — calmer feel.
 *   - EN / AR pill toggle in the top-right corner. Whatever the visitor
 *     last picked persists via `I18nService` (localStorage).
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  template: `
    <div
      class="relative min-h-screen overflow-hidden bg-gradient-to-br from-ink-900 via-brand-950 to-ink-900 text-white antialiased"
      [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
      [attr.lang]="i18n.locale()"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 opacity-[0.07]"
        style="background-image: radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px); background-size: 28px 28px;"
      ></div>

      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-brand-700 opacity-40 blur-3xl animate-ve-blob"
        ></div>
        <div
          class="absolute -bottom-40 -right-20 h-[32rem] w-[32rem] rounded-full bg-accent-600 opacity-30 blur-3xl animate-ve-blob"
          style="animation-duration: 28s; animation-delay: -7s;"
        ></div>
        <div
          class="absolute top-1/3 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-gold-500 opacity-15 blur-3xl animate-ve-blob"
          style="animation-duration: 32s; animation-delay: -14s;"
        ></div>
      </div>

      <div class="absolute top-5 ltr:right-5 rtl:left-5 z-20">
        <div
          role="group"
          aria-label="Language"
          class="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-xs font-semibold backdrop-blur"
        >
          <button
            type="button"
            (click)="setLocale('en')"
            [class]="pillClass('en')"
            aria-pressed="true"
          >
            EN
          </button>
          <button
            type="button"
            (click)="setLocale('ar')"
            [class]="pillClass('ar')"
            aria-pressed="true"
          >
            ع
          </button>
        </div>
      </div>

      <main class="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <div class="w-full max-w-2xl">
          <div
            class="relative rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12 text-center shadow-[0_30px_120px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-ve-fade-up"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            ></span>

            <div class="flex flex-col items-center gap-6">
              <div class="relative">
                <div
                  aria-hidden="true"
                  class="absolute inset-0 -m-6 rounded-full bg-gold-500/15 blur-2xl"
                ></div>
                <img
                  src="/images/branding/next-levels-logo.png"
                  alt="Next Levels Education"
                  class="relative h-16 w-auto sm:h-20 drop-shadow-[0_10px_25px_rgba(212,175,55,0.35)]"
                />
              </div>

              <div
                class="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold-400 uppercase"
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60 animate-ping"
                  ></span>
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-gold-400"></span>
                </span>
                <span>{{ tr('قريبًا', 'Coming Soon') }}</span>
              </div>

              <h1
                class="text-3xl font-extrabold leading-tight text-white sm:text-5xl"
              >
                {{ tr('نُحضّر شيئًا استثنائيًا', "We're crafting something exceptional") }}
              </h1>

              <p
                class="max-w-md text-base leading-relaxed text-white/70 sm:text-lg"
              >
                {{ subtitleText() }}
              </p>

              <div
                class="mt-2 flex items-center justify-center gap-2"
                role="status"
                [attr.aria-label]="tr('جارٍ التحميل', 'Loading')"
              >
                <span
                  class="h-2.5 w-2.5 rounded-full bg-white/70 animate-bounce"
                  style="animation-delay: 0s;"
                ></span>
                <span
                  class="h-2.5 w-2.5 rounded-full bg-white/70 animate-bounce"
                  style="animation-delay: 0.15s;"
                ></span>
                <span
                  class="h-2.5 w-2.5 rounded-full bg-white/70 animate-bounce"
                  style="animation-delay: 0.3s;"
                ></span>
              </div>

              <div class="mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/10">
                <span
                  aria-hidden="true"
                  class="block h-full w-1/3 bg-gradient-to-r from-brand-400 via-accent-400 to-gold-400 animate-ve-shimmer"
                  style="background-size: 200% 100%;"
                ></span>
              </div>
            </div>
          </div>

          <p class="mt-8 text-center text-xs uppercase tracking-[0.2em] text-white/40">
            Next Levels Education · {{ year }}
          </p>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ComingSoonComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly year = new Date().getFullYear();
  private readonly localeSig = signal<Locale>(this.i18n.locale());

  readonly currentLocale = computed(() => this.localeSig());

  readonly subtitleText = computed(() =>
    this.i18n.locale() === 'ar'
      ? 'نضع اللمسات الأخيرة على منصتنا الجديدة. ترقّبوا تجربة تعلّم تطوّعية مميّزة قريبًا.'
      : "We're putting the finishing touches on our new platform. Stay tuned for a remarkable volunteer learning experience.",
  );

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
    this.localeSig.set(locale);
  }

  tr(ar: string, en: string): string {
    return this.i18n.locale() === 'ar' ? ar : en;
  }

  pillClass(target: Locale): string {
    const active = this.i18n.locale() === target;
    return [
      'rounded-full px-3 py-1 transition-colors cursor-pointer',
      active
        ? 'bg-white text-ink-900 shadow-sm'
        : 'text-white/70 hover:text-white hover:bg-white/10',
    ].join(' ');
  }
}
