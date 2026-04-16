import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { OrderSummary } from '../../core/models/api.types';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-complete',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="min-h-[60vh] bg-slate-100/90 px-4 py-10 md:py-14">
      <div class="mx-auto max-w-lg">
        @if (error()) {
          <div
            class="rounded-3xl border border-red-200 bg-white px-6 py-8 text-center shadow-lg shadow-slate-200/50"
          >
            <p class="text-sm text-red-800">{{ error() }}</p>
            <a
              routerLink="/"
              class="ve-btn-primary mt-6"
              >{{ i18n.t('complete.backHome') }}</a
            >
          </div>
        } @else {
          @if (order(); as o) {
            @if (o.status === 'paid') {
              <div
                class="rounded-3xl border border-slate-200/80 bg-white px-6 py-8 text-center shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] md:px-8 md:py-10"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              >
                <div
                  class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-emerald-600 motion-safe:animate-ve-success-pop"
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

                <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-[#0a1628] md:text-[1.65rem]">
                  {{ i18n.t('complete.headingSuccess') }}
                </h1>
                <p class="mt-3 text-sm leading-relaxed text-slate-600">
                  {{ i18n.t('complete.confirmSubtitle') }}
                  <span class="font-semibold text-[#0a1628]">{{ o.customer_name }}</span>
                  — {{ i18n.t('complete.confirmEmailIntro') }}
                  <span class="font-semibold text-brand-900">{{ o.email }}</span>
                </p>

                <div
                  class="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div class="text-start">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {{ i18n.t('complete.orderNumberLabel') }}
                    </p>
                    <p class="mt-1 text-lg font-bold text-[#0a1628]">#{{ orderDisplayRef(o) }}</p>
                  </div>
                  <button
                    type="button"
                    class="ve-btn-secondary w-full shrink-0 border-slate-200 text-ink-900 sm:w-auto"
                    (click)="downloadInvoice(o.uuid)"
                  >
                    <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {{ i18n.t('complete.downloadInvoice') }}
                  </button>
                </div>

                <div class="mt-8 rounded-2xl border border-emerald-100/80 bg-white px-5 py-5 text-start text-sm text-slate-700 shadow-sm">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ i18n.t('complete.detailsHeading') }}
                  </p>
                  <p class="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {{ i18n.t('complete.total') }}
                  </p>
                  <p class="mt-1 text-2xl font-bold text-brand-900">
                    {{ o.total | number: '1.0-3' }} {{ i18n.currencyLabel(o.currency) }}
                  </p>
                  <ul class="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    @for (line of o.items; track line.event_title) {
                      <li class="flex justify-between gap-3 text-sm">
                        <span class="font-medium text-[#0a1628]">{{ line.event_title }} × {{ line.quantity }}</span>
                        <span class="shrink-0 text-slate-500"
                          >{{ line.unit_price | number: '1.0-3' }} {{ i18n.currencyLabel(o.currency) }}</span
                        >
                      </li>
                    }
                  </ul>
                </div>

                <!-- Workshop Access -->
                <div class="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 px-5 py-5 text-start">
                  <div class="flex items-start gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      @if (auth.isAuthenticated()) {
                        <span class="text-sm font-semibold text-slate-800 block">Workshop added to your dashboard!</span>
                        <span class="text-xs text-slate-500 mt-1 block leading-relaxed">Your new workshop is ready. Go to your dashboard to view session details and Zoom links.</span>
                        <a routerLink="/dashboard"
                           class="ve-btn-primary mt-3">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                          Go to My Workshops
                        </a>
                      } @else {
                        <span class="text-sm font-semibold text-slate-800 block">Your workshop account is ready!</span>
                        <span class="text-xs text-slate-500 mt-1 block leading-relaxed">We've sent your login credentials to <strong class="text-slate-700">{{ o.email }}</strong>. Log in to access your workshop details, schedule, and Zoom links.</span>
                        <a routerLink="/login"
                           class="ve-btn-primary mt-3">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          Log In to Access Workshops
                        </a>
                      }
                    </div>
                  </div>
                </div>

                <a
                  routerLink="/"
                  class="ve-btn-primary ve-btn-primary--block ve-btn-primary--lg mt-6"
                >
                  @if (i18n.isRtl()) {
                    <span aria-hidden="true">←</span>
                  } @else {
                    <span aria-hidden="true">→</span>
                  }
                  {{ i18n.t('complete.backHome') }}
                </a>
              </div>
            } @else {
              <div class="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-lg">
                <p class="text-sm text-slate-600">{{ i18n.t('complete.notPaidYet') }}</p>
                <a
                  routerLink="/checkout"
                  class="ve-btn-primary mt-6"
                  >{{ i18n.t('failed.tryAgain') }}</a
                >
              </div>
            }
          } @else {
            <div class="flex flex-col items-center gap-4 rounded-3xl bg-white py-12 shadow-lg">
              <div
                class="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-brand-900"
                aria-hidden="true"
              ></div>
              <p class="text-sm text-slate-500">{{ i18n.t('complete.loading') }}</p>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CheckoutCompleteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkoutApi = inject(CheckoutService);
  readonly auth = inject(AuthService);
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

  orderDisplayRef(o: OrderSummary): string {
    return o.reference_code ?? o.uuid.replace(/-/g, '').slice(-8).toUpperCase();
  }

  downloadInvoice(uuid: string): void {
    const base = environment.apiUrl.replace(/\/$/, '');
    window.location.href = `${window.location.origin}${base}/v1/orders/${uuid}/invoice`;
  }
}
