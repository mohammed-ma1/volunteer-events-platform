import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { DUMMY_HOME_EVENTS, HomeListEvent, volunteerToHome, WorkshopCategory } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { EventCardComponent } from './event-card.component';

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
  imports: [FormsModule, NgClass, RouterLink, EventCardComponent],
  template: `
    <section
      class="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white via-brand-50/25 to-white px-5 py-10 shadow-sm ring-1 ring-ink-200/60 md:px-10 md:py-12"
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
            class="motion-safe:animate-ve-fade-up flex flex-wrap gap-3 motion-safe:[animation-delay:180ms]"
          >
            <a
              href="#workshops"
              class="ve-focus-ring group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <span
                class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-500 group-hover:translate-x-full motion-reduce:group-hover:translate-x-0"
                aria-hidden="true"
              ></span>
              <span class="relative">{{ i18n.t('hero.ctaBrowse') }}</span>
            </a>
            <a
              routerLink="/career"
              class="ve-focus-ring inline-flex items-center justify-center rounded-xl bg-ink-100/90 px-5 py-3 text-sm font-semibold text-brand-900 transition duration-300 hover:bg-ink-200/90 active:scale-[0.98]"
            >
              {{ i18n.t('hero.ctaPaths') }}
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
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
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

    <section class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      @for (f of features; track f.titleKey; let fi = $index) {
        <div
          class="motion-safe:animate-ve-fade-up group flex flex-col items-center rounded-2xl bg-white px-5 py-7 text-center shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-6px_rgba(15,23,42,0.1)] motion-reduce:hover:translate-y-0"
          [style.animation-delay.ms]="fi * 85"
        >
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 text-brand-900 transition duration-300 group-hover:scale-105 group-hover:bg-ink-200/90 motion-reduce:group-hover:scale-100"
            [innerHTML]="f.icon"
          ></div>
          <h2 class="text-sm font-bold text-brand-900">{{ i18n.t(f.titleKey) }}</h2>
          <p class="mt-2 text-xs leading-relaxed text-ink-500 md:text-sm">{{ i18n.t(f.descKey) }}</p>
        </div>
      }
    </section>

    <section id="workshops" class="mt-16 scroll-mt-24">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="motion-safe:animate-ve-fade-up">
          <h2 class="text-2xl font-extrabold tracking-tight text-brand-900 md:text-3xl">
            {{ i18n.t('workshops.title') }}
          </h2>
          <p class="mt-1 max-w-xl text-sm text-ink-600 md:text-base">{{ i18n.t('workshops.subtitle') }}</p>
        </div>
        <a
          href="#workshops-grid"
          class="motion-safe:animate-ve-fade-up group inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition hover:gap-2.5 hover:text-brand-900"
        >
          @if (i18n.isRtl()) {
            <span
              class="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
              >←</span
            >
          } @else {
            <span
              class="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
              >→</span
            >
          }
          {{ i18n.t('workshops.viewAll') }}
        </a>
      </div>

      <div
        class="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
      >
        <div
          class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-w-0 lg:flex-1"
        >
          @for (cat of CATEGORY_ORDER; track cat) {
            <button
              type="button"
              (click)="selectedCategory.set(cat)"
              class="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100"
              [ngClass]="
                selectedCategory() === cat
                  ? 'bg-brand-900 text-white shadow-md hover:bg-brand-800'
                  : 'bg-ink-100 text-ink-800 hover:bg-ink-200'
              "
            >
              {{ categoryLabel(cat) }}
            </button>
          }
        </div>

        <label
          class="flex w-full shrink-0 items-center gap-2.5 rounded-2xl bg-ink-100/70 px-3.5 py-2.5 shadow-inner transition focus-within:bg-white focus-within:shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)] focus-within:ring-2 focus-within:ring-ink-900/10 lg:max-w-xs"
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
            class="min-w-0 flex-1 bg-transparent text-sm text-brand-900 outline-none placeholder:text-ink-400"
            [placeholder]="i18n.t('workshops.searchPlaceholder')"
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
          />
        </label>
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

      <div id="workshops-grid" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (event of filteredEvents(); track event.id; let ei = $index) {
          <div
            class="motion-safe:animate-ve-fade-up h-full motion-reduce:opacity-100"
            [style.animation-delay.ms]="ei * 45"
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

      @if (!loading() && lastPage() > 1 && page() < lastPage() && !usingDummy()) {
        <div class="mt-10 flex justify-center">
          <button
            type="button"
            class="ve-focus-ring rounded-full bg-ink-100 px-6 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-ink-200"
            (click)="loadMore()"
          >
            {{ i18n.t('workshops.loadMore') }}
          </button>
        </div>
      }
    </section>

    <section class="mt-20">
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
  readonly cart = inject(CartService);

  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  readonly CATEGORY_ORDER = CATEGORY_ORDER;

  readonly selectedCategory = signal<WorkshopCategory>('all');
  readonly homeEvents = signal<HomeListEvent[]>([]);
  readonly usingDummy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly demoHint = signal(false);
  readonly page = signal(1);
  readonly lastPage = signal(1);

  searchText = '';
  openFaqIndex = signal<number | null>(null);

  readonly filteredEvents = computed(() => {
    const cat = this.selectedCategory();
    return this.homeEvents().filter((ev) => cat === 'all' || ev.category === cat);
  });

  readonly features: { icon: string; titleKey: TranslationKey; descKey: TranslationKey }[] = [
    {
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
      titleKey: 'feat1.title',
      descKey: 'feat1.desc',
    },
    {
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
      titleKey: 'feat2.title',
      descKey: 'feat2.desc',
    },
    {
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      titleKey: 'feat3.title',
      descKey: 'feat3.desc',
    },
    {
      icon: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
      titleKey: 'feat4.title',
      descKey: 'feat4.desc',
    },
  ];

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

  toggleFaq(index: number): void {
    this.openFaqIndex.update((v) => (v === index ? null : index));
  }

  onSearchChange(value: string): void {
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
          (e.titleAr && e.titleAr.includes(q)) ||
          (e.summary && e.summary.toLowerCase().includes(lower)) ||
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
          this.page.set(1);
          this.lastPage.set(1);
          this.loading.set(false);
          this.error.set(this.i18n.t('workshops.loadError'));
        },
      });
  }
}
