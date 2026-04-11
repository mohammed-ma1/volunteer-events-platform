import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DUMMY_HOME_EVENTS, HomeListEvent, volunteerToHome } from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { EventCardComponent } from './event-card.component';

@Component({
  selector: 'app-facilitator-workshops-page',
  standalone: true,
  imports: [RouterLink, EventCardComponent],
  template: `
    <div class="mb-10">
      <a
        routerLink="/"
        class="ve-focus-ring mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
      >
        @if (i18n.isRtl()) {
          <span aria-hidden="true">→</span>
        } @else {
          <span aria-hidden="true">←</span>
        }
        {{ i18n.t('facilitatorsPage.back') }}
      </a>
      <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 md:text-3xl">
        {{ i18n.t('facilitatorsPage.title') }}
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
        {{ i18n.t('facilitatorsPage.subtitle') }}
      </p>
    </div>

    @if (error()) {
      <p class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ error() }}</p>
    }

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      @for (event of events(); track event.id; let ei = $index) {
        <div class="motion-safe:animate-ve-fade-up h-full" [style.animation-delay.ms]="ei * 40">
          <app-event-card [event]="event" (add)="onAdd($event)" />
        </div>
      }
    </div>

    @if (loading()) {
      <p class="mt-10 text-center text-sm text-ink-500">{{ i18n.t('workshops.loading') }}</p>
    }

    @if (!loading() && !events().length) {
      <p class="mt-10 text-center text-sm text-ink-500">{{ i18n.t('workshops.empty') }}</p>
    }
  `,
})
export class FacilitatorWorkshopsPageComponent implements OnDestroy {
  readonly i18n = inject(I18nService);
  private readonly eventsApi = inject(EventsService);
  readonly cart = inject(CartService);

  private readonly destroy$ = new Subject<void>();

  readonly events = signal<HomeListEvent[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.eventsApi
      .list(1, { perPage: 48 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped = res.data.map(volunteerToHome);
          if (mapped.length === 0) {
            this.events.set([...DUMMY_HOME_EVENTS]);
          } else {
            this.events.set(mapped);
          }
          this.loading.set(false);
        },
        error: () => {
          this.events.set([...DUMMY_HOME_EVENTS]);
          this.loading.set(false);
          this.error.set(this.i18n.t('workshops.loadError'));
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAdd(event: HomeListEvent): void {
    if (event.id < 0) {
      return;
    }
    this.cart.addItem(event.id, 1).subscribe({
      next: () => this.cart.openDrawer(),
      error: () => this.error.set(this.i18n.t('workshops.loadError')),
    });
  }
}
