import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { HomeListEvent, workshopCategoryToFilterGroup } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { CartService } from '../../core/services/cart.service';
import { CheckoutFlowService } from '../../core/services/checkout-flow.service';
import type { TranslationKey } from '../../core/i18n/translations';
import {
  formatCardDateLong,
  formatTimeKuwait,
  parsePresenterFromSummaries,
} from './event-card-meta';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [DecimalPipe, NgClass],
  template: `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/90 bg-white text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.15)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div
        class="relative isolate block overflow-hidden bg-ink-100"
        [ngClass]="large ? 'aspect-[3/2]' : 'aspect-[16/10]'"
      >
        @if (event.image_url) {
          <img
            [src]="event.image_url"
            [alt]="displayTitle()"
            loading="lazy"
            class="relative z-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
          />
        }
        <div
          class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/35 via-black/5 to-transparent"
          aria-hidden="true"
        ></div>
        <span
          class="absolute start-3 top-3 z-10 max-w-[min(100%-1.5rem,11rem)] rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold leading-tight text-brand-900 shadow-sm ring-1 ring-ink-200/70"
        >
          <span class="line-clamp-2">{{ categoryLabel() }}</span>
        </span>
        <span
          class="absolute bottom-3 start-3 z-10 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-900 shadow-sm ring-1 ring-ink-200/70"
        >
          @if (event.price <= 0) {
            {{ i18n.t('card.free') }}
          } @else {
            {{ event.price | number: '1.0-0' }} {{ priceSuffix() }}
          }
        </span>
      </div>

      <div
        class="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-4 pt-3.5 sm:px-4"
        [ngClass]="large ? 'sm:px-5 sm:pb-5 sm:pt-4' : 'lg:px-3 xl:px-4'"
      >
        <div class="min-h-0 flex-1 space-y-2">
          <div class="block min-w-0">
            <h3
              class="line-clamp-2 font-bold leading-snug tracking-tight text-[#0a1628] transition-colors group-hover:text-brand-900"
              [ngClass]="large ? 'text-base sm:text-lg md:text-xl' : 'text-[1.05rem] md:text-lg'"
            >
              {{ displayTitle() }}
            </h3>
          </div>
          @if (displayDescription()) {
            <p
              class="line-clamp-3 leading-relaxed text-ink-600"
              [ngClass]="large ? 'text-sm sm:text-[0.95rem]' : 'text-[13px]'"
              [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              [attr.lang]="i18n.locale()"
            >
              {{ displayDescription() }}
            </p>
          }
        </div>

        <div
          class="space-y-2.5 border-t border-ink-100 pt-3 leading-snug text-ink-700"
          [ngClass]="large ? 'text-sm' : 'text-[13px]'"
        >
          @if (presenterLine()) {
            <div class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span class="min-w-0 break-words font-medium text-ink-800">{{ presenterLine() }}</span>
            </div>
          }
          <div class="flex items-start gap-2.5">
            <svg
              class="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
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
            <span class="min-w-0 break-words">{{ cardDateLong() }}</span>
          </div>
          <div class="flex items-start gap-2.5">
            <svg
              class="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="min-w-0 break-words">{{ timeKuwait() }}</span>
          </div>
          @if (displayLocation()) {
            <div class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-ink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span class="min-w-0 break-words">{{ displayLocation() }}</span>
            </div>
          }
        </div>

        <div
          class="flex min-w-0 flex-nowrap items-stretch gap-2 pt-1 sm:gap-2.5 lg:gap-1.5 xl:gap-2"
          [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
        >
          <button
            type="button"
            class="ve-focus-ring flex min-h-[2.75rem] min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-full bg-brand-900 px-2 py-2 text-center text-[11px] font-semibold leading-tight text-white shadow-md shadow-brand-900/25 transition hover:bg-brand-800 active:bg-brand-950 sm:min-h-[3rem] sm:gap-2 sm:rounded-full sm:px-3 sm:py-2.5 sm:text-sm lg:min-h-0 lg:gap-1 lg:rounded-full lg:px-1.5 lg:py-[5px] lg:text-[9px] lg:shadow-md xl:px-2 xl:py-1.5 xl:text-[10px] 2xl:gap-1.5 2xl:px-2.5 2xl:py-1.5 2xl:text-[11px]"
            (click)="buyNow()"
          >
            <svg
              class="h-4 w-4 shrink-0 text-white sm:h-[18px] sm:w-[18px] lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 2xl:h-3.5 2xl:w-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
            <span class="min-w-0 flex-1 text-balance break-words hyphens-auto">{{
              i18n.t('card.buyNow')
            }}</span>
          </button>
          <button
            type="button"
            class="ve-focus-ring flex min-h-[2.75rem] min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-white px-2 py-2 text-center text-[11px] font-semibold leading-tight text-brand-900 shadow-sm transition hover:border-ink-300 hover:bg-ink-50 active:bg-ink-100 sm:min-h-[3rem] sm:gap-2 sm:rounded-full sm:px-3 sm:py-2.5 sm:text-sm lg:min-h-0 lg:gap-1 lg:rounded-full lg:border lg:px-1.5 lg:py-[5px] lg:text-[9px] xl:px-2 xl:py-1.5 xl:text-[10px] 2xl:gap-1.5 2xl:px-2.5 2xl:py-1.5 2xl:text-[11px]"
            [ngClass]="
              cart.lastAddedEventId() === event.id
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900 motion-safe:animate-ve-added-pop'
                : ''
            "
            (click)="add.emit(event)"
          >
            @if (cart.lastAddedEventId() === event.id) {
              <ng-container>
                <svg
                  class="h-4 w-4 shrink-0 motion-safe:animate-ve-added-check sm:h-[18px] sm:w-[18px] lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 2xl:h-3.5 2xl:w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span class="min-w-0 flex-1 text-balance break-words hyphens-auto">{{
                  i18n.t('card.added')
                }}</span>
              </ng-container>
            } @else {
              <ng-container>
                <svg
                  class="h-4 w-4 shrink-0 text-brand-900 sm:h-[18px] sm:w-[18px] lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 2xl:h-3.5 2xl:w-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3H15.75m-12.75-3h11.218c1.121-2.541 3.947-7.287 3.947-7.287M3 3h15.75M9 9h.008v.008H9V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0h.008v.008h-.008V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span class="min-w-0 flex-1 text-balance break-words hyphens-auto">{{
                  i18n.t('card.addCart')
                }}</span>
              </ng-container>
            }
          </button>
        </div>
      </div>
    </article>
  `,
})
export class EventCardComponent {
  private readonly checkoutFlow = inject(CheckoutFlowService);
  readonly i18n = inject(I18nService);
  readonly cart = inject(CartService);

  @Input({ required: true }) event!: HomeListEvent;
  /** Taller image + larger type (e.g. home page workshop grid). */
  @Input() large = false;
  @Output() add = new EventEmitter<HomeListEvent>();

  private cardLocale(): 'ar' | 'en' {
    return this.i18n.locale() === 'ar' ? 'ar' : 'en';
  }

  cardDateLong(): string {
    return formatCardDateLong(this.event.starts_at, this.cardLocale());
  }

  timeKuwait(): string {
    return formatTimeKuwait(this.event.starts_at, this.cardLocale());
  }

  presenterLine(): string | null {
    return parsePresenterFromSummaries(
      this.event.summaryAr,
      this.event.summary_en,
      this.event.summary,
      this.i18n.locale() === 'ar',
    );
  }

  displayTitle(): string {
    if (this.i18n.locale() === 'ar') {
      return this.event.titleAr ?? this.event.title;
    }
    const en = this.event.title_en?.trim();
    return en && en.length > 0 ? en : this.event.title;
  }

  /** One language per UI locale: Arabic UI → Arabic only; English UI → English only. */
  displayDescription(): string | null {
    return this.i18n.locale() === 'ar' ? this.arabicDescription() : this.englishDescription();
  }

  arabicDescription(): string | null {
    const direct = this.cleanDescription(this.event.description);
    const summaryAr = this.cleanDescription(this.event.summaryAr ?? this.event.summary);

    if (direct && this.looksArabic(direct)) {
      return direct;
    }
    if (summaryAr && this.looksArabic(summaryAr)) {
      return summaryAr;
    }
    return direct ?? summaryAr;
  }

  englishDescription(): string | null {
    const enDesc = this.cleanDescription(this.event.description_en);
    const enSummary = this.cleanDescription(this.event.summary_en);
    const direct = this.cleanDescription(this.event.description);
    const fallback = this.cleanDescription(this.event.summary);

    let line: string | null = enDesc;
    if (!line) {
      line = enSummary;
    }
    if (!line && direct && this.looksEnglish(direct)) {
      line = direct;
    }
    if (!line && fallback && this.looksEnglish(fallback)) {
      line = fallback;
    }

    return line;
  }

  displayLocation(): string | null {
    if (this.i18n.locale() === 'ar') {
      return this.event.locationAr ?? this.event.location;
    }
    const en = this.event.location_en?.trim();
    if (en && en.length > 0) {
      return en;
    }
    return this.event.location;
  }

  categoryLabel(): string {
    const group = workshopCategoryToFilterGroup(this.event.category);
    const key = `cat.${group}` as TranslationKey;
    return this.i18n.t(key);
  }

  priceSuffix(): string {
    const c = this.event.currency?.toUpperCase();
    if (c === 'KWD') {
      return this.i18n.t('card.currencyKwd');
    }
    return this.event.currency;
  }

  buyNow(): void {
    this.checkoutFlow.startEventCheckout(this.event.id, this.event.slug);
  }

  private cleanDescription(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }
    let trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^facilitator:\s*.+·/i.test(trimmed) || /^مقدم الورشة:\s*.+·/.test(trimmed)) {
      return null;
    }
    // Strip the "[personal]" / "[professional]" tag the seeder writes into summary fields.
    trimmed = trimmed.replace(/^\[(personal|professional)\]\s*/i, '');
    // Also drop the boilerplate "ورشة X يقدمها Y." / "X workshop led by Y." summary lines —
    // these are tags, not real descriptions.
    if (/^ورشة .+ يقدمها .+\.?$/.test(trimmed) || /^.+ workshop led by .+\.?$/i.test(trimmed)) {
      return null;
    }
    return trimmed;
  }

  private looksArabic(value: string): boolean {
    return /[\u0600-\u06FF]/.test(value);
  }

  private looksEnglish(value: string): boolean {
    return /[A-Za-z]/.test(value);
  }

}
