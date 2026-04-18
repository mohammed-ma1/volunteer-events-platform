import { DOCUMENT, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  KU_WORKSHOP_WEEK_DAY_KEYS,
  isKuWorkshopWeekDayKey,
  kuWorkshopWeekNoonIso,
} from '../../core/constants/ku-workshop-week';
import { ALL_PACKAGE_SLUGS } from '../../core/constants/package-offer';
import { CATEGORY_PACKAGES, CategoryPackagePromo } from '../../core/constants/category-packages-promo';
import { HOME_HERO_IMAGE_URL } from '../../core/constants/promo-hero';
import { HOME_EXPERTS, HomeExpert, normalizePresenterName } from '../../core/data/home-experts';
import { CheckoutFlowService } from '../../core/services/checkout-flow.service';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import {
  DUMMY_HOME_EVENTS,
  HomeListEvent,
  volunteerToHome,
  WorkshopFilterCategory,
  eventMatchesWorkshopFilter,
} from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { EventCardComponent } from './event-card.component';
import { formatCardDateLong, formatTimeKuwait, parsePresenterFromSummaries } from './event-card-meta';
import { calendarDayKeyKuwait, formatDaySubLabelKuwait } from './workshop-day-filters';

const CATEGORY_ORDER: WorkshopFilterCategory[] = [
  'all',
  'personal',
  'professional',
];

const ARABIC_DAY_ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];
const ENGLISH_DAY_ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];

@Component({
  selector: 'app-events-home',
  standalone: true,
  imports: [FormsModule, NgClass, RouterLink, EventCardComponent, ScrollRevealDirective],
  template: `
    <section
      veScrollReveal
      class="ve-scroll-reveal relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white via-brand-50/25 to-white px-5 py-10 shadow-sm ring-1 ring-ink-200/60 md:px-10 md:py-12"
    >
      <div
        class="pointer-events-none absolute -start-32 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-gold-400/20 via-accent-500/10 to-brand-900/5 blur-3xl motion-safe:animate-ve-blob"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -end-24 bottom-0 h-56 w-56 rounded-full bg-gradient-to-tl from-accent-500/12 to-transparent blur-3xl motion-safe:animate-ve-blob motion-safe:[animation-delay:-9s]"
        aria-hidden="true"
      ></div>

      <div class="relative grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
        <!-- Text Side (right in RTL, left in LTR) -->
        <div class="space-y-5">
          <span
            class="motion-safe:animate-ve-fade-up inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-900 shadow-sm ring-1 ring-ink-200/80 backdrop-blur-sm"
          >
            <span class="relative flex h-2 w-2" aria-hidden="true">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-45 motion-reduce:animate-none"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
            </span>
            {{ i18n.t('hero.badge') }}
          </span>
          <h1
            class="motion-safe:animate-ve-fade-up text-start text-3xl font-extrabold leading-[1.2] tracking-tight motion-safe:[animation-delay:60ms] md:text-4xl lg:text-[2.75rem]"
          >
            <span class="block text-brand-900">{{ i18n.t('hero.title1') }}</span>
            <span class="block pt-1 md:pt-1.5">
              <span class="ve-hero-title2-gradient">{{ i18n.t('hero.title2a') }}</span
              ><span class="ve-hero-title2-bronze">{{ i18n.t('hero.title2b') }}</span
              ><span class="ve-hero-title2-bright">{{ i18n.t('hero.title2c') }}</span>
            </span>
          </h1>
          <p
            class="motion-safe:animate-ve-fade-up max-w-xl text-base leading-relaxed text-ink-600 motion-safe:[animation-delay:120ms]"
          >
            {{ i18n.t('hero.body') }}
          </p>
          <div
            class="motion-safe:animate-ve-fade-up mt-3 flex flex-wrap gap-3 motion-safe:[animation-delay:150ms]"
          >
            <a
              routerLink="/"
              fragment="workshops"
              class="ve-btn-primary motion-safe:animate-ve-cta-ring group relative overflow-hidden transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500 group-hover:translate-x-full motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              ></span>
              <span class="relative inline-flex items-center gap-2">
                <span>{{ i18n.t('hero.ctaBrowse') }}</span>
                <svg class="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </a>
            <a
              routerLink="/"
              fragment="trainers"
              class="ve-btn-secondary group transition duration-300 hover:scale-[1.01] active:scale-[0.98]"
            >
              <span class="inline-flex items-center gap-2">
                <span>{{ i18n.t('hero.ctaFacilitators') }}</span>
                <svg class="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        <!-- Image Side (left in RTL, right in LTR) -->
        <div class="motion-safe:animate-ve-fade-up relative motion-safe:[animation-delay:100ms]">
          <div class="group relative overflow-hidden rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,26,51,0.25)]">
            <img
              [src]="homeHeroImageUrl"
              [alt]="i18n.t('hero.imageAlt')"
              class="aspect-[4/3] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              width="800"
              height="600"
              fetchpriority="high"
            />
          </div>

          <!-- Stat Badge: top-start corner, slightly outside image -->
          <div class="motion-safe:animate-ve-float absolute -top-3 -start-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_30px_-8px_rgba(0,26,51,0.2)] ring-1 ring-ink-200/40 md:-top-4 md:-start-4 md:px-5 md:py-3.5">
            <p class="text-sm font-bold text-brand-900 md:text-base">{{ i18n.t('hero.stat') }}</p>
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-100 text-base shadow-inner md:h-8 md:w-8" aria-hidden="true">🏅</span>
          </div>

          <!-- Partnership Card: bottom-end corner, slightly outside image -->
          <div class="motion-safe:animate-ve-float absolute -bottom-4 -end-3 flex flex-col items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-[0_15px_40px_-10px_rgba(0,26,51,0.25)] ring-1 ring-ink-200/40 md:-bottom-5 md:-end-4 md:px-6 md:py-3.5">
            <span class="text-[11px] font-bold text-brand-900 md:text-xs">{{ i18n.isRtl() ? 'مشروع تَهيّأ بالتعاون مع جامعة الكويت' : 'In partnership with Kuwait University' }}</span>
            <div class="flex items-center gap-3">
              <img src="/images/branding/ku-university-logo.png" alt="Kuwait University" class="h-9 w-auto shrink-0 object-contain md:h-10"/>
              <span class="h-7 w-px bg-ink-200" aria-hidden="true"></span>
              <img src="/images/branding/next-levels-logo.png" alt="Next Levels" class="h-6 w-auto shrink-0 object-contain md:h-7"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section veScrollReveal class="ve-scroll-reveal mt-14 bg-white py-2">
      <div class="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-6">
        @for (f of featuresDisplayOrder(); track f.titleKey) {
          <div class="group flex flex-col items-center px-2 text-center">
            <div
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100/90 text-brand-900 transition duration-300 group-hover:scale-[1.06] group-hover:bg-violet-100 motion-reduce:group-hover:scale-100"
            >
              @switch (f.iconId) {
                @case ('cap') {
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                }
                @case ('book') {
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                }
                @case ('users') {
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                @case ('star') {
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                }
              }
            </div>
            <h2 class="text-sm font-bold text-brand-900 md:text-[0.95rem]">{{ i18n.t(f.titleKey) }}</h2>
            <p class="mt-2 max-w-[17rem] text-xs leading-relaxed text-ink-600 md:text-sm">
              {{ i18n.t(f.descKey) }}
            </p>
          </div>
        }
      </div>
    </section>

    <section
      id="workshops"
      veScrollReveal
      class="ve-scroll-reveal mt-16 scroll-mt-24 rounded-3xl bg-[#f4f6f9] px-4 py-8 shadow-inner ring-1 ring-ink-200/60 md:px-8 md:py-10"
    >
      <div class="motion-safe:animate-ve-fade-up w-full min-w-0 text-start">
        <div class="flex w-full max-w-3xl flex-col items-start gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-900 shadow-sm ring-1 ring-violet-200/80"
          >
            <svg class="h-3.5 w-3.5 shrink-0 text-violet-700/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {{ i18n.t('workshops.programsBadge') }}
          </span>
          <h2 class="text-2xl font-extrabold tracking-tight md:text-3xl">
            <span class="text-brand-900">{{ i18n.t('workshops.titleBefore') }}</span>
            <span class="ve-hero-accent"> {{ i18n.t('workshops.titleHighlight') }} </span>
            <span class="text-brand-900">{{ i18n.t('workshops.titleAfter') }}</span>
          </h2>
          <p class="max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
            {{ i18n.t('workshops.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Package offers carousel (100 + two 50-workshop bundles) -->
      <div class="motion-safe:animate-ve-fade-up relative mt-8">
        <button
          type="button"
          class="absolute start-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 sm:start-2 sm:h-11 sm:w-11"
          (click)="prevPromoSlide()"
          [attr.aria-label]="i18n.t('workshops.promoPrevAria')"
        >
          <svg class="h-5 w-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          class="absolute end-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 sm:end-2 sm:h-11 sm:w-11"
          (click)="nextPromoSlide()"
          [attr.aria-label]="i18n.t('workshops.promoNextAria')"
        >
          <svg class="h-5 w-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          class="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1020] via-[#121a33] to-[#0b1020] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/10 select-none"
          dir="ltr"
          role="region"
          [attr.aria-label]="i18n.t('workshops.promoSliderAria')"
          (touchstart)="onPromoTouchStart($event)"
          (touchend)="onPromoTouchEnd($event)"
        >
          <div
            class="flex w-[300%] transition-transform duration-500 ease-out motion-reduce:transition-none"
            [style.transform]="promoCarouselTransform()"
          >
            <!-- Slide 0: 100 workshops -->
            <div
              class="flex w-[33.333333%] shrink-0 flex-col justify-center gap-6 px-5 py-8 sm:px-8 lg:grid lg:min-h-[17rem] lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10 lg:py-10"
              [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
            >
              <div class="flex flex-col justify-center gap-4 lg:order-2">
                <span
                  class="inline-flex w-fit items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100"
                >
                  {{ i18n.t('workshops.promoSavePct') }}
                </span>
                <p class="inline-flex items-center gap-2 text-sm font-semibold text-amber-100/95">
                  <svg class="h-5 w-5 shrink-0 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  {{ i18n.t('workshops.promoCertBanner') }}
                </p>
                <h3 class="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl">
                  {{ i18n.t('workshops.promoTitle') }}
                </h3>
                <p class="max-w-xl text-sm leading-relaxed text-white/70 md:text-[0.95rem]">
                  {{ i18n.t('workshops.promoBody') }}
                </p>
              </div>
              <div class="flex flex-col justify-center gap-5 lg:order-1">
                <div class="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <span class="text-4xl font-black tracking-tight text-amber-300 md:text-[2.65rem]">{{
                    i18n.t('workshops.promoPrice')
                  }}</span>
                  <span class="text-base font-medium text-white/35 line-through md:text-lg">{{ i18n.t('workshops.promoPriceWas') }}</span>
                </div>
                <div
                  class="max-w-xl rounded-2xl border border-fuchsia-400/45 bg-[#1a1428]/95 p-4 shadow-inner md:p-5"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <p class="text-base leading-relaxed text-white">
                      {{ i18n.t('workshops.promoInstallmentPrefix') }}
                      <span class="text-2xl font-extrabold text-pink-400">{{ i18n.t('workshops.promoInstallmentAmount') }}</span>
                    </p>
                    <span
                      class="inline-flex w-fit shrink-0 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white"
                      >{{ i18n.t('workshops.promoInterestFree') }}</span
                    >
                  </div>
                </div>
                <button
                  type="button"
                  class="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-[#4c3d9e] px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#43388d] active:scale-[0.98]"
                  (click)="onPromoCheckout100()"
                >
                  <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>{{ i18n.t('workshops.promoCta') }}</span>
                </button>
              </div>
            </div>

            @for (pkg of categoryPackages; track pkg.slug) {
              <div
                class="flex w-[33.333333%] shrink-0 flex-col justify-center gap-6 px-5 py-8 sm:px-8 lg:grid lg:min-h-[17rem] lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10 lg:py-10"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
                [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
              >
                <div class="flex flex-col justify-center gap-4 lg:order-2">
                  <span
                    class="inline-flex w-fit items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100"
                  >
                    {{ categoryPromoCopy(pkg).savePct }}
                  </span>
                  <p class="inline-flex items-center gap-2 text-sm font-semibold text-amber-100/95">
                    <svg class="h-5 w-5 shrink-0 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    {{ i18n.t('workshops.bundleFiftyCerts') }}
                  </p>
                  <h3 class="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl">
                    {{ categoryPromoCopy(pkg).title }}
                  </h3>
                  <p class="max-w-xl text-sm leading-relaxed text-white/70 md:text-[0.95rem]">
                    {{ categoryPromoCopy(pkg).tagline }}
                  </p>
                </div>
                <div class="flex flex-col justify-center gap-5 lg:order-1">
                  <div class="flex flex-wrap items-end gap-x-4 gap-y-2">
                    <span class="text-4xl font-black tracking-tight text-amber-300 md:text-[2.65rem]">{{
                      categoryPromoCopy(pkg).priceNow
                    }}</span>
                    <span class="text-base font-medium text-white/35 line-through md:text-lg">{{ categoryPromoCopy(pkg).priceWas }}</span>
                  </div>
                  <div class="max-w-xl rounded-2xl border border-fuchsia-400/45 bg-[#1a1428]/95 p-4 shadow-inner md:p-5">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <p class="text-base leading-relaxed text-white">
                        {{ categoryPromoCopy(pkg).installmentPrefix }}
                        <span class="text-2xl font-extrabold text-pink-400">{{ categoryPromoCopy(pkg).installmentAmount }}</span>
                      </p>
                      <span
                        class="inline-flex w-fit shrink-0 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white"
                        >{{ categoryPromoCopy(pkg).interestFree }}</span
                      >
                    </div>
                  </div>
                  <button
                    type="button"
                    class="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-[#4c3d9e] px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-[#43388d] active:scale-[0.98]"
                    (click)="onCategoryPackageCheckout(pkg.slug)"
                  >
                    <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span>{{ categoryPromoCopy(pkg).cta }}</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="mt-3 flex justify-center gap-2" role="tablist" [attr.aria-label]="i18n.t('workshops.promoSliderAria')">
          @for (s of promoSlideIndices; track s) {
            <button
              type="button"
              role="tab"
              class="h-2 rounded-full transition-all"
              [class.w-6]="promoSlideIndex() === s"
              [class.bg-brand-900]="promoSlideIndex() === s"
              [class.w-2]="promoSlideIndex() !== s"
              [class.bg-ink-300]="promoSlideIndex() !== s"
              [attr.aria-selected]="promoSlideIndex() === s"
              [attr.aria-label]="promoDotLabel(s)"
              (click)="goToPromoSlide(s)"
            ></button>
          }
        </div>
      </div>

      <!-- Filters: same structure & density as learner dashboard -->
      <div class="mt-8 flex flex-col gap-2.5">
        <div class="flex">
          <span class="text-xs font-semibold text-ink-500">{{ i18n.t('workshops.filterByCategoryHint') }}</span>
        </div>
        <div
          class="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          [attr.aria-label]="i18n.t('workshops.filterCategoryAria')"
        >
          @for (cat of CATEGORY_ORDER; track cat) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="selectedCategory() === cat"
              (click)="onSelectCategory(cat)"
              class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98] motion-reduce:active:scale-100"
              [ngClass]="
                selectedCategory() === cat
                  ? 'bg-brand-900 text-white shadow-md'
                  : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
              "
            >
              {{ categoryLabel(cat) }}
              <span class="font-normal opacity-80">({{ categoryCounts()[cat] }})</span>
            </button>
          }
        </div>
      </div>

      @if (workshopDayBuckets().length > 0) {
        <div class="mt-4 flex flex-col gap-2.5">
          <div class="flex">
            <span class="text-xs font-semibold text-ink-500">{{ i18n.t('workshops.filterByDayHint') }}</span>
          </div>
          <div
            class="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            [attr.aria-label]="i18n.t('workshops.filterDaysAria')"
          >
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="selectedDayKey() === null"
              (click)="onSelectDay(null)"
              class="shrink-0 rounded-2xl px-4 py-2 text-center transition duration-200"
              [ngClass]="
                selectedDayKey() === null
                  ? 'bg-brand-900 text-white shadow-md'
                  : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
              "
            >
              <span class="block text-sm font-bold">
                {{ i18n.t('workshops.allDaysShort') }}
                <span class="font-normal opacity-80">({{ categoryFilteredEvents().length }})</span>
              </span>
              <span
                class="mt-0.5 block text-[11px] font-medium"
                [ngClass]="selectedDayKey() === null ? 'text-white/80' : 'text-ink-500'"
              >
                {{ i18n.t('workshops.showAllShort') }}
              </span>
            </button>

            @for (b of workshopDayBuckets(); track b.key; let di = $index) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="selectedDayKey() === b.key"
                (click)="onSelectDay(b.key)"
                class="shrink-0 rounded-2xl px-4 py-2 text-center transition duration-200"
                [ngClass]="
                  selectedDayKey() === b.key
                    ? 'bg-brand-900 text-white shadow-md'
                    : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                "
              >
                <span class="block text-sm font-bold">
                  {{ dayLabel(di) }} <span class="font-normal opacity-80">({{ b.count }})</span>
                </span>
                <span
                  class="mt-0.5 block text-[11px] font-medium"
                  [ngClass]="selectedDayKey() === b.key ? 'text-white/80' : 'text-ink-500'"
                >
                  {{ b.sub }}
                </span>
              </button>
            }
          </div>
        </div>
      }

      <div
        class="motion-safe:animate-ve-fade-up mt-4 flex min-w-0 flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <label
          class="flex min-h-[2.75rem] w-full min-w-0 flex-1 items-center gap-2.5 rounded-full border border-ink-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-brand-900/25 focus-within:ring-2 focus-within:ring-brand-900/10 sm:max-w-md"
        >
          <svg class="h-5 w-5 shrink-0 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="workshop-search-input"
            class="min-w-0 flex-1 bg-transparent text-sm text-brand-900 outline-none placeholder:text-ink-400"
            [placeholder]="i18n.t('workshops.searchPlaceholder')"
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
          />
        </label>
        <div class="relative w-full shrink-0 sm:w-auto sm:min-w-[12rem]">
          <select
            class="w-full cursor-pointer appearance-none rounded-full border border-ink-200 bg-white py-2.5 ps-4 pe-9 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10"
            [ngModel]="workshopSortMode()"
            (ngModelChange)="onWorkshopSortChange($event)"
          >
            <option value="closest">{{ i18n.t('workshops.sortClosest') }}</option>
            <option value="latest">{{ i18n.t('workshops.sortLatest') }}</option>
            <option value="title">{{ i18n.t('workshops.sortAlphabetical') }}</option>
          </select>
          <svg
            class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      @if (demoHint()) {
        <p
          class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {{ i18n.t('workshops.demoHint') }}
        </p>
      }

      @if (error()) {
        <p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {{ error() }}
        </p>
      }

      <div id="workshops-grid" class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (event of displayedWorkshops(); track event.id; let ei = $index) {
          <div
            class="motion-safe:animate-ve-fade-up h-full motion-reduce:opacity-100"
            [style.animation-delay.ms]="ei * 40"
          >
            <app-event-card [event]="event" (add)="onAdd($event)" />
          </div>
        }
      </div>

      @if (loading()) {
        <p class="mt-8 text-center text-sm text-ink-500">{{ i18n.t('workshops.loading') }}</p>
      }

      @if (!loading() && !sortedFilteredEvents().length) {
        <p class="mt-8 text-center text-sm text-ink-500">{{ i18n.t('workshops.empty') }}</p>
      }

      @if (!loading() && (canLoadMore() || canLoadLess())) {
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          @if (canLoadMore()) {
            <button
              type="button"
              class="ve-btn-secondary inline-flex items-center gap-2 px-8"
              (click)="loadMoreWorkshops()"
            >
              <span>{{ i18n.t('workshops.showMore') }}</span>
              <svg class="h-4 w-4 shrink-0 text-brand-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          }
          @if (canLoadLess()) {
            <button
              type="button"
              class="ve-btn-secondary inline-flex items-center gap-2 px-8"
              (click)="loadLessWorkshops()"
            >
              <span>{{ i18n.t('workshops.showLess') }}</span>
              <svg class="h-4 w-4 shrink-0 text-brand-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          }
        </div>
      }

    </section>

    <section
      id="trainers"
      veScrollReveal
      class="ve-scroll-reveal mt-16 scroll-mt-24 rounded-3xl bg-[#f7f8fb] px-4 py-10 ring-1 ring-ink-200/50 md:px-8 md:py-14"
    >
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <span
            class="inline-flex items-center gap-2 rounded-full bg-violet-100/90 px-4 py-1.5 text-xs font-bold text-brand-900 ring-1 ring-accent-400/25"
          >
            <span aria-hidden="true">🌟</span>
            {{ i18n.t('experts.badge') }}
          </span>
          <h2 class="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-brand-900 md:text-[1.75rem]">
            {{ i18n.t('experts.titleBefore') }}
            <span class="ve-hero-accent">{{ i18n.t('experts.titleHighlight') }}</span>
            {{ i18n.t('experts.titleAfter') }}
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
            {{ i18n.t('experts.subtitle') }}
          </p>
        </div>

        <div class="mt-10 grid gap-8 lg:grid-cols-[minmax(240px,28%)_minmax(0,1fr)] lg:items-start">
          <aside class="flex flex-col gap-4">
            <label
              class="flex items-center gap-2.5 rounded-full border border-ink-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:ring-2 focus-within:ring-brand-900/10"
            >
              <svg class="h-5 w-5 shrink-0 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                class="min-w-0 flex-1 bg-transparent text-sm text-brand-900 outline-none placeholder:text-ink-400"
                [placeholder]="i18n.t('experts.searchPh')"
                [value]="expertSearch()"
                (input)="onExpertSearch($any($event.target).value)"
              />
            </label>
            <div class="flex max-h-[min(28rem,55vh)] flex-col gap-2 overflow-y-auto pe-1">
              @for (ex of displayedExpertTabs(); track ex.id) {
                <button
                  type="button"
                  (click)="selectExpert(ex.id)"
                  class="w-full rounded-full px-4 py-3 text-start text-sm font-semibold transition duration-200"
                  [ngClass]="
                    selectedExpertId() === ex.id
                      ? 'bg-brand-900 text-white shadow-md'
                      : 'border border-ink-200 bg-white text-brand-900 hover:bg-white'
                  "
                >
                  {{ expertName(ex) }}
                </button>
              }
            </div>
            @if (filteredExperts().length > EXPERT_SIDEBAR_PREVIEW) {
              <button
                type="button"
                class="ve-btn-secondary ve-btn-secondary--block"
                (click)="toggleExpertListExpand()"
              >
                <span>{{ showAllExpertTabs() ? i18n.t('experts.showLess') : i18n.t('experts.showMore') }}</span>
                @if (showAllExpertTabs()) {
                  <svg class="h-4 w-4 shrink-0 text-brand-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                } @else {
                  <svg class="h-4 w-4 shrink-0 text-brand-900" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                }
              </button>
            }
          </aside>

          <div class="min-w-0 space-y-8">
            <article
              class="overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(0,26,51,0.12)]"
            >
              <div class="grid md:grid-cols-2">
                <div class="relative min-h-[15rem] bg-ink-50 md:min-h-[19rem]">
                  <img
                    [src]="selectedExpert().imageUrl"
                    [alt]="expertName(selectedExpert())"
                    class="h-full min-h-[15rem] w-full object-contain md:absolute md:inset-0 md:min-h-full"
                    loading="lazy"
                  />
                </div>
                <div class="flex flex-col justify-center p-6 md:p-8">
                  <h3 class="text-xl font-extrabold text-brand-900 md:text-2xl">{{ expertName(selectedExpert()) }}</h3>
                  <p class="mt-1 text-sm font-medium text-ink-500">{{ expertSpecialty(selectedExpert()) }}</p>
                  <p class="mt-4 text-sm leading-relaxed text-ink-600">{{ expertBio(selectedExpert()) }}</p>
                </div>
              </div>
            </article>

            <div>
              <h3 class="text-lg font-extrabold text-brand-900">
                {{ i18n.t('experts.workshopsHeading') }}
                <span class="text-brand-700">({{ expertWorkshopsForSelected().length }})</span>
              </h3>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                @for (ev of expertWorkshopsForSelected(); track ev.slug) {
                  <div class="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
                    @if (ev.image_url) {
                      <img
                        [src]="ev.image_url"
                        alt=""
                        class="h-14 w-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-ink-100"
                      />
                    } @else {
                      <div
                        class="h-14 w-[4.5rem] shrink-0 rounded-lg bg-ink-100 ring-1 ring-ink-100"
                        aria-hidden="true"
                      ></div>
                    }
                    <div class="min-w-0 flex-1 text-start">
                      <p class="text-sm font-bold leading-snug text-[#0a1628]">
                        {{ displayWorkshopTitle(ev) }}
                      </p>
                      <p class="mt-1 text-xs text-ink-500">{{ workshopLineMeta(ev) }}</p>
                    </div>
                    <div class="flex shrink-0">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-brand-900 shadow-sm transition hover:bg-ink-50 active:scale-[0.97]"
                        (click)="addExpertWorkshopToCart(ev)"
                      >
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        {{ i18n.t('card.addCart') }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section veScrollReveal class="ve-scroll-reveal mt-20">
      <div class="text-center motion-safe:animate-ve-fade-up">
        <h2 class="text-2xl font-extrabold tracking-tight text-brand-900 md:text-3xl">{{ i18n.t('faq.title') }}</h2>
        <p class="mx-auto mt-2 max-w-2xl text-sm text-ink-600 md:text-base">{{ i18n.t('faq.subtitle') }}</p>
      </div>
      <div
        class="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-ink-200/90 bg-gradient-to-b from-white to-ink-50/90 px-1 py-1 shadow-sm"
      >
        @for (item of faqItems; track item.q; let i = $index) {
          <div class="border-b border-ink-200/80 last:border-0">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-4 text-start text-sm font-bold text-brand-900 transition duration-200 hover:bg-white/80 md:px-5 md:text-base"
              (click)="toggleFaq(i)"
              [attr.aria-expanded]="openFaqIndex() === i"
            >
              <span>{{ i18n.t(item.q) }}</span>
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 transition duration-300"
                [class.rotate-180]="openFaqIndex() === i"
                [class.bg-ink-200]="openFaqIndex() === i"
                [class.text-brand-900]="openFaqIndex() === i"
                aria-hidden="true"
                >▼</span
              >
            </button>
            @if (openFaqIndex() === i) {
              <div
                class="motion-safe:animate-ve-fade-in border-s-2 border-ink-900/12 px-4 pb-4 ps-5 text-sm leading-relaxed text-ink-600 md:px-5 md:ps-6"
              >
                {{ i18n.t(item.a) }}
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class EventsHomeComponent implements OnDestroy {
  readonly i18n = inject(I18nService);
  private readonly eventsApi = inject(EventsService);
  private readonly doc = inject(DOCUMENT);
  private readonly checkoutFlow = inject(CheckoutFlowService);
  readonly cart = inject(CartService);

  /** Initial grid size + step for load-more / load-less. */
  readonly WORKSHOPS_PREVIEW = 4;
  readonly WORKSHOPS_STEP = 4;
  /** Number of workshops currently visible (incremental, ramps up by WORKSHOPS_STEP). */
  readonly visibleCount = signal<number>(this.WORKSHOPS_PREVIEW);

  /** Load full workshop list in one request (backend caps per_page; must cover all seeded events). */
  private readonly EVENTS_HOME_PER_PAGE = 200;

  readonly EXPERT_SIDEBAR_PREVIEW = 13;

  readonly homeHeroImageUrl = HOME_HERO_IMAGE_URL;
  readonly categoryPackages = CATEGORY_PACKAGES;

  /** Package carousel: 0 = 100-workshop bundle, 1–2 = 50-workshop category bundles (order matches `categoryPackages`). */
  readonly promoSlideIndex = signal(0);
  readonly promoSlideCount = 3;
  readonly promoSlideIndices: readonly number[] = [0, 1, 2];

  /** Touch swipe: record start X for `touchend` delta. */
  private promoTouchStartX: number | null = null;

  readonly workshopSortMode = signal<'closest' | 'latest' | 'title'>('closest');

  readonly expertSearch = signal('');
  readonly selectedExpertId = signal(HOME_EXPERTS[0].id);
  readonly showAllExpertTabs = signal(false);

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly CATEGORY_ORDER = CATEGORY_ORDER;

  readonly selectedCategory = signal<WorkshopFilterCategory>('all');
  /** Calendar day key (Kuwait); null = all days in the current list (for non–KU-week multi-day filters). */
  /** null = "All Days" tab selected (shows every day in current category). */
  readonly selectedDayKey = signal<string | null>(null);
  readonly showAllWorkshops = signal(false);
  readonly homeEvents = signal<HomeListEvent[]>([]);
  readonly usingDummy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly demoHint = signal(false);
  readonly page = signal(1);
  readonly lastPage = signal(1);

  searchText = '';
  openFaqIndex = signal<number | null>(null);

  /** All visible workshop events (excludes package SKUs entirely). */
  readonly visibleWorkshopEvents = computed(() =>
    this.homeEvents().filter((ev) => !ALL_PACKAGE_SLUGS.includes(ev.slug)),
  );

  readonly categoryFilteredEvents = computed(() => {
    const cat = this.selectedCategory();
    return this.visibleWorkshopEvents().filter((ev) =>
      eventMatchesWorkshopFilter(cat, ev.category),
    );
  });

  /** Total count of workshops per filter category, for badge labels. */
  readonly categoryCounts = computed<Record<WorkshopFilterCategory, number>>(() => {
    const list = this.visibleWorkshopEvents();
    const counts: Record<WorkshopFilterCategory, number> = {
      all: list.length,
      personal: 0,
      professional: 0,
    };
    for (const ev of list) {
      if (ev.category === 'personal') {
        counts.personal++;
      } else if (ev.category === 'professional') {
        counts.professional++;
      }
    }
    return counts;
  });

  categoryPromoCopy(promo: CategoryPackagePromo): CategoryPackagePromo['ar'] {
    return this.i18n.isRtl() ? promo.ar : promo.en;
  }

  readonly workshopDayBuckets = computed(() => {
    const list = this.categoryFilteredEvents();
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    const touchesKuWeek = list.some((ev) => isKuWorkshopWeekDayKey(calendarDayKeyKuwait(ev.starts_at)));
    // Pre-count workshops per day key (within the selected category).
    const countByKey = new Map<string, number>();
    for (const ev of list) {
      const k = calendarDayKeyKuwait(ev.starts_at);
      countByKey.set(k, (countByKey.get(k) ?? 0) + 1);
    }
    if (touchesKuWeek) {
      return KU_WORKSHOP_WEEK_DAY_KEYS.map((key) => {
        const iso = kuWorkshopWeekNoonIso(key);
        return {
          key,
          sort: new Date(iso).getTime(),
          sub: formatDaySubLabelKuwait(iso, loc),
          count: countByKey.get(key) ?? 0,
        };
      });
    }
    const byKey = new Map<string, { key: string; sort: number; sub: string; count: number }>();
    for (const ev of list) {
      const key = calendarDayKeyKuwait(ev.starts_at);
      const t = new Date(ev.starts_at).getTime();
      const prev = byKey.get(key);
      if (!prev || t < prev.sort) {
        byKey.set(key, {
          key,
          sort: t,
          sub: formatDaySubLabelKuwait(ev.starts_at, loc),
          count: countByKey.get(key) ?? 0,
        });
      }
    }
    return [...byKey.values()].sort((a, b) => a.sort - b.sort);
  });

  readonly filteredEvents = computed(() => {
    let list = this.categoryFilteredEvents();
    const touchesKu = list.some((ev) =>
      isKuWorkshopWeekDayKey(calendarDayKeyKuwait(ev.starts_at)),
    );
    const dk = this.selectedDayKey();
    if (touchesKu) {
      const set = new Set(KU_WORKSHOP_WEEK_DAY_KEYS);
      list = list.filter((ev) => set.has(calendarDayKeyKuwait(ev.starts_at)));
      if (dk) {
        list = list.filter((ev) => calendarDayKeyKuwait(ev.starts_at) === dk);
      }
    } else if (dk) {
      list = list.filter((ev) => calendarDayKeyKuwait(ev.starts_at) === dk);
    }
    return list;
  });

  readonly sortedFilteredEvents = computed(() => {
    const list = [...this.filteredEvents()];
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    const mode = this.workshopSortMode();
    const time = (ev: HomeListEvent) => new Date(ev.starts_at).getTime();
    if (mode === 'title') {
      list.sort((a, b) =>
        this.workshopTitleSortKey(a, loc).localeCompare(this.workshopTitleSortKey(b, loc), loc === 'ar' ? 'ar' : 'en', {
          sensitivity: 'base',
        }),
      );
    } else if (mode === 'latest') {
      list.sort((a, b) => time(b) - time(a));
    } else {
      list.sort((a, b) => time(a) - time(b));
    }
    return list;
  });

  readonly displayedWorkshops = computed(() => {
    const all = this.sortedFilteredEvents();
    return all.slice(0, Math.min(this.visibleCount(), all.length));
  });

  readonly canLoadMore = computed(() => this.sortedFilteredEvents().length > this.visibleCount());
  readonly canLoadLess = computed(() => this.visibleCount() > this.WORKSHOPS_PREVIEW);

  readonly filteredExperts = computed(() => {
    const raw = this.expertSearch().trim();
    if (!raw) {
      return HOME_EXPERTS;
    }
    const lower = raw.toLowerCase();
    return HOME_EXPERTS.filter(
      (e) =>
        e.nameAr.includes(raw) ||
        e.nameEn.toLowerCase().includes(lower) ||
        e.specialtyAr.includes(raw) ||
        e.specialtyEn.toLowerCase().includes(lower),
    );
  });

  readonly displayedExpertTabs = computed(() => {
    const list = this.filteredExperts();
    if (this.showAllExpertTabs() || list.length <= this.EXPERT_SIDEBAR_PREVIEW) {
      return list;
    }
    return list.slice(0, this.EXPERT_SIDEBAR_PREVIEW);
  });

  readonly selectedExpert = computed(() => {
    const id = this.selectedExpertId();
    const list = this.filteredExperts();
    const hit = list.find((e) => e.id === id);
    if (hit) {
      return hit;
    }
    return list[0] ?? HOME_EXPERTS[0];
  });

  /**
   * Workshops belonging to the selected trainer. Matches by parsed instructor
   * name from each event's summary (set by the backend EventSeeder), with
   * Arabic-name normalization so spelling variants resolve correctly.
   */
  readonly expertWorkshopsForSelected = computed(() => {
    const target = normalizePresenterName(this.selectedExpert().nameAr);
    if (!target) return [];
    return this.homeEvents()
      .filter((e) => {
        if (!e.slug.startsWith('ms-w-')) return false;
        const presenter = parsePresenterFromSummaries(
          e.summaryAr,
          e.summary_en,
          e.summary,
          true,
        );
        return normalizePresenterName(presenter) === target;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  });

  readonly features: { iconId: 'cap' | 'book' | 'users' | 'star'; titleKey: TranslationKey; descKey: TranslationKey }[] =
    [
      { iconId: 'cap', titleKey: 'feat1.title', descKey: 'feat1.desc' },
      { iconId: 'book', titleKey: 'feat2.title', descKey: 'feat2.desc' },
      { iconId: 'users', titleKey: 'feat3.title', descKey: 'feat3.desc' },
      { iconId: 'star', titleKey: 'feat4.title', descKey: 'feat4.desc' },
    ];

  readonly featuresDisplayOrder = computed(() =>
    this.i18n.isRtl() ? [...this.features].reverse() : this.features,
  );

  readonly faqItems: { q: TranslationKey; a: TranslationKey }[] = [
    { q: 'faq.q1', a: 'faq.a1' },
    { q: 'faq.q2', a: 'faq.a2' },
    { q: 'faq.q3', a: 'faq.a3' },
    { q: 'faq.q4', a: 'faq.a4' },
  ];

  constructor() {
    this.fetchPage(1);

    this.search$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((q) => {
          if (this.usingDummy()) {
            this.applyDummyFilter(q);
            return EMPTY;
          }
          this.loading.set(true);
          this.error.set(null);
          return this.eventsApi.list(1, { q: q || undefined, perPage: this.EVENTS_HOME_PER_PAGE });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          if (!res || !('data' in res)) {
            return;
          }
          const mapped = res.data.map(volunteerToHome);
          this.homeEvents.set(mapped);
          this.showAllWorkshops.set(false); this.visibleCount.set(this.WORKSHOPS_PREVIEW);
          this.selectedDayKey.set(null);
          this.page.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  categoryLabel(cat: WorkshopFilterCategory): string {
    return this.i18n.t(`cat.${cat}` as TranslationKey);
  }

  /** Ordinal day label aligned with learner dashboard (e.g. اليوم الأول / Day First). */
  dayLabel(dayIndex: number): string {
    const ar = this.i18n.locale() === 'ar';
    const ordinals = ar ? ARABIC_DAY_ORDINALS : ENGLISH_DAY_ORDINALS;
    const ord = ordinals[dayIndex] ?? String(dayIndex + 1);
    return ar ? `اليوم ${ord}` : `Day ${ord}`;
  }

  onWorkshopSortChange(value: string): void {
    if (value === 'closest' || value === 'latest' || value === 'title') {
      this.workshopSortMode.set(value);
    }
  }

  promoCarouselTransform(): string {
    const i = this.promoSlideIndex();
    const pct = (i / this.promoSlideCount) * 100;
    return `translate3d(-${pct}%,0,0)`;
  }

  /** Slide index → workshop category filter (chips below stay in sync). */
  slideIndexToCategory(index: number): WorkshopFilterCategory {
    if (index <= 0) {
      return 'all';
    }
    const pkg = this.categoryPackages[index - 1];
    return pkg?.filterCategory ?? 'all';
  }

  /** Category chip → carousel slide (0 = 100 bundle, 1+ = `categoryPackages` rows). */
  categoryToSlideIndex(cat: WorkshopFilterCategory): number {
    if (cat === 'all') {
      return 0;
    }
    const idx = this.categoryPackages.findIndex((p) => p.filterCategory === cat);
    return idx >= 0 ? idx + 1 : 0;
  }

  /** Move carousel and mirror selection onto category chips (الكل / شخصي / مهني). */
  goToPromoSlide(index: number): void {
    const n = this.promoSlideCount;
    const i = ((index % n) + n) % n;
    const cat = this.slideIndexToCategory(i);
    if (cat !== this.selectedCategory()) {
      this.selectedDayKey.set(null);
      this.showAllWorkshops.set(false);
      this.visibleCount.set(this.WORKSHOPS_PREVIEW);
    }
    this.promoSlideIndex.set(i);
    this.selectedCategory.set(cat);
  }

  prevPromoSlide(): void {
    this.goToPromoSlide(this.promoSlideIndex() - 1);
  }

  nextPromoSlide(): void {
    this.goToPromoSlide(this.promoSlideIndex() + 1);
  }

  onPromoTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      this.promoTouchStartX = null;
      return;
    }
    this.promoTouchStartX = event.touches[0].clientX;
  }

  onPromoTouchEnd(event: TouchEvent): void {
    if (this.promoTouchStartX === null) {
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) {
      this.promoTouchStartX = null;
      return;
    }
    const dx = touch.clientX - this.promoTouchStartX;
    this.promoTouchStartX = null;
    const threshold = 48;
    if (dx < -threshold) {
      this.nextPromoSlide();
    } else if (dx > threshold) {
      this.prevPromoSlide();
    }
  }

  promoDotLabel(index: number): string {
    const n = index + 1;
    return this.i18n.isRtl() ? `الباقة ${n}` : `Package ${n}`;
  }

  workshopTitleSortKey(ev: HomeListEvent, loc: 'ar' | 'en'): string {
    if (loc === 'ar') {
      return (ev.titleAr ?? ev.title ?? '').trim().toLowerCase();
    }
    const en = ev.title_en?.trim();
    return (en && en.length > 0 ? en : ev.title).toLowerCase();
  }

  onPromoCheckout100(): void {
    this.checkoutFlow.startPackage100Checkout(() => this.error.set(this.i18n.t('workshops.packageUnavailable')));
  }

  onCategoryPackageCheckout(slug: string): void {
    this.checkoutFlow.startPackageCheckout(slug, () => this.error.set(this.i18n.t('workshops.packageUnavailable')));
  }

  categoryPackageCopy(pkg: CategoryPackagePromo): CategoryPackagePromo['ar'] {
    return this.i18n.isRtl() ? pkg.ar : pkg.en;
  }

  onExpertSearch(value: string): void {
    this.expertSearch.set(value);
    this.showAllExpertTabs.set(false);
  }

  selectExpert(id: string): void {
    this.selectedExpertId.set(id);
  }

  toggleExpertListExpand(): void {
    this.showAllExpertTabs.update((v) => !v);
  }

  expertName(ex: HomeExpert): string {
    return this.i18n.locale() === 'ar' ? ex.nameAr : ex.nameEn;
  }

  expertSpecialty(ex: HomeExpert): string {
    return this.i18n.locale() === 'ar' ? ex.specialtyAr : ex.specialtyEn;
  }

  expertBio(ex: HomeExpert): string {
    return this.i18n.locale() === 'ar' ? ex.bioAr : ex.bioEn;
  }

  displayWorkshopTitle(ev: HomeListEvent): string {
    if (this.i18n.locale() === 'ar') {
      return ev.titleAr ?? ev.title;
    }
    const en = ev.title_en?.trim();
    return en && en.length > 0 ? en : ev.title;
  }

  workshopLineMeta(ev: HomeListEvent): string {
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    return `${formatCardDateLong(ev.starts_at, loc)} · ${formatTimeKuwait(ev.starts_at, loc)}`;
  }

  addExpertWorkshopToCart(ev: HomeListEvent): void {
    if (ev.id < 0) {
      this.error.set(this.i18n.t('workshops.demoHint'));
      return;
    }
    this.cart.addItem(ev.id, 1).subscribe({
      next: () => this.cart.openDrawer(),
      error: () => this.error.set(this.i18n.t('workshops.loadError')),
    });
  }

  onSelectCategory(cat: WorkshopFilterCategory): void {
    this.showAllWorkshops.set(false);
    this.visibleCount.set(this.WORKSHOPS_PREVIEW);
    this.selectedDayKey.set(null);
    if (this.selectedCategory() === cat) {
      this.selectedCategory.set('all');
      this.promoSlideIndex.set(0);
    } else {
      this.selectedCategory.set(cat);
      this.promoSlideIndex.set(this.categoryToSlideIndex(cat));
    }
  }

  onSelectDay(dayKey: string | null): void {
    this.showAllWorkshops.set(false); this.visibleCount.set(this.WORKSHOPS_PREVIEW);
    if (dayKey === null) {
      this.selectedDayKey.set(null);
      return;
    }
    if (this.selectedDayKey() === dayKey) {
      this.selectedDayKey.set(null);
      return;
    }
    this.selectedDayKey.set(dayKey);
  }

  loadMoreWorkshops(): void {
    const total = this.sortedFilteredEvents().length;
    this.visibleCount.set(Math.min(this.visibleCount() + this.WORKSHOPS_STEP, total));
  }

  loadLessWorkshops(): void {
    const next = Math.max(this.WORKSHOPS_PREVIEW, this.visibleCount() - this.WORKSHOPS_STEP);
    this.visibleCount.set(next);
    requestAnimationFrame(() => {
      this.doc.getElementById('workshops-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  expandWorkshopsGrid(): void {
    this.showAllWorkshops.set(true);
    requestAnimationFrame(() => {
      this.doc.getElementById('workshops-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  collapseWorkshopsGrid(): void {
    this.showAllWorkshops.set(false); this.visibleCount.set(this.WORKSHOPS_PREVIEW);
    requestAnimationFrame(() => {
      this.doc.getElementById('workshops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.update((v) => (v === index ? null : index));
  }

  onSearchChange(value: string): void {
    this.showAllWorkshops.set(false); this.visibleCount.set(this.WORKSHOPS_PREVIEW);
    this.selectedDayKey.set(null);
    if (this.usingDummy()) {
      this.applyDummyFilter(value.trim());
      return;
    }
    this.search$.next(value.trim());
  }

  private applyDummyFilter(q: string): void {
    const base = DUMMY_HOME_EVENTS;
    if (!q) {
      this.homeEvents.set([...base]);
      return;
    }
    const lower = q.toLowerCase();
    this.homeEvents.set(
      base.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          (e.title_en && e.title_en.toLowerCase().includes(lower)) ||
          (e.titleAr && e.titleAr.includes(q)) ||
          (e.summary && e.summary.toLowerCase().includes(lower)) ||
          (e.summary_en && e.summary_en.toLowerCase().includes(lower)) ||
          (e.summaryAr && e.summaryAr.toLowerCase().includes(lower)),
      ),
    );
  }

  onAdd(event: HomeListEvent): void {
    if (event.id < 0) {
      this.demoHint.set(true);
      return;
    }
    this.cart.addItem(event.id, 1).subscribe({
      next: () => this.cart.openDrawer(),
      error: () => this.error.set(this.i18n.t('workshops.loadError')),
    });
  }

  private fetchPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.demoHint.set(false);
    this.eventsApi
      .list(page, { q: this.searchText.trim() || undefined, perPage: this.EVENTS_HOME_PER_PAGE })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map(volunteerToHome);
          this.showAllWorkshops.set(false); this.visibleCount.set(this.WORKSHOPS_PREVIEW);
          this.selectedDayKey.set(null);
          if (mapped.length === 0) {
            this.usingDummy.set(true);
            this.homeEvents.set([...DUMMY_HOME_EVENTS]);
            this.page.set(1);
            this.lastPage.set(1);
          } else {
            this.usingDummy.set(false);
            this.homeEvents.set(mapped);
            this.page.set(res.current_page);
            this.lastPage.set(res.last_page);
          }
          this.loading.set(false);
        },
        error: () => {
          this.usingDummy.set(true);
          this.homeEvents.set([...DUMMY_HOME_EVENTS]);
          this.selectedDayKey.set(null);
          this.page.set(1);
          this.lastPage.set(1);
          this.loading.set(false);
          this.error.set(this.i18n.t('workshops.loadError'));
        },
      });
  }
}
