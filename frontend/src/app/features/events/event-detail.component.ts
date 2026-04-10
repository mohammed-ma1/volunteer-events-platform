import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getDummyBySlug, HomeListEvent, volunteerToHome } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { VolunteerEvent } from '../../core/models/api.types';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    @if (error()) {
      <p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ error() }}
      </p>
    } @else {
      @if (event(); as ev) {
      <a routerLink="/" class="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900">
        @if (i18n.isRtl()) {
          <span aria-hidden="true">→</span>
        } @else {
          <span aria-hidden="true">←</span>
        }
        {{ i18n.t('detail.back') }}
      </a>

      <div class="mt-6 grid gap-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div class="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
          @if (ev.image_url) {
            <img
              [src]="ev.image_url"
              [alt]="title(ev)"
              class="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
          }
        </div>

        <div>
          @if (ev.is_featured) {
            <span
              class="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100"
              >{{ i18n.t('detail.featured') }}</span
            >
          }
          <h1 class="mt-3 text-3xl font-bold text-brand-900 md:text-4xl">{{ title(ev) }}</h1>
          <div class="mt-4 flex flex-wrap gap-2 text-xs text-ink-600">
            <span class="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5">{{
              ev.starts_at | date: 'fullDate'
            }}</span>
            @if (location(ev)) {
              <span class="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5">{{ location(ev) }}</span>
            }
          </div>
          <p class="mt-6 text-base leading-relaxed text-ink-600">
            {{ body(ev) }}
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-ink-500">{{ i18n.t('detail.registration') }}</p>
              <p class="text-2xl font-bold text-brand-900">
                @if (ev.price <= 0) {
                  {{ i18n.t('card.free') }}
                } @else {
                  {{ ev.price | number: '1.2-3' }}
                  <span class="text-base font-semibold text-ink-600">{{ priceSuffix(ev) }}</span>
                }
              </p>
            </div>
            <button
              type="button"
              class="ve-focus-ring rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              [class.bg-emerald-600]="cart.lastAddedEventId() === ev.id"
              [class.motion-safe:animate-ve-added-pop]="cart.lastAddedEventId() === ev.id"
              [class.bg-brand-900]="cart.lastAddedEventId() !== ev.id"
              [class.hover:bg-brand-800]="cart.lastAddedEventId() !== ev.id"
              (click)="add(ev)"
            >
              @if (cart.lastAddedEventId() === ev.id) {
                <span class="inline-flex items-center gap-2">
                  <svg class="h-4 w-4 motion-safe:animate-ve-added-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ i18n.t('card.added') }}
                </span>
              } @else {
                {{ i18n.t('detail.addCart') }}
              }
            </button>
          </div>
        </div>
      </div>
      } @else {
        <p class="text-sm text-ink-500">{{ i18n.t('workshops.loading') }}</p>
      }
    }
  `,
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventsApi = inject(EventsService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  readonly event = signal<HomeListEvent | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set(this.i18n.t('detail.notFound'));
      return;
    }
    this.eventsApi.bySlug(slug).subscribe({
      next: (e) => this.event.set(volunteerToHome(e)),
      error: () => {
        const d = getDummyBySlug(slug);
        if (d) {
          this.event.set(d);
          this.error.set(null);
        } else {
          this.error.set(this.i18n.t('detail.notFound'));
        }
      },
    });
  }

  title(ev: VolunteerEvent): string {
    const h = ev as HomeListEvent;
    return this.i18n.locale() === 'ar' && h.titleAr ? h.titleAr : ev.title;
  }

  location(ev: VolunteerEvent): string | null {
    const h = ev as HomeListEvent;
    if (this.i18n.locale() === 'ar' && h.locationAr) {
      return h.locationAr;
    }
    return ev.location;
  }

  body(ev: VolunteerEvent): string {
    const h = ev as HomeListEvent;
    const desc = ev.description || ev.summary;
    if (this.i18n.locale() === 'ar' && h.summaryAr && !ev.description) {
      return h.summaryAr;
    }
    return desc ?? '';
  }

  priceSuffix(ev: VolunteerEvent): string {
    const c = ev.currency?.toUpperCase();
    if (c === 'KWD') {
      return 'K.D.';
    }
    return ev.currency;
  }

  add(ev: HomeListEvent): void {
    if (ev.id < 0) {
      this.error.set(this.i18n.t('workshops.demoHint'));
      return;
    }
    this.cart.addItem(ev.id, 1).subscribe({
      next: () => {
        this.error.set(null);
        this.cart.openDrawer();
      },
      error: () => this.error.set(this.i18n.t('workshops.loadError')),
    });
  }
}
