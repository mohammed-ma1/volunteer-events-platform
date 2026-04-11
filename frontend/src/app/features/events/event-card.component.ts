import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [RouterLink, DecimalPipe, NgClass],
  template: `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/90 bg-white text-start shadow-sm transition duration-300 hover:border-ink-300 hover:shadow-md motion-reduce:transition-none"
    >
      <a
        [routerLink]="['/events', event.slug]"
        class="relative isolate block aspect-[16/10] overflow-hidden bg-ink-100"
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
          class="absolute start-3 top-3 z-10 max-w-[min(100%-1.5rem,11rem)] rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold leading-tight text-[#001A33] shadow-sm ring-1 ring-ink-200/70"
        >
          <span class="line-clamp-2">{{ categoryLabel() }}</span>
        </span>
        <span
          class="absolute bottom-3 left-3 z-10 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#001A33] shadow-sm ring-1 ring-ink-200/70 rtl:left-auto rtl:right-3"
        >
          @if (event.price <= 0) {
            {{ i18n.t('card.free') }}
          } @else {
            {{ event.price | number: '1.0-0' }} {{ priceSuffix() }}
          }
        </span>
      </a>

      <div class="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 pt-3.5">
        <div class="min-h-0 flex-1 space-y-2">
          <a [routerLink]="['/events', event.slug]" class="block min-w-0 focus:outline-none">
            <h3
              class="line-clamp-2 text-[1.05rem] font-bold leading-snug tracking-tight text-[#0a1628] transition-colors group-hover:text-[#001A33] md:text-lg"
            >
              {{ displayTitle() }}
            </h3>
          </a>
          @if (displaySummary()) {
            <p class="line-clamp-3 text-[13px] leading-relaxed text-ink-600">
              {{ displaySummary() }}
            </p>
          }
        </div>

        <div class="space-y-2.5 border-t border-ink-100 pt-3 text-[13px] leading-snug text-ink-700">
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
          class="flex min-h-[3rem] flex-nowrap gap-2.5 pt-0.5"
          [class.flex-row-reverse]="i18n.isRtl()"
        >
          <button
            type="button"
            class="ve-focus-ring flex min-h-[3rem] min-w-0 flex-1 basis-0 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-2 py-2.5 text-center text-xs font-semibold text-[#001A33] transition hover:bg-ink-50 sm:text-[11px]"
            [ngClass]="
              cart.lastAddedEventId() === event.id
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 motion-safe:animate-ve-added-pop'
                : ''
            "
            (click)="add.emit(event)"
          >
            @if (cart.lastAddedEventId() === event.id) {
              <svg class="h-4 w-4 shrink-0 motion-safe:animate-ve-added-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span class="whitespace-normal">{{ i18n.t('card.added') }}</span>
            } @else {
              <svg class="h-4 w-4 shrink-0 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span class="whitespace-normal">{{ i18n.t('card.addCart') }}</span>
            }
          </button>
          <button
            type="button"
            class="ve-focus-ring flex min-h-[3rem] min-w-0 flex-1 basis-0 items-center justify-center gap-2 rounded-xl bg-[#001A33] px-2 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#002a4d] sm:text-[13px]"
            (click)="buyNow()"
          >
            <svg class="h-4 w-4 shrink-0 opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span class="whitespace-normal">{{ i18n.t('card.buyNow') }}</span>
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

  displaySummary(): string | null {
    if (this.i18n.locale() === 'ar') {
      return this.event.summaryAr ?? this.event.summary;
    }
    const en = this.event.summary_en?.trim();
    if (en && en.length > 0) {
      return en;
    }
    return this.event.summary;
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
}
