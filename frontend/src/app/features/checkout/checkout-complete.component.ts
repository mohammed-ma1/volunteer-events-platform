import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { OrderSummary } from '../../core/models/api.types';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-complete',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="mx-auto max-w-lg text-center">
      @if (error()) {
        <p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {{ error() }}
        </p>
      } @else {
        @if (order(); as o) {
          @if (o.status === 'paid') {
          <div
            class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 motion-safe:animate-ve-success-pop"
            aria-hidden="true"
          >
            <svg
              class="h-10 w-10 motion-safe:animate-ve-success-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p
            class="mt-6 text-xs font-semibold uppercase tracking-wider text-emerald-600 motion-safe:animate-ve-fade-up"
          >
            {{ i18n.t('complete.paidBadge') }}
          </p>
          <h1 class="mt-2 text-3xl font-bold text-brand-900 motion-safe:animate-ve-fade-up">
            {{ i18n.t('complete.title') }}, {{ o.customer_name }}!
          </h1>
          <p class="mt-3 text-sm text-ink-600 motion-safe:animate-ve-fade-up">
            {{ i18n.t('complete.capturedHint') }}
          </p>
          <p class="mt-2 text-sm text-ink-600 motion-safe:animate-ve-fade-up">
            {{ i18n.t('complete.receipt') }} <span class="font-medium text-brand-900">{{ o.email }}</span
            >.
          </p>
          <div
            class="mt-8 rounded-2xl border border-emerald-100 bg-white px-6 py-5 text-start text-sm text-ink-700 shadow-sm motion-safe:animate-ve-fade-up"
          >
            <p class="text-xs font-medium uppercase tracking-wide text-ink-500">{{ i18n.t('complete.total') }}</p>
            <p class="mt-1 text-2xl font-bold text-brand-900">
              {{ o.total | number: '1.0-3' }} {{ i18n.currencyLabel(o.currency) }}
            </p>
            <ul class="mt-4 space-y-2">
              @for (line of o.items; track line.event_title) {
                <li class="flex justify-between gap-3">
                  <span class="text-brand-900">{{ line.event_title }} × {{ line.quantity }}</span>
                  <span class="text-ink-500"
                    >{{ line.unit_price | number: '1.0-3' }} {{ i18n.currencyLabel(o.currency) }}</span
                  >
                </li>
              }
            </ul>
          </div>
          } @else {
            <p class="text-sm text-ink-600">{{ i18n.t('complete.notPaidYet') }}</p>
            <a
              routerLink="/checkout"
              class="mt-6 inline-flex rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
              >{{ i18n.t('failed.tryAgain') }}</a
            >
          }
        } @else {
          <div class="flex flex-col items-center gap-4 py-8">
            <div
              class="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
              aria-hidden="true"
            ></div>
            <p class="text-sm text-ink-500">{{ i18n.t('complete.loading') }}</p>
          </div>
        }
      }

      <a
        routerLink="/"
        class="mt-10 inline-flex rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-900 shadow-sm transition hover:border-ink-300"
        >{{ i18n.t('complete.back') }}</a
      >
    </div>
  `,
})
export class CheckoutCompleteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutApi = inject(CheckoutService);
  readonly i18n = inject(I18nService);

  readonly order = signal<OrderSummary | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const uuid = this.route.snapshot.queryParamMap.get('order');
    if (!uuid) {
      this.error.set(this.i18n.t('complete.missingOrder'));
      return;
    }
    this.checkoutApi
      .syncOrderWithTap(uuid)
      .pipe(catchError(() => this.checkoutApi.getOrder(uuid)))
      .subscribe({
        next: (o) => {
          this.order.set(o);
          if (o.status === 'failed' || o.status === 'cancelled') {
            void this.router.navigate(['/checkout/failed'], { queryParams: { order: uuid } });
          }
        },
        error: () => this.error.set(this.i18n.t('complete.loadError')),
      });
  }
}
