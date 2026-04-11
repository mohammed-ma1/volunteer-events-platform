import { DOCUMENT, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { PROMO_HERO_IMAGE_URL } from '../../core/constants/promo-hero';
import { HOME_EXPERTS, HomeExpert } from '../../core/data/home-experts';
import { CheckoutFlowService } from '../../core/services/checkout-flow.service';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { DUMMY_HOME_EVENTS, HomeListEvent, volunteerToHome, WorkshopCategory } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { EventCardComponent } from './event-card.component';
import { formatCardDateLong, formatTimeKuwait } from './event-card-meta';
import { calendarDayKeyKuwait, formatDaySubLabelKuwait } from './workshop-day-filters';

const CATEGORY_ORDER: WorkshopCategory[] = [
  'all',
  'leadership',
  'digital',
  'ai',
  'personal',
  'cv',
  'career',
];

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
        class="pointer-events-none absolute -start-32 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-brand-400/25 to-sky-400/10 blur-3xl motion-safe:animate-ve-blob"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -end-24 bottom-0 h-56 w-56 rounded-full bg-gradient-to-tl from-brand-500/15 to-transparent blur-3xl motion-safe:animate-ve-blob motion-safe:[animation-delay:-9s]"
        aria-hidden="true"
      ></div>

      <div class="relative grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
        <div class="space-y-5">
          <span
            class="motion-safe:animate-ve-fade-up inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm ring-1 ring-ink-200/80 backdrop-blur-sm"
          >
            <span class="relative flex h-2 w-2" aria-hidden="true">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-40 motion-reduce:animate-none"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
            </span>
            {{ i18n.t('hero.badge') }}
          </span>
          <h1
            class="motion-safe:animate-ve-fade-up text-3xl font-extrabold leading-[1.2] tracking-tight text-brand-900 motion-safe:[animation-delay:60ms] md:text-4xl lg:text-[2.45rem]"
          >
            {{ i18n.t('hero.title1') }}
            <span class="ve-hero-accent block pt-1 sm:inline sm:pt-0">{{ i18n.t('hero.title2') }}</span>
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
              class="ve-focus-ring motion-safe:animate-ve-cta-ring group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500 group-hover:translate-x-full motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              ></span>
              <span class="relative">{{ i18n.t('hero.ctaBrowse') }}</span>
            </a>
            <a
              routerLink="/"
              fragment="trainers"
              class="ve-focus-ring inline-flex items-center justify-center rounded-xl bg-ink-100/90 px-5 py-3 text-sm font-semibold text-brand-900 transition duration-300 hover:bg-ink-200/90 active:scale-[0.98]"
            >
              {{ i18n.t('hero.ctaFacilitators') }}
            </a>
          </div>
        </div>

        <div
          class="motion-safe:animate-ve-fade-up group relative overflow-hidden rounded-2xl shadow-xl motion-safe:[animation-delay:100ms]"
        >
          <div
            class="absolute inset-0 z-10 bg-gradient-to-t from-brand-900/20 via-transparent to-brand-500/5 opacity-0 transition duration-500 group-hover:opacity-100 motion-reduce:opacity-0"
            aria-hidden="true"
          ></div>
          <img
            [src]="heroVisualUrl"
            [alt]="i18n.t('hero.imageAlt')"
            class="aspect-[4/3] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 md:aspect-[5/4]"
            width="800"
            height="640"
            fetchpriority="high"
          />
          <div
            class="motion-safe:animate-ve-float absolute bottom-4 start-4 max-w-[260px] rounded-xl border border-white/60 bg-white/95 p-3 shadow-lg backdrop-blur-md md:bottom-6 md:start-6 md:p-4"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg drop-shadow-sm" aria-hidden="true">🏅</span>
              <p class="text-sm font-bold text-brand-900">{{ i18n.t('hero.stat') }}</p>
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
              class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#EBF5FF] text-[#001A33] transition duration-300 group-hover:scale-[1.06] group-hover:bg-[#dfeefc] motion-reduce:group-hover:scale-100"
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
            <h2 class="text-sm font-bold text-[#001A33] md:text-[0.95rem]">{{ i18n.t(f.titleKey) }}</h2>
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
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div class="motion-safe:animate-ve-fade-up min-w-0 flex-1">
          <h2 class="text-2xl font-extrabold tracking-tight text-[#001A33] md:text-3xl">
            {{ i18n.t('workshops.title') }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
            {{ i18n.t('workshops.subtitle') }}
          </p>
        </div>
        <label
          class="motion-safe:animate-ve-fade-up flex w-full shrink-0 items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#001A33]/25 focus-within:ring-2 focus-within:ring-[#001A33]/10 lg:mt-1 lg:max-w-[min(100%,22rem)]"
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
            class="min-w-0 flex-1 bg-transparent text-sm text-[#001A33] outline-none placeholder:text-ink-400"
            [placeholder]="i18n.t('workshops.searchPlaceholder')"
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
          />
        </label>
      </div>

      <div
        class="motion-safe:animate-ve-fade-up mt-8 overflow-hidden rounded-3xl bg-[#1a1f2e] text-white shadow-[0_16px_48px_-16px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
      >
        <div class="flex flex-col-reverse md:flex-row md:items-stretch" dir="ltr">
          <div
            class="relative min-h-[14rem] w-full shrink-0 overflow-hidden md:min-h-[20rem] md:w-[min(44%,26rem)]"
          >
            <img
              [src]="heroVisualUrl"
              alt=""
              class="h-full min-h-[14rem] w-full object-cover md:min-h-[20rem]"
              loading="lazy"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              aria-hidden="true"
            ></div>
            <div
              class="absolute inset-x-0 bottom-0 flex items-end gap-3 px-4 pb-4 pt-10 md:gap-4 md:px-5 md:pb-5 md:pt-14"
              dir="ltr"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/95 text-lg shadow-md ring-1 ring-black/5 md:h-12 md:w-12"
                aria-hidden="true"
              >
                🤝
              </div>
              <div
                class="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-white drop-shadow-md sm:gap-2"
                [class.items-end]="!i18n.isRtl()"
                [class.items-start]="i18n.isRtl()"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
                [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
              >
                <div class="flex max-w-full flex-nowrap items-center justify-start gap-2.5">
                  <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{
                    i18n.t('workshops.promoTrainerLine')
                  }}</span>
                  <span class="shrink-0 text-base leading-none" aria-hidden="true">👤</span>
                </div>
                <div class="flex max-w-full flex-nowrap items-center justify-start gap-2.5">
                  <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{
                    i18n.t('workshops.promoVenueLine')
                  }}</span>
                  <span class="shrink-0 text-base leading-none" aria-hidden="true">📍</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-1 flex-col justify-center gap-4 p-6 md:gap-5 md:p-9 lg:p-11"
            [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
            [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
          >
            <span
              class="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90"
            >
              <span class="h-2 w-2 shrink-0 rounded-full bg-[#00c853]" aria-hidden="true"></span>
              {{ i18n.t('workshops.promoLimitedBadge') }}
            </span>
            <h3 class="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-3xl lg:text-[1.85rem]">
              {{ i18n.t('workshops.promoTitle') }}
            </h3>
            <p class="max-w-xl text-sm leading-relaxed text-white/65 md:text-[0.95rem]">
              {{ i18n.t('workshops.promoBody') }}
            </p>
            <div class="flex flex-wrap items-end gap-x-4 gap-y-2">
              <span class="text-4xl font-black tracking-tight text-[#4da6ff] md:text-[2.65rem]">{{
                i18n.t('workshops.promoPrice')
              }}</span>
              <div class="flex flex-col items-start gap-1.5">
                <span class="text-base font-medium text-white/40 line-through md:text-lg">{{
                  i18n.t('workshops.promoPriceWas')
                }}</span>
                <span
                  class="inline-flex rounded-md bg-[#00c853] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                  >{{ i18n.t('workshops.promoSavePct') }}</span
                >
              </div>
            </div>
            <div
              class="max-w-xl rounded-xl border border-fuchsia-500/45 bg-white/[0.04] p-4 shadow-[0_0_24px_rgba(168,85,247,0.12)] md:p-4"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <p class="text-sm leading-relaxed text-white/85">
                  {{ i18n.t('workshops.promoInstallmentPrefix') }}
                  <span class="font-bold text-[#e6007e]">{{ i18n.t('workshops.promoInstallmentAmount') }}</span>
                </p>
                <span
                  class="inline-flex w-fit shrink-0 rounded-full bg-violet-950/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-violet-100 ring-1 ring-violet-400/30"
                  >{{ i18n.t('workshops.promoInterestFree') }}</span
                >
              </div>
            </div>
            <button
              type="button"
              class="ve-focus-ring inline-flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-[#0b0f18] px-6 py-4 text-center text-sm font-bold text-white shadow-lg ring-1 ring-white/10 transition hover:bg-black md:py-4"
              [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              (click)="onPromoCheckout()"
            >
              <svg class="h-5 w-5 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      @if (workshopDayBuckets().length > 1) {
        <div
          class="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          [attr.aria-label]="i18n.t('workshops.filterDaysAria')"
        >
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="selectedDayKey() === null"
            (click)="onSelectDay(null)"
            class="shrink-0 rounded-2xl px-4 py-2.5 text-center transition duration-200"
            [ngClass]="
              selectedDayKey() === null
                ? 'bg-[#001A33] text-white shadow-md'
                : 'border border-ink-200 bg-white text-[#001A33] hover:bg-white'
            "
          >
            <span class="block text-sm font-bold">{{ i18n.t('workshops.allDates') }}</span>
          </button>
          @for (b of workshopDayBuckets(); track b.key; let di = $index) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="selectedDayKey() === b.key"
              (click)="onSelectDay(b.key)"
              class="shrink-0 rounded-2xl px-4 py-2.5 text-center transition duration-200"
              [ngClass]="
                selectedDayKey() === b.key
                  ? 'bg-[#001A33] text-white shadow-md'
                  : 'border border-ink-200 bg-white text-[#001A33] hover:bg-white'
              "
            >
              <span class="block text-sm font-bold">{{ i18n.t('workshops.dayWord') }} {{ di + 1 }}</span>
              <span
                class="mt-0.5 block text-xs font-medium"
                [ngClass]="selectedDayKey() === b.key ? 'text-white/85' : 'text-ink-500'"
                >{{ b.sub }}</span
              >
            </button>
          }
        </div>
      }

      <div
        class="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (cat of CATEGORY_ORDER; track cat) {
          <button
            type="button"
            (click)="onSelectCategory(cat)"
            class="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 hover:opacity-95 active:scale-[0.98] motion-reduce:active:scale-100"
            [ngClass]="
              selectedCategory() === cat
                ? 'bg-[#001A33] text-white shadow-md'
                : 'border border-ink-200 bg-white text-[#001A33] hover:bg-white'
            "
          >
            {{ categoryLabel(cat) }}
          </button>
        }
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

      <div id="workshops-grid" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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

      @if (!loading() && !filteredEvents().length) {
        <p class="mt-8 text-center text-sm text-ink-500">{{ i18n.t('workshops.empty') }}</p>
      }

      @if (!loading() && filteredEvents().length > WORKSHOPS_PREVIEW) {
        <button
          type="button"
          class="ve-focus-ring mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3.5 text-sm font-bold text-[#001A33] shadow-sm transition hover:bg-ink-50"
          (click)="showAllWorkshops() ? collapseWorkshopsGrid() : expandWorkshopsGrid()"
        >
          <span>{{ showAllWorkshops() ? i18n.t('workshops.showLess') : i18n.t('workshops.showMore') }}</span>
          <span class="text-ink-500" aria-hidden="true">{{ showAllWorkshops() ? '▲' : '▼' }}</span>
        </button>
      }

      @if (!loading() && lastPage() > 1 && page() < lastPage() && !usingDummy()) {
        <button
          type="button"
          class="ve-focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200/80 bg-ink-100/80 py-3 text-sm font-semibold text-[#001A33] transition hover:bg-ink-200/90"
          (click)="loadMore()"
        >
          {{ i18n.t('workshops.loadMore') }}
        </button>
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
            class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-sky-100/90"
          >
            <span aria-hidden="true">🌟</span>
            {{ i18n.t('experts.badge') }}
          </span>
          <h2 class="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-[#001A33] md:text-[1.75rem]">
            {{ i18n.t('experts.titleBefore') }}
            <span class="text-brand-600">{{ i18n.t('experts.titleHighlight') }}</span>
            {{ i18n.t('experts.titleAfter') }}
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
            {{ i18n.t('experts.subtitle') }}
          </p>
        </div>

        <div class="mt-10 grid gap-8 lg:grid-cols-[minmax(240px,28%)_minmax(0,1fr)] lg:items-start">
          <aside class="flex flex-col gap-4">
            <label
              class="flex items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:ring-2 focus-within:ring-[#001A33]/10"
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
                class="min-w-0 flex-1 bg-transparent text-sm text-[#001A33] outline-none placeholder:text-ink-400"
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
                  class="w-full rounded-2xl px-4 py-3 text-start text-sm font-semibold transition duration-200"
                  [ngClass]="
                    selectedExpertId() === ex.id
                      ? 'bg-[#001A33] text-white shadow-md'
                      : 'border border-ink-200 bg-white text-[#001A33] hover:bg-white'
                  "
                >
                  {{ expertName(ex) }}
                </button>
              }
            </div>
            @if (filteredExperts().length > EXPERT_SIDEBAR_PREVIEW) {
              <button
                type="button"
                class="ve-focus-ring flex w-full items-center justify-center gap-1 rounded-2xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-[#001A33] transition hover:bg-ink-50"
                (click)="toggleExpertListExpand()"
              >
                {{ showAllExpertTabs() ? i18n.t('experts.showLess') : i18n.t('experts.showMore') }}
                <span class="text-ink-500" aria-hidden="true">{{ showAllExpertTabs() ? '⌃' : '⌵' }}</span>
              </button>
            }
          </aside>

          <div class="min-w-0 space-y-8">
            <article
              class="overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(0,26,51,0.12)]"
            >
              <div class="grid md:grid-cols-2">
                <div class="relative min-h-[15rem] bg-ink-100 md:min-h-[19rem]">
                  <img
                    [src]="selectedExpert().imageUrl"
                    [alt]="expertName(selectedExpert())"
                    class="h-full min-h-[15rem] w-full object-cover md:absolute md:inset-0 md:min-h-full"
                    loading="lazy"
                  />
                </div>
                <div class="flex flex-col justify-center p-6 md:p-8">
                  <h3 class="text-xl font-extrabold text-[#001A33] md:text-2xl">{{ expertName(selectedExpert()) }}</h3>
                  <p class="mt-1 text-sm font-medium text-ink-500">{{ expertSpecialty(selectedExpert()) }}</p>
                  <p class="mt-4 text-sm leading-relaxed text-ink-600">{{ expertBio(selectedExpert()) }}</p>
                  <p class="mt-6 text-xs font-bold uppercase tracking-wide text-ink-400">
                    {{ i18n.t('experts.connect') }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-3">
                    @for (s of selectedExpert().socials; track s.href) {
                      <a
                        [href]="s.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="ve-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-ink-50 text-ink-600 transition hover:border-brand-200 hover:bg-white hover:text-[#001A33]"
                        [attr.aria-label]="i18n.t(s.aria)"
                      >
                        @switch (s.kind) {
                          @case ('mail') {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          }
                          @case ('linkedin') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5H12v2.1h.06c.48-.9 1.66-1.85 3.42-1.85 3.66 0 4.34 2.4 4.34 5.52V24h-4v-6.84c0-1.63-.03-3.73-2.27-3.73-2.27 0-2.62 1.78-2.62 3.6V24h-4V8.5z"
                              />
                            </svg>
                          }
                          @case ('x') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          }
                        }
                      </a>
                    }
                  </div>
                </div>
              </div>
            </article>

            <div>
              <h3 class="text-lg font-extrabold text-[#001A33]">{{ i18n.t('experts.workshopsHeading') }}</h3>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                @for (ev of expertWorkshopsForSelected(); track ev.slug) {
                  <a
                    [routerLink]="['/events', ev.slug]"
                    class="group flex gap-3 rounded-xl border border-ink-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
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
                    <div class="min-w-0 text-start">
                      <p class="text-sm font-bold leading-snug text-[#0a1628] group-hover:text-[#001A33]">
                        {{ displayWorkshopTitle(ev) }}
                      </p>
                      <p class="mt-1 text-xs text-ink-500">{{ workshopLineMeta(ev) }}</p>
                    </div>
                  </a>
                }
              </div>
            </div>

            <a
              routerLink="/facilitator-workshops"
              class="ve-focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#001A33] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002a4d] md:w-auto"
            >
              {{ i18n.t('trainers.ctaBrowse') }}
              @if (i18n.isRtl()) {
                <span class="text-base leading-none opacity-95" aria-hidden="true">←</span>
              } @else {
                <span class="text-base leading-none opacity-95" aria-hidden="true">→</span>
              }
            </a>
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

  /** Initial grid size before "عرض جميع الورش". */
  readonly WORKSHOPS_PREVIEW = 8;

  readonly EXPERT_SIDEBAR_PREVIEW = 5;

  /** Hero visual (LeadConnector-optimized WebP, user-provided). */
  readonly heroVisualUrl = PROMO_HERO_IMAGE_URL;

  readonly expertSearch = signal('');
  readonly selectedExpertId = signal(HOME_EXPERTS[0].id);
  readonly showAllExpertTabs = signal(false);

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly CATEGORY_ORDER = CATEGORY_ORDER;

  readonly selectedCategory = signal<WorkshopCategory>('all');
  /** Calendar day key (Kuwait) or null = all days. */
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

  readonly categoryFilteredEvents = computed(() => {
    const cat = this.selectedCategory();
    return this.homeEvents().filter((ev) => cat === 'all' || ev.category === cat);
  });

  readonly workshopDayBuckets = computed(() => {
    const list = this.categoryFilteredEvents();
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    const byKey = new Map<string, { key: string; sort: number; sub: string }>();
    for (const ev of list) {
      const key = calendarDayKeyKuwait(ev.starts_at);
      const t = new Date(ev.starts_at).getTime();
      const prev = byKey.get(key);
      if (!prev || t < prev.sort) {
        byKey.set(key, { key, sort: t, sub: formatDaySubLabelKuwait(ev.starts_at, loc) });
      }
    }
    return [...byKey.values()].sort((a, b) => a.sort - b.sort);
  });

  readonly filteredEvents = computed(() => {
    let list = this.categoryFilteredEvents();
    const dk = this.selectedDayKey();
    if (dk) {
      list = list.filter((ev) => calendarDayKeyKuwait(ev.starts_at) === dk);
    }
    return list;
  });

  readonly displayedWorkshops = computed(() => {
    const all = this.filteredEvents();
    if (this.showAllWorkshops() || all.length <= this.WORKSHOPS_PREVIEW) {
      return all;
    }
    return all.slice(0, this.WORKSHOPS_PREVIEW);
  });

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

  readonly expertWorkshopsForSelected = computed(() => {
    const slugs = new Set(this.selectedExpert().workshopSlugs);
    const fromHome = this.homeEvents().filter((e) => slugs.has(e.slug));
    if (fromHome.length > 0) {
      return fromHome;
    }
    return DUMMY_HOME_EVENTS.filter((e) => slugs.has(e.slug));
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
    this.fetchPage(1, true);

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
          return this.eventsApi.list(1, { q: q || undefined, perPage: 24 });
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
          this.showAllWorkshops.set(false);
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

  categoryLabel(cat: WorkshopCategory): string {
    return this.i18n.t(`cat.${cat}` as TranslationKey);
  }

  onPromoCheckout(): void {
    this.checkoutFlow.startPackage100Checkout(() => this.error.set(this.i18n.t('workshops.packageUnavailable')));
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

  onSelectCategory(cat: WorkshopCategory): void {
    this.showAllWorkshops.set(false);
    this.selectedDayKey.set(null);
    this.selectedCategory.set(cat);
  }

  onSelectDay(dayKey: string | null): void {
    this.showAllWorkshops.set(false);
    this.selectedDayKey.set(dayKey);
  }

  expandWorkshopsGrid(): void {
    this.showAllWorkshops.set(true);
    requestAnimationFrame(() => {
      this.doc.getElementById('workshops-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  collapseWorkshopsGrid(): void {
    this.showAllWorkshops.set(false);
    requestAnimationFrame(() => {
      this.doc.getElementById('workshops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.update((v) => (v === index ? null : index));
  }

  onSearchChange(value: string): void {
    this.showAllWorkshops.set(false);
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

  loadMore(): void {
    if (this.page() >= this.lastPage() || this.loading() || this.usingDummy()) {
      return;
    }
    this.fetchPage(this.page() + 1, false);
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

  private fetchPage(target: number, replace: boolean): void {
    this.loading.set(true);
    this.error.set(null);
    this.demoHint.set(false);
    this.eventsApi
      .list(target, { q: this.searchText.trim() || undefined, perPage: 24 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map(volunteerToHome);
          if (replace) {
            this.showAllWorkshops.set(false);
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
          } else {
            this.homeEvents.update((cur) => [...cur, ...mapped]);
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
