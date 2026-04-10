import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HomeListEvent } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { CartService } from '../../core/services/cart.service';
import type { TranslationKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, NgClass],
  template: `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-3xl border-0 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07),0_4px_24px_-8px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.14)] motion-reduce:hover:translate-y-0"
    >
      <a
        [routerLink]="['/events', event.slug]"
        class="relative isolate block aspect-[16/10] overflow-hidden bg-ink-200"
      >
        @if (event.image_url) {
          <img
            [src]="event.image_url"
            [alt]="displayTitle()"
            loading="lazy"
            class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        }
        <!-- Readability scrim: no colored stroke around the card image -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          aria-hidden="true"
        ></div>
        <span
          class="absolute start-3 top-3 max-w-[min(100%-1.5rem,12rem)] truncate rounded-md bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-[2px]"
        >
          {{ categoryLabel() }}
        </span>
        <span
          class="absolute bottom-3 end-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-900 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.25)]"
        >
          @if (event.price <= 0) {
            {{ i18n.t('card.free') }}
          } @else {
            {{ event.price | number: '1.0-0' }} {{ priceSuffix() }}
          }
        </span>
      </a>

      <div class="flex flex-1 flex-col gap-4 px-5 pb-5 pt-5">
        <div class="min-h-0 flex-1">
          <a [routerLink]="['/events', event.slug]" class="block focus:outline-none">
            <h3
              class="text-lg font-bold leading-snug tracking-tight text-brand-900 transition-colors group-hover:text-brand-800"
            >
              {{ displayTitle() }}
            </h3>
          </a>
          @if (displaySummary()) {
            <p class="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
              {{ displaySummary() }}
            </p>
          }
        </div>

        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-100 pt-4 text-xs text-ink-500"
        >
          <span class="inline-flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 shrink-0 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ event.starts_at | date: 'mediumDate' }}
          </span>
          @if (displayLocation()) {
            <span class="hidden h-1 w-1 rounded-full bg-ink-300 sm:inline" aria-hidden="true"></span>
            <span class="inline-flex min-w-0 items-center gap-1.5">
              <svg class="h-3.5 w-3.5 shrink-0 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span class="truncate">{{ displayLocation() }}</span>
            </span>
          }
        </div>

        <!-- Primary first (same visual priority in LTR + RTL); secondary = soft fill, no outline -->
        <div class="flex flex-col gap-2">
          <button
            type="button"
            class="ve-focus-ring w-full rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            (click)="buyNow()"
          >
            <span class="inline-flex items-center justify-center gap-2">
              <svg class="h-4 w-4 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              {{ i18n.t('card.buyNow') }}
            </span>
          </button>
          <button
            type="button"
            class="ve-focus-ring relative w-full overflow-hidden rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out"
            [ngClass]="
              cart.lastAddedEventId() === event.id
                ? 'bg-emerald-600 text-white shadow-md motion-safe:animate-ve-added-pop hover:bg-emerald-700'
                : 'bg-ink-100 text-brand-900 hover:bg-ink-200'
            "
            (click)="add.emit(event)"
          >
            <span class="inline-flex items-center justify-center gap-2">
              @if (cart.lastAddedEventId() === event.id) {
                <svg class="h-4 w-4 shrink-0 motion-safe:animate-ve-added-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {{ i18n.t('card.added') }}
              } @else {
                <svg class="h-4 w-4 shrink-0 text-ink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {{ i18n.t('card.addCart') }}
              }
            </span>
          </button>
        </div>
      </div>
    </article>
  `,
})
export class EventCardComponent {
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly cart = inject(CartService);

  @Input({ required: true }) event!: HomeListEvent;
  @Output() add = new EventEmitter<HomeListEvent>();

  displayTitle(): string {
    return this.i18n.locale() === 'ar' && this.event.titleAr ? this.event.titleAr : this.event.title;
  }

  displaySummary(): string | null {
    if (this.i18n.locale() === 'ar' && this.event.summaryAr) {
      return this.event.summaryAr;
    }
    return this.event.summary;
  }

  displayLocation(): string | null {
    if (this.i18n.locale() === 'ar' && this.event.locationAr) {
      return this.event.locationAr;
    }
    return this.event.location;
  }

  categoryLabel(): string {
    const key = `cat.${this.event.category}` as TranslationKey;
    return this.i18n.t(key);
  }

  priceSuffix(): string {
    const c = this.event.currency?.toUpperCase();
    if (c === 'KWD') {
      return 'K.D.';
    }
    return this.event.currency;
  }

  buyNow(): void {
    void this.router.navigate(['/events', this.event.slug]);
  }
}
