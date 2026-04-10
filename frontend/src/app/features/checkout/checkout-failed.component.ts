import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { OrderSummary } from '../../core/models/api.types';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-failed',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="mx-auto max-w-lg text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 motion-safe:animate-ve-fade-in"
        aria-hidden="true"
      >
        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 class="mt-6 text-2xl font-bold text-brand-900 motion-safe:animate-ve-fade-up">
        {{ i18n.t('failed.title') }}
      </h1>
      <p class="mt-3 text-sm text-ink-600 motion-safe:animate-ve-fade-up">
        {{ failureMessage() }}
      </p>

      @if (order(); as o) {
        <div
          class="mt-8 rounded-2xl border border-ink-200 bg-white px-6 py-5 text-start text-sm text-ink-700 shadow-sm motion-safe:animate-ve-fade-up"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-ink-500">{{ i18n.t('failed.orderRef') }}</p>
          <p class="mt-1 font-mono text-xs text-brand-900">{{ o.uuid }}</p>
          <p class="mt-3 text-xs font-medium uppercase tracking-wide text-ink-500">{{ i18n.t('complete.total') }}</p>
          <p class="mt-1 text-lg font-semibold text-brand-900">
            {{ o.total | number: '1.2-3' }} {{ o.currency }}
          </p>
        </div>
      }

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          routerLink="/checkout"
          class="inline-flex justify-center rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 ve-focus-ring"
          >{{ i18n.t('failed.tryAgain') }}</a
        >
        <a
          routerLink="/"
          fragment="workshops"
          class="inline-flex justify-center rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-900 shadow-sm transition hover:border-ink-300"
          >{{ i18n.t('failed.browseWorkshops') }}</a
        >
      </div>
    </div>
  `,
})
export class CheckoutFailedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutApi = inject(CheckoutService);
  readonly i18n = inject(I18nService);

  readonly order = signal<OrderSummary | null>(null);
  readonly failureMessage = signal('');

  ngOnInit(): void {
    const uuid = this.route.snapshot.queryParamMap.get('order');
    const reason = this.route.snapshot.queryParamMap.get('reason') ?? '';

    if (reason === 'timeout') {
      this.failureMessage.set(this.i18n.t('failed.reasonTimeout'));
    } else if (reason === 'error') {
      this.failureMessage.set(this.i18n.t('failed.reasonError'));
    } else {
      this.failureMessage.set(this.i18n.t('failed.reasonDeclined'));
    }

    if (!uuid) {
      return;
    }

    this.checkoutApi.getOrder(uuid).subscribe({
      next: (o) => {
        this.order.set(o);
        if (o.status === 'paid') {
          void this.router.navigate(['/checkout/complete'], { queryParams: { order: uuid } });
        }
      },
      error: () => {
        /* keep generic message */
      },
    });
  }
}
