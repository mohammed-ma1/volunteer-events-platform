import { DecimalPipe, DOCUMENT, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  KU_WORKSHOP_WEEK_DAY_KEYS,
  isKuWorkshopWeekDayKey,
  kuWorkshopWeekNoonIso,
} from '../../core/constants/ku-workshop-week';
import { ALL_PACKAGE_SLUGS } from '../../core/constants/package-offer';
import { CATEGORY_PACKAGES, CategoryPackagePromo } from '../../core/constants/category-packages-promo';
import {
  HOME_EXPERTS,
  HomeExpert,
  applyExpertAvatarOverrides,
  filterExpertsByActive,
  getExpertInitials,
  normalizePresenterName,
} from '../../core/data/home-experts';
import { CheckoutFlowService } from '../../core/services/checkout-flow.service';
import { ExpertsService } from '../../core/services/experts.service';
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
import {
  calendarDayKeyKuwait,
  formatDaySubLabelKuwait,
} from './workshop-day-filters';

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
  imports: [FormsModule, NgClass, DecimalPipe, RouterLink, EventCardComponent, ScrollRevealDirective],
  template: `
    <section
      veScrollReveal
      class="ve-scroll-reveal ve-hero-grid-bg ve-full-bleed relative isolate -mt-6 overflow-hidden px-5 pb-24 pt-14 md:-mt-8 md:px-10 md:pb-28 md:pt-20"
    >
      <!-- Animated SVG backdrop. Dot lattice drifts via patternTransform;
           decorative ring outlines echo the comp's hand-placed shapes.
           Purely decorative (aria-hidden + pointer-events-none). -->
      <svg
        class="ve-hero-svg-bg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <!-- Primary lattice — soft, almost invisible. Drifts +x +y over 14s -->
          <pattern id="veHeroDotsPrimary" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="0.95" fill="rgba(196,162,93,0.22)" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to="22 22"
              dur="14s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </pattern>
          <!-- Secondary half-step lattice — even softer; opposing drift -->
          <pattern id="veHeroDotsSecondary" width="14" height="14" patternUnits="userSpaceOnUse" x="7" y="7">
            <circle cx="7" cy="7" r="0.65" fill="rgba(196,162,93,0.12)" />
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to="-14 -14"
              dur="22s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </pattern>
          <!-- Cream glow biased to the start side -->
          <radialGradient id="veHeroGlow" cx="8%" cy="55%" r="55%">
            <stop offset="0%" stop-color="rgba(245,210,140,0.18)" />
            <stop offset="100%" stop-color="rgba(245,210,140,0)" />
          </radialGradient>
          <!-- Mirrored cool glow on the end side for balance -->
          <radialGradient id="veHeroGlowEnd" cx="92%" cy="35%" r="45%">
            <stop offset="0%" stop-color="rgba(106,90,205,0.10)" />
            <stop offset="100%" stop-color="rgba(106,90,205,0)" />
          </radialGradient>
          <!-- Reusable 4-point sparkle (★ shape) -->
          <symbol id="veHeroSparkle" viewBox="-10 -10 20 20" overflow="visible">
            <path
              d="M 0,-10 Q 1.4,-1.4 10,0 Q 1.4,1.4 0,10 Q -1.4,1.4 -10,0 Q -1.4,-1.4 0,-10 Z"
              fill="currentColor"
            />
          </symbol>
        </defs>

        <rect width="100%" height="100%" fill="url(#veHeroDotsPrimary)" />
        <rect width="100%" height="100%" fill="url(#veHeroDotsSecondary)" />
        <rect width="100%" height="100%" fill="url(#veHeroGlow)" />
        <rect width="100%" height="100%" fill="url(#veHeroGlowEnd)" />

        <!-- Decorative shapes (positioned by % so they hug the viewport edges).
             Mix of ring outlines, sparkles and a hand-drawn wave for variety. -->

        <!-- Top-start: gentle hand-drawn wave that pans across over 18s -->
        <path
          d="M -50,90 Q 80,60 200,95 T 450,95 T 700,95"
          fill="none"
          stroke="rgba(212,154,42,0.22)"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-dasharray="6 8"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-56"
            dur="18s"
            repeatCount="indefinite"
            data-ve-anim
          />
        </path>

        <!-- Top-end: small pulsing ring outline -->
        <g>
          <circle
            cx="96%"
            cy="16%"
            r="6"
            fill="none"
            stroke="rgba(212,154,42,0.55)"
            stroke-width="1.4"
          >
            <animate
              attributeName="r"
              values="5;8;5"
              dur="4.2s"
              repeatCount="indefinite"
              data-ve-anim
            />
            <animate
              attributeName="opacity"
              values="0.55;1;0.55"
              dur="4.2s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </circle>
        </g>

        <!-- Top-end: gold 4-point sparkle that twinkles + slowly rotates -->
        <g style="color: rgba(212,154,42,0.7); transform-origin: 90% 28%; transform-box: fill-box;">
          <use href="#veHeroSparkle" x="89%" y="27%" width="14" height="14">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.8s"
              repeatCount="indefinite"
              data-ve-anim
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="22s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </use>
        </g>

        <!-- Mid-end: floating white card with subtle border -->
        <g>
          <rect
            x="93.5%"
            y="48%"
            width="20"
            height="20"
            rx="4"
            fill="#ffffff"
            stroke="rgba(15,23,42,0.10)"
            stroke-width="1"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -6; 0 0"
              dur="5.2s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </rect>
        </g>

        <!-- Mid-start: small indigo "+" mark (decorative) -->
        <g stroke="rgba(46,42,123,0.4)" stroke-width="1.6" stroke-linecap="round">
          <line x1="3.4%" y1="44%" x2="4.6%" y2="44%">
            <animate attributeName="opacity" values="0.3;0.85;0.3" dur="3.6s" repeatCount="indefinite" data-ve-anim />
          </line>
          <line x1="4%" y1="43.1%" x2="4%" y2="44.9%">
            <animate attributeName="opacity" values="0.3;0.85;0.3" dur="3.6s" repeatCount="indefinite" data-ve-anim />
          </line>
        </g>

        <!-- Start-side bottom: larger ring outline -->
        <circle
          cx="6%"
          cy="78%"
          r="14"
          fill="none"
          stroke="rgba(46,42,123,0.30)"
          stroke-width="1.4"
        >
          <animate
            attributeName="opacity"
            values="0.45;0.9;0.45"
            dur="3.4s"
            repeatCount="indefinite"
            data-ve-anim
          />
        </circle>

        <!-- Start-side: tiny gold dot just below the ring -->
        <circle cx="9%" cy="92%" r="2.4" fill="rgba(212,154,42,0.65)">
          <animate
            attributeName="opacity"
            values="0.4;0.95;0.4"
            dur="2.6s"
            begin="0.6s"
            repeatCount="indefinite"
            data-ve-anim
          />
        </circle>

        <!-- End-side bottom: gold sparkle -->
        <g style="color: rgba(212,154,42,0.6);">
          <use href="#veHeroSparkle" x="91%" y="80%" width="11" height="11">
            <animate
              attributeName="opacity"
              values="0.25;0.9;0.25"
              dur="3.2s"
              begin="1.1s"
              repeatCount="indefinite"
              data-ve-anim
            />
          </use>
        </g>

        <!-- End-side bottom: tiny indigo dot -->
        <circle cx="95%" cy="86%" r="2" fill="rgba(46,42,123,0.45)">
          <animate
            attributeName="opacity"
            values="0.3;0.85;0.3"
            dur="2.9s"
            begin="0.4s"
            repeatCount="indefinite"
            data-ve-anim
          />
        </circle>
      </svg>

      <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <!-- Top badge — gold-trimmed pill with an animated star + live dot -->
        <span
          class="ve-hero-badge motion-safe:animate-ve-fade-up inline-flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-brand-900 shadow-[0_8px_24px_-12px_rgba(212,154,42,0.55)] backdrop-blur-sm md:text-sm"
        >
          <svg
            class="h-3.5 w-3.5 shrink-0 text-gold-500 motion-safe:animate-ve-spin-slow"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span>{{ i18n.t('hero.badge') }}</span>
          <span class="relative flex h-2 w-2" aria-hidden="true">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-50 motion-reduce:animate-none"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
          </span>
        </span>

        <!-- Main headline -->
        <h1
          class="ve-hero-headline motion-safe:animate-ve-fade-up mt-8 text-balance text-4xl font-extrabold leading-[1.16] tracking-[-0.01em] motion-safe:[animation-delay:60ms] sm:text-5xl md:mt-9 md:text-[3.4rem] lg:text-[3.75rem]"
        >
          <span class="block text-[#1e293b]">{{ i18n.t('hero.title1') }}</span>
          <span class="mt-3 block md:mt-4">
            <span class="ve-hero-highlight">{{ i18n.t('hero.title2') }}</span>
          </span>
        </h1>

        <!-- "في …" decorative subline. All rotating phrases are stacked in
             a single grid cell so the wrap's intrinsic width = widest word.
             That keeps "في" pinned while only the rotating word reflows.
             The active sibling fades in via .ve-hero-rotate-active;
             inactive siblings still occupy the cell, reserving space. -->
        <div
          class="motion-safe:animate-ve-fade-up mt-8 flex items-baseline justify-center gap-5 motion-safe:[animation-delay:100ms] md:mt-10 md:gap-8"
        >
          <span class="text-3xl font-extrabold text-[#1e293b] md:text-5xl">{{
            i18n.t('hero.expertisePrefix')
          }}</span>
          <span
            class="ve-hero-rotate-wrap text-[3.4rem] leading-none md:text-[5rem] lg:text-[5.75rem]"
            aria-live="polite"
            [attr.aria-label]="heroRotateWord()"
          >
            @for (w of heroRotatingWords(); track w; let i = $index) {
              <span
                class="ve-hero-script ve-hero-rotate-slot"
                [class.ve-hero-rotate-active]="i === heroRotateActive()"
                [attr.aria-hidden]="i === heroRotateActive() ? null : 'true'"
                >{{ w }}</span
              >
            }
          </span>
        </div>

        <!-- Body copy -->
        <p
          class="motion-safe:animate-ve-fade-up mt-9 max-w-2xl text-base leading-relaxed text-ink-600 motion-safe:[animation-delay:140ms] md:mt-10 md:text-lg"
        >
          {{ i18n.t('hero.body') }}
        </p>

        <!-- CTA buttons -->
        <div
          class="motion-safe:animate-ve-fade-up mt-8 flex flex-col items-center justify-center gap-3 motion-safe:[animation-delay:180ms] sm:flex-row sm:gap-4 md:mt-9"
        >
          <a
            routerLink="/"
            fragment="workshops"
            class="ve-btn-primary ve-btn-primary--lg ve-hero-cta-primary motion-safe:animate-ve-cta-ring group relative overflow-hidden transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500 group-hover:translate-x-full motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            ></span>
            <span class="relative inline-flex items-center gap-2">
              <span>{{ i18n.t('hero.ctaBrowse') }}</span>
              <svg
                class="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </a>
          <a
            routerLink="/"
            fragment="trainers"
            class="ve-btn-secondary group px-6 py-3.5 text-base font-bold transition duration-300 hover:scale-[1.01] active:scale-[0.98]"
          >
            <span class="inline-flex items-center gap-2">
              <span>{{ i18n.t('hero.ctaFacilitators') }}</span>
              <svg
                class="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </a>
        </div>

        <!-- Discover-more cue: bouncing chevron + thin pulse line. Anchors
             the eye toward the workshops section below the fold. -->
        <a
          routerLink="/"
          fragment="workshops"
          class="ve-hero-discover motion-safe:animate-ve-fade-up mt-10 inline-flex flex-col items-center gap-2 text-xs font-medium tracking-wide text-ink-500 transition hover:text-brand-900 motion-safe:[animation-delay:240ms] md:mt-12"
        >
          <span class="ve-hero-discover-rail" aria-hidden="true"></span>
          <svg
            class="h-5 w-5 motion-safe:animate-ve-bounce-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>

    <section veScrollReveal class="ve-scroll-reveal mt-8 bg-white py-2 md:mt-10">
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
      class="ve-scroll-reveal mt-16 scroll-mt-24 rounded-3xl bg-[#f4f6f9] px-4 py-10 shadow-inner ring-1 ring-ink-200/60 max-md:py-12 md:mt-20 md:px-8 md:py-10"
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

      <!-- Featured offer: 100-workshop bundle (single card, no carousel) -->
      <div
        class="motion-safe:animate-ve-fade-up mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1020] via-[#121a33] to-[#0b1020] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
        [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
        [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
      >
        <div
          class="flex flex-col justify-center gap-6 px-5 py-8 sm:px-8 lg:grid lg:min-h-[17rem] lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10 lg:py-10"
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
            <div
              class="flex flex-wrap items-end gap-x-4 gap-y-2 max-md:justify-center md:justify-start"
            >
              <span class="text-4xl font-black tracking-tight text-amber-300 md:text-[2.65rem]">{{
                i18n.t('workshops.promoPrice')
              }}</span>
              <span class="text-base font-medium text-white/35 line-through md:text-lg">{{
                i18n.t('workshops.promoPriceWas')
              }}</span>
            </div>
            <div class="max-w-xl rounded-2xl border border-fuchsia-400/45 bg-[#1a1428]/95 p-4 shadow-inner md:p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p class="text-base leading-relaxed text-white max-md:text-center md:text-start">
                  <span>{{ i18n.t('workshops.promoInstallmentPrefix') }}</span>
                  <span class="mt-1 block text-2xl font-extrabold text-pink-400 md:mt-0 md:inline">{{
                    i18n.t('workshops.promoInstallmentAmount')
                  }}</span>
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
      </div>

      <!-- Filters: 4 controls on one row (search + category + days + sort).
           In RTL the visual order reads right→left as: search, category, days, sort.
           Each control uses the same rounded-full pill style + chevron so the
           bar reads as one cohesive group. -->
      <div
        class="motion-safe:animate-ve-fade-up mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3 md:mt-5 md:gap-4"
      >
        <!-- Search (flex-1 so it grows to fill remaining space) -->
        <label
          class="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-brand-900/25 focus-within:ring-2 focus-within:ring-brand-900/10 sm:gap-2.5 sm:px-4 sm:order-1"
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

        <!-- Category dropdown -->
        <div class="relative min-h-[2.75rem] w-full shrink-0 sm:order-2 sm:w-auto sm:min-w-[12rem]">
          <svg
            class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <select
            class="h-full min-h-[2.75rem] w-full cursor-pointer appearance-none rounded-full border border-ink-200 bg-white py-2.5 ps-9 pe-9 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10"
            [ngModel]="selectedCategory()"
            (ngModelChange)="onSelectCategory($event)"
            [attr.aria-label]="i18n.t('workshops.filterCategoryAria')"
          >
            @for (cat of CATEGORY_ORDER; track cat) {
              <option [value]="cat">{{ categoryLabel(cat) }} ({{ categoryCounts()[cat] }})</option>
            }
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

        <!-- Days dropdown -->
        @if (workshopDayBuckets().length > 0) {
          <div class="relative min-h-[2.75rem] w-full shrink-0 sm:order-3 sm:w-auto sm:min-w-[12rem]">
            <svg
              class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <select
              class="h-full min-h-[2.75rem] w-full cursor-pointer appearance-none rounded-full border border-ink-200 bg-white py-2.5 ps-9 pe-9 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10"
              [ngModel]="selectedDayKey() ?? '__all__'"
              (ngModelChange)="onSelectDay($event === '__all__' ? null : $event)"
              [attr.aria-label]="i18n.t('workshops.filterDaysAria')"
            >
              <option value="__all__">{{ i18n.t('workshops.allDaysShort') }} ({{ categoryFilteredEvents().length }})</option>
              @for (b of workshopDayBuckets(); track b.key; let di = $index) {
                <option [value]="b.key">{{ dayLabelWithCount(di, b.count) }} · {{ b.sub }}</option>
              }
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
        }

        <!-- Sort dropdown -->
        <div class="relative min-h-[2.75rem] w-full shrink-0 sm:order-4 sm:w-auto sm:min-w-[10rem]">
          <svg
            class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          <select
            class="h-full min-h-[2.75rem] w-full cursor-pointer appearance-none rounded-full border border-ink-200 bg-white py-2.5 ps-9 pe-9 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10"
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
        <div class="mt-8 flex flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @if (canLoadMore()) {
            <button
              type="button"
              class="ve-btn-secondary inline-flex shrink-0 items-center gap-2 px-6 sm:px-8"
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
              class="ve-btn-secondary inline-flex shrink-0 items-center gap-2 px-6 sm:px-8"
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
      class="ve-scroll-reveal mt-16 scroll-mt-24 overflow-x-hidden rounded-3xl bg-[#f7f8fb] px-4 py-10 ring-1 ring-ink-200/50 max-md:px-4 md:mt-20 md:px-8 md:py-14"
    >
      <div class="mx-auto min-w-0 max-w-6xl">
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

        <div
          class="mt-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(240px,28%)_minmax(0,1fr)] lg:items-start"
        >
          <aside class="flex min-w-0 w-full max-w-full flex-col gap-4">
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
            <div
              class="flex w-full min-w-0 max-w-full flex-row items-stretch gap-2 pe-1 max-md:min-h-[3.25rem] md:flex-col md:gap-2"
            >
              <div
                class="flex min-w-0 flex-1 gap-2 pe-0 max-md:flex-row max-md:flex-nowrap max-md:gap-2 max-md:overflow-x-auto max-md:overflow-y-visible max-md:overscroll-x-contain max-md:pb-0 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:max-h-[min(28rem,55vh)] md:flex-col md:overflow-y-auto md:overflow-x-visible md:pe-1 md:pb-2"
              >
                @for (ex of displayedExpertTabs(); track ex.id) {
                  <button
                    type="button"
                    (click)="selectExpert(ex.id)"
                    class="rounded-full text-start font-semibold transition duration-200 max-md:max-w-[11.5rem] max-md:shrink-0 max-md:truncate max-md:px-4 max-md:py-2.5 max-md:text-xs max-md:leading-snug md:w-full md:max-w-none md:whitespace-normal md:px-5 md:py-3.5 md:text-base md:leading-snug"
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
                  class="ve-btn-secondary inline-flex w-auto max-w-[7rem] shrink-0 items-center justify-center gap-1.5 self-center px-3.5 py-2 text-xs leading-snug md:max-w-none md:w-full md:gap-2 md:px-6 md:py-3.5 md:text-sm"
                  (click)="toggleExpertListExpand()"
                >
                  <span class="max-md:truncate">{{ showAllExpertTabs() ? i18n.t('experts.showLess') : i18n.t('experts.showMore') }}</span>
                  @if (showAllExpertTabs()) {
                    <svg class="h-3.5 w-3.5 shrink-0 text-brand-900 max-md:h-3 max-md:w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  } @else {
                    <svg class="h-3.5 w-3.5 shrink-0 text-brand-900 max-md:h-3 max-md:w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  }
                </button>
              }
            </div>
          </aside>

          <div class="min-w-0 w-full max-w-full space-y-8">
            <article
              class="w-full max-w-full overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(0,26,51,0.12)]"
            >
              <!-- Mobile: compact row (avatar + copy). md+: two-column hero image. -->
              <div
                class="max-w-full max-md:flex max-md:flex-row max-md:items-start max-md:gap-3 max-md:p-3 md:grid md:grid-cols-2 md:gap-0 md:p-0"
              >
                <div
                  class="relative shrink-0 overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100 max-md:h-20 max-md:w-20 md:min-h-[19rem] md:rounded-none md:ring-0"
                >
                  @if (selectedExpert().imageUrl) {
                    <img
                      [src]="selectedExpert().imageUrl"
                      [alt]="expertName(selectedExpert())"
                      class="h-full w-full max-md:object-cover max-md:object-top md:absolute md:inset-0 md:min-h-full md:object-contain md:object-center"
                      loading="lazy"
                    />
                  } @else {
                    <div
                      class="flex h-full min-h-[5rem] w-full items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-violet-800 text-white md:absolute md:inset-0 md:min-h-full"
                      role="img"
                      [attr.aria-label]="expertName(selectedExpert())"
                    >
                      <span
                        class="font-extrabold tracking-tight max-md:text-xl md:text-5xl md:leading-none"
                        dir="ltr"
                        >{{ expertInitials(selectedExpert()) }}</span>
                    </div>
                  }
                </div>
                <div class="flex min-w-0 flex-1 flex-col justify-center md:p-8 max-md:p-0 max-md:pt-0.5">
                  <h3 class="break-words text-lg font-extrabold leading-snug text-brand-900 max-md:text-base md:text-2xl">
                    {{ expertName(selectedExpert()) }}
                  </h3>
                  <p class="mt-1 text-xs font-medium text-ink-500 md:text-sm">{{ expertSpecialty(selectedExpert()) }}</p>
                  <p class="mt-3 break-words text-sm leading-relaxed text-ink-600 max-md:mt-2 md:mt-4">
                    {{ expertBio(selectedExpert()) }}
                  </p>
                </div>
              </div>
            </article>

            <div>
              <h3 class="text-lg font-extrabold text-brand-900">
                {{ i18n.t('experts.workshopsHeading') }}
                <span class="text-brand-700">({{ expertWorkshopsForSelected().length }})</span>
              </h3>
              <div class="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                @for (ev of expertWorkshopsForSelected(); track ev.slug) {
                  <article
                    class="group relative flex min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                  >
                    <div class="flex items-start gap-3">
                      @if (ev.image_url) {
                        <img
                          [src]="ev.image_url"
                          alt=""
                          loading="lazy"
                          class="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-ink-100"
                        />
                      } @else {
                        <div
                          class="h-16 w-16 shrink-0 rounded-xl bg-ink-100 ring-1 ring-ink-100"
                          aria-hidden="true"
                        ></div>
                      }
                      <div class="min-w-0 flex-1 text-start">
                        <h4 class="line-clamp-2 break-words text-sm font-bold leading-snug text-[#0a1628] md:text-[15px]">
                          {{ displayWorkshopTitle(ev) }}
                        </h4>
                        <p class="mt-1.5 inline-flex items-center gap-1.5 text-xs text-ink-500">
                          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span class="truncate">{{ workshopLineMeta(ev) }}</span>
                        </p>
                      </div>
                    </div>

                    @if (workshopDescription(ev); as desc) {
                      <p class="mt-3 line-clamp-2 break-words text-xs leading-relaxed text-ink-600 md:text-[13px]">
                        {{ desc }}
                      </p>
                    } @else {
                      <p class="mt-3 line-clamp-2 break-words text-xs italic leading-relaxed text-ink-400">
                        {{ i18n.t('experts.workshopDescriptionFallback') }}
                      </p>
                    }

                    <div class="mt-auto flex items-center justify-between gap-3 border-t border-ink-100 pt-3">
                      <div class="flex items-baseline gap-1.5 leading-none">
                        @if (ev.price <= 0) {
                          <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            {{ i18n.t('card.free') }}
                          </span>
                        } @else {
                          <span class="text-lg font-extrabold text-brand-900">{{ ev.price | number: '1.0-0' }}</span>
                          <span class="text-xs font-semibold text-ink-500">{{ i18n.t('card.currencyKwd') }}</span>
                        }
                      </div>
                      <button
                        type="button"
                        class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 active:scale-[0.97]"
                        (click)="addExpertWorkshopToCart(ev)"
                      >
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        {{ i18n.t('card.addCart') }}
                      </button>
                    </div>
                  </article>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ section intentionally hidden from the home page; the dedicated
         /faq route still renders these items if you want to surface them
         elsewhere. The faqItems[] and toggleFaq()/openFaqIndex() class
         members are kept in case the section is restored later. -->
  `,
})
export class EventsHomeComponent implements OnDestroy {
  readonly i18n = inject(I18nService);
  private readonly eventsApi = inject(EventsService);
  private readonly expertsApi = inject(ExpertsService);
  private readonly doc = inject(DOCUMENT);
  private readonly checkoutFlow = inject(CheckoutFlowService);
  readonly cart = inject(CartService);

  /**
   * Static `HOME_EXPERTS` enriched with admin-portal-managed avatars AND
   * filtered to only the names that exist as active rows in the API
   * (lazy-fetched from `/v1/experts`). When the API hasn't responded yet we
   * keep the full static list so the page never goes blank — admin
   * deletions only take effect once the live data lands.
   */
  readonly homeExperts = computed<HomeExpert[]>(() => {
    const enriched = applyExpertAvatarOverrides(HOME_EXPERTS, this.expertsApi.avatarOverrides());
    return filterExpertsByActive(enriched, this.expertsApi.activeNamesSet());
  });

  /** Initial grid size + step for load-more / load-less. */
  readonly WORKSHOPS_PREVIEW = 4;
  readonly WORKSHOPS_STEP = 4;
  /** Number of workshops currently visible (incremental, ramps up by WORKSHOPS_STEP). */
  readonly visibleCount = signal<number>(this.WORKSHOPS_PREVIEW);

  /** Load full workshop list in one request (backend caps per_page; must cover all seeded events). */
  private readonly EVENTS_HOME_PER_PAGE = 200;

  readonly EXPERT_SIDEBAR_PREVIEW = 13;

  readonly categoryPackages = CATEGORY_PACKAGES;

  /**
   * Hero — rotating calligraphic word that cycles every ~2.2s through the
   * five "في …" labels (your skills / future / expertise / opportunities /
   * abilities). Index advances on a `setInterval`; the word itself is
   * derived from `i18n.locale()` + this index. SSR-safe (no timer).
   */
  private static readonly HERO_ROTATING_WORDS: Record<'ar' | 'en', readonly string[]> = {
    ar: ['مهاراتك', 'مستقبلك', 'خبراتك', 'فرصك', 'قدراتك'],
    en: ['your skills', 'your future', 'your expertise', 'your opportunities', 'your abilities'],
  };

  readonly heroRotateIndex = signal(0);
  readonly heroRotatingWords = computed<readonly string[]>(
    () => EventsHomeComponent.HERO_ROTATING_WORDS[this.i18n.locale()],
  );
  readonly heroRotateWord = computed(() => {
    const list = this.heroRotatingWords();
    return list[this.heroRotateIndex() % list.length];
  });
  /** Active index normalised against the current word list length. */
  readonly heroRotateActive = computed(
    () => this.heroRotateIndex() % this.heroRotatingWords().length,
  );

  private heroRotateTimer: ReturnType<typeof setInterval> | undefined;

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
    const all = this.homeExperts();
    const raw = this.expertSearch().trim();
    if (!raw) {
      return all;
    }
    const lower = raw.toLowerCase();
    return all.filter(
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
    return list[0] ?? this.homeExperts()[0];
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
        if (ALL_PACKAGE_SLUGS.includes(e.slug)) return false;
        const parsed = parsePresenterFromSummaries(
          e.summaryAr,
          e.summary_en,
          e.summary,
          true,
        );
        const presenter = parsed || e.host_name || '';
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
    // Lazy-load admin-portal-managed experts so their avatars/bios merge into
    // the static `HOME_EXPERTS` list at runtime.
    this.expertsApi.ensureLoaded();

    // Cycle the hero calligraphic word every 1.8s — fast enough to feel
    // alive but still readable. Animation duration (~0.42s) leaves ~1.4s
    // of "rest" on each word. Skipped on SSR (no window) so it doesn't
    // keep the Node process alive during prerender.
    if (typeof window !== 'undefined') {
      this.heroRotateTimer = setInterval(() => {
        this.heroRotateIndex.update((i) => i + 1);
      }, 1800);
    }

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
    if (this.heroRotateTimer) {
      clearInterval(this.heroRotateTimer);
      this.heroRotateTimer = undefined;
    }
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

  /** Chip title line, e.g. "اليوم الأول (20)" / "Day First (20)". */
  dayLabelWithCount(dayIndex: number, count: number): string {
    return `${this.dayLabel(dayIndex)} (${count})`;
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

  expertInitials(ex: HomeExpert): string {
    return getExpertInitials(ex);
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

  /** Locale-preferred workshop description, falls back to the other locale or summary. */
  workshopDescription(ev: HomeListEvent): string | null {
    const ar = ev.description?.trim() || (ev as { summaryAr?: string }).summaryAr?.trim();
    const en = ev.description_en?.trim() || ev.summary_en?.trim();
    const summaryFallback = ev.summary?.trim();
    const preferred = this.i18n.locale() === 'ar' ? ar || en : en || ar;
    const value = preferred || summaryFallback;
    if (!value) return null;
    // Strip the leading "[category] " tag the seeder injects into summary fallbacks.
    return value.replace(/^\[[^\]]+\]\s*/, '');
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
