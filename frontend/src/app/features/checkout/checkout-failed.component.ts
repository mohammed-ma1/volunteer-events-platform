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
    <div class="min-h-[60vh] bg-slate-100/90 px-4 py-10 md:py-14">
      <div class="mx-auto max-w-lg">
        <div
          class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 text-center shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] md:px-8 md:py-10"
          [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
        >
          <div
            class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-100 bg-red-50 text-red-600 motion-safe:animate-ve-fade-in"
            aria-hidden="true"
          >
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-[#0a1628] md:text-[1.65rem]">
            {{ i18n.t('failed.title') }}
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">
            {{ failureMessage() }}
          </p>

          @if (order(); as o) {
            <div class="mt-8 rounded-2xl bg-slate-100 p-4 text-start text-sm text-slate-700">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.t('failed.orderRef') }}</p>
              <p class="mt-1 font-mono text-xs font-semibold text-[#0a1628]">#{{ orderDisplayRef(o) }}</p>
              <p class="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                {{ i18n.t('complete.total') }}
              </p>
              <p class="mt-1 text-lg font-bold text-[#001A33]">
                {{ o.total | number: '1.0-3' }} {{ i18n.currencyLabel(o.currency) }}
              </p>
            </div>
          }

          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              routerLink="/checkout"
              class="ve-focus-ring inline-flex justify-center rounded-xl bg-[#001A33] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#002a4d]"
              >{{ i18n.t('failed.tryAgain') }}</a
            >
            <a
              routerLink="/"
              fragment="workshops"
              class="ve-focus-ring inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0a1628] shadow-sm transition hover:border-slate-400"
              >{{ i18n.t('failed.browseWorkshops') }}</a
            >
          </div>

          <a
            routerLink="/"
            class="ve-focus-ring mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-[#001A33]"
          >
            {{ i18n.t('complete.backHome') }}
          </a>
        </div>
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

  orderDisplayRef(o: OrderSummary): string {
    return o.reference_code ?? o.uuid.replace(/-/g, '').slice(-8).toUpperCase();
  }
}
