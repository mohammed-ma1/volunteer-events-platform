import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, NgZone, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription, switchMap, take, timer } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { isLocalBrowserOrigin, isTapCheckoutCompleteMessage } from '../../core/payment/tap-messages';
import { CartLine } from '../../core/models/api.types';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { environment } from '../../../environments/environment';

/** `randomUUID` is missing on non-HTTPS origins (e.g. http://droplet-ip); use RFC4122 v4 via getRandomValues when needed. */
function createClientUuid(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) {
    return c.randomUUID();
  }
  if (c?.getRandomValues) {
    const b = new Uint8Array(16);
    c.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Tap's hosted checkout sets CSP `frame-ancestors 'self'`, so it cannot be embedded in a merchant
 * iframe — use full-page navigation to `payment_url` instead. Return flow uses `/checkout/tap-return`.
 */
function isTapHostedPaymentUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'checkout.tap.company' || host.endsWith('.tap.company');
  } catch {
    return false;
  }
}

/** Tap / card network logos (hosted asset). */
const TAP_PAYMENT_METHODS_BANNER_URL =
  'https://vibe.filesafe.space/1775667546795098704/attachments/1155c919-726e-476b-ba42-a821af443073.webp';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
      @if (busy() && !paymentActive()) {
        <div
          class="pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <div class="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-white px-8 py-6 shadow-lg">
            <div
              class="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-brand-900"
              aria-hidden="true"
            ></div>
            <p class="text-sm font-semibold text-brand-900">{{ i18n.t('checkout.preparingTap') }}</p>
          </div>
        </div>
      }

      <a
        routerLink="/"
        fragment="workshops"
        class="ve-focus-ring mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-900 transition hover:text-brand-700"
      >
        @if (i18n.isRtl()) {
          <span aria-hidden="true">→</span>
        } @else {
          <span aria-hidden="true">←</span>
        }
        {{ i18n.t('checkout.backWorkshops') }}
      </a>

      <h1 class="text-2xl font-extrabold tracking-tight text-[#0a1628] md:text-3xl">{{ i18n.t('checkout.title') }}</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{{ i18n.t('checkout.subtitle') }}</p>

      @if (showTapLocalDevBanner()) {
        <div
          class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="note"
        >
          <p class="font-medium text-amber-950">{{ i18n.t('checkout.tapLeavingSite') }}</p>
          <p class="mt-2 text-amber-900/95">{{ i18n.t('checkout.localTapDevWarning') }}</p>
        </div>
      }

      @let snap = cart.snapshot();
      @if (!snap) {
        <p class="mt-6 text-sm text-ink-500">{{ i18n.t('cart.loading') }}</p>
      } @else if (snap.items.length === 0) {
        <p class="mt-6 rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-600 shadow-sm">
          {{ i18n.t('cart.empty') }}
          <a routerLink="/" fragment="workshops" class="ms-1 font-semibold text-brand-900 hover:underline">{{
            i18n.t('cart.browseWorkshops')
          }}</a>
        </p>
      } @else if (paymentActive()) {
        <div class="mt-8 space-y-4">
          <h2 class="text-lg font-semibold text-brand-900">{{ i18n.t('checkout.paySecureBelow') }}</h2>
          <p class="text-sm text-ink-600">{{ i18n.t('checkout.processingPayment') }}</p>

          @if (safePaymentUrl(); as src) {
            <div class="relative overflow-hidden rounded-2xl">
              @if (tapFrameLoading()) {
                <div
                  class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/92 backdrop-blur-sm"
                  role="status"
                  aria-live="polite"
                >
                  <div
                    class="h-11 w-11 animate-spin rounded-full border-2 border-ink-200 border-t-brand-900"
                    aria-hidden="true"
                  ></div>
                  <p class="text-sm font-medium text-brand-900">{{ i18n.t('checkout.loadingTapFrame') }}</p>
                </div>
              }
              <iframe
                [src]="src"
                [title]="i18n.t('checkout.iframeTitle')"
                class="h-[min(720px,75vh)] w-full rounded-2xl border border-ink-200 bg-white shadow-sm"
                referrerpolicy="strict-origin-when-cross-origin"
                (load)="onTapFrameLoaded()"
              ></iframe>
            </div>
          }

          <a
            class="ve-btn-secondary ve-btn-secondary--block border-ink-200"
            [href]="paymentUrlRaw() ?? '#'"
            target="_blank"
            rel="noopener noreferrer"
            >{{ i18n.t('checkout.openPaymentNewTab') }}</a
          >

          @if (error()) {
            <p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {{ error() }}
            </p>
          }
        </div>
      } @else {
        <div class="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div class="rounded-2xl border border-ink-200/90 bg-white p-5 shadow-sm md:p-7">
            <h2 class="text-lg font-bold text-[#0a1628]">{{ i18n.t('checkout.personalTitle') }}</h2>
            <p class="mt-1 text-sm text-ink-600">{{ i18n.t('checkout.personalSubtitle') }}</p>

            <form id="checkout-personal-form" class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="text-sm font-bold text-[#0a1628]" for="fn">{{ i18n.t('checkout.labelFirstName') }}</label>
                  <input
                    id="fn"
                    class="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-[#0a1628] outline-none transition focus:border-brand-900/40 focus:ring-2 focus:ring-brand-900/10"
                    type="text"
                    formControlName="firstName"
                    autocomplete="given-name"
                  />
                </div>
                <div>
                  <label class="text-sm font-bold text-[#0a1628]" for="ln">{{ i18n.t('checkout.labelLastName') }}</label>
                  <input
                    id="ln"
                    class="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-[#0a1628] outline-none transition focus:border-brand-900/40 focus:ring-2 focus:ring-brand-900/10"
                    type="text"
                    formControlName="lastName"
                    autocomplete="family-name"
                  />
                </div>
              </div>
              <div>
                <label class="text-sm font-bold text-[#0a1628]" for="ph">{{ i18n.t('checkout.labelPhone') }}</label>
                <input
                  id="ph"
                  class="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-[#0a1628] outline-none transition focus:border-brand-900/40 focus:ring-2 focus:ring-brand-900/10"
                  type="tel"
                  formControlName="phone"
                  autocomplete="tel"
                />
              </div>
              <div>
                <label class="text-sm font-bold text-[#0a1628]" for="em">{{ i18n.t('checkout.labelEmail') }}</label>
                <input
                  id="em"
                  class="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-[#0a1628] outline-none transition focus:border-brand-900/40 focus:ring-2 focus:ring-brand-900/10"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                />
              </div>

              @if (error()) {
                <p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {{ error() }}
                </p>
              }
            </form>
          </div>

          <aside class="rounded-2xl border border-ink-200/90 bg-white p-5 shadow-sm md:p-7">
            <h2 class="text-lg font-bold text-[#0a1628]">{{ i18n.t('checkout.orderSummary') }}</h2>

            <ul class="mt-5 space-y-4">
              @for (line of snap.items; track line.id) {
                <li class="flex gap-3 border-b border-ink-100 pb-4 last:border-0 last:pb-0">
                  @if (line.event?.image_url) {
                    <img
                      [src]="line.event!.image_url"
                      alt=""
                      class="h-16 w-20 shrink-0 rounded-lg object-cover ring-1 ring-ink-100"
                    />
                  } @else {
                    <div
                      class="h-16 w-20 shrink-0 rounded-lg bg-ink-100 ring-1 ring-ink-100"
                      aria-hidden="true"
                    ></div>
                  }
                  <div class="min-w-0 flex-1 text-start">
                    <p class="text-sm font-bold leading-snug text-[#0a1628]">{{ line.event?.title ?? '—' }}</p>
                    <p class="mt-1 text-sm font-semibold text-brand-900">
                      {{ line.event?.price ?? 0 | number: '1.0-3' }}
                      {{ currencySuffix(snap.currency) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="ve-focus-ring self-start rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                    (click)="removeLine(line)"
                    [attr.aria-label]="i18n.t('checkout.removeLine')"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              }
            </ul>

            <div class="mt-6 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div class="flex justify-between text-ink-600">
                <span>{{ i18n.t('checkout.subtotalLine') }}</span>
                <span class="font-semibold text-[#0a1628]"
                  >{{ snap.subtotal | number: '1.0-3' }} {{ currencySuffix(snap.currency) }}</span
                >
              </div>
              <div class="flex justify-between text-ink-600">
                <span>{{ i18n.t('checkout.extraFees') }}</span>
                <span class="font-semibold text-[#0a1628]">{{ i18n.t('checkout.feesZero') }}</span>
              </div>
              <div class="flex items-baseline justify-between pt-2">
                <span class="text-base font-bold text-[#0a1628]">{{ i18n.t('checkout.total') }}</span>
                <span class="text-xl font-black text-brand-900"
                  >{{ snap.subtotal | number: '1.0-3' }} {{ currencySuffix(snap.currency) }}</span
                >
              </div>
            </div>

            <button
              type="submit"
              form="checkout-personal-form"
              class="ve-btn-primary ve-btn-primary--block ve-btn-primary--lg mt-6 disabled:cursor-not-allowed disabled:opacity-40"
              [disabled]="form.invalid || busy()"
            >
              @if (busy()) {
                <span
                  class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                ></span>
                <span>{{ i18n.t('checkout.paying') }}</span>
              } @else {
                {{ i18n.t('checkout.payNow') }}
              }
            </button>

            <p class="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
              <span class="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
              {{ i18n.t('checkout.securePayment') }}
            </p>

            <div class="mt-4 flex justify-center" aria-label="Payment methods">
              <img
                [src]="tapPaymentMethodsBannerUrl"
                width="560"
                height="72"
                alt=""
                class="h-auto max-h-14 w-full max-w-md object-contain opacity-95"
                loading="lazy"
              />
            </div>

            <p
              class="mx-auto mt-5 max-w-sm rounded-full border border-ink-200 bg-ink-50/80 px-4 py-2 text-center text-xs font-medium text-ink-700"
            >
              {{ i18n.t('checkout.installmentPill') }}
            </p>
          </aside>
        </div>
      }
    </div>
  `,
})
export class CheckoutPageComponent {
  readonly tapPaymentMethodsBannerUrl = TAP_PAYMENT_METHODS_BANNER_URL;

  private readonly fb = inject(FormBuilder);
  private readonly checkoutApi = inject(CheckoutService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly paymentActive = signal(false);
  readonly safePaymentUrl = signal<SafeResourceUrl | null>(null);
  readonly paymentUrlRaw = signal<string | null>(null);
  readonly tapFrameLoading = signal(false);
  private readonly activeOrderUuid = signal<string | null>(null);

  private idempotencyKey = createClientUuid();
  private pollSub?: Subscription;

  private readonly onWindowMessage = (ev: MessageEvent): void => {
    const sameOrigin = ev.origin === window.location.origin;
    const devLocalTapFrame = !environment.production && isLocalBrowserOrigin(ev.origin);
    if (!sameOrigin && !devLocalTapFrame) {
      return;
    }
    if (!isTapCheckoutCompleteMessage(ev.data)) {
      return;
    }
    const expected = this.activeOrderUuid();
    if (!expected || ev.data.orderUuid !== expected) {
      return;
    }
    this.zone.run(() => this.fetchOrderOnce(expected));
  };

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    lastName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(32)]],
  });

  constructor() {
    this.cart.refresh().subscribe();
    window.addEventListener('message', this.onWindowMessage);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('message', this.onWindowMessage);
      this.stopPolling();
    });
  }

  submit(): void {
    if (this.form.invalid || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const customer_name = `${v.firstName.trim()} ${v.lastName.trim()}`.trim();
    const body = {
      customer_name,
      email: v.email,
      phone: v.phone?.trim() ? v.phone.trim() : undefined,
    };

    const locale = this.i18n.locale();

    this.checkoutApi.startCheckout(body, this.idempotencyKey, locale).subscribe({
      next: (res) => {
        if (!res.payment_url) {
          this.error.set(this.i18n.t('checkout.noPaymentUrl'));
          this.busy.set(false);
          return;
        }
        if (
          isTapHostedPaymentUrl(res.payment_url) ||
          (!environment.production &&
            environment.tapPreferFullPageRedirectOnLocalhost &&
            this.hostIsLocal())
        ) {
          window.location.assign(res.payment_url);
          return;
        }
        this.tapFrameLoading.set(true);
        this.safePaymentUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.payment_url));
        this.paymentUrlRaw.set(res.payment_url);
        this.activeOrderUuid.set(res.order_uuid);
        this.paymentActive.set(true);
        this.busy.set(false);
        this.startPolling(res.order_uuid);
      },
      error: (err) => {
        this.error.set(this.checkoutErrorMessage(err));
        this.busy.set(false);
      },
    });
  }

  private startPolling(uuid: string): void {
    this.stopPolling();
    let resolved = false;

    this.pollSub = timer(0, 2000)
      .pipe(
        take(90),
        switchMap(() => this.checkoutApi.getOrder(uuid)),
      )
      .subscribe({
        next: (o) => {
          if (this.handleTerminalOrder(o.status, uuid)) {
            resolved = true;
          }
        },
        error: () => {
          this.stopPolling();
          void this.router.navigate(['/checkout/failed'], {
            queryParams: { order: uuid, reason: 'error' },
          });
        },
        complete: () => {
          if (
            !resolved &&
            this.paymentActive() &&
            this.activeOrderUuid() === uuid
          ) {
            void this.router.navigate(['/checkout/failed'], {
              queryParams: { order: uuid, reason: 'timeout' },
            });
          }
        },
      });
  }

  private fetchOrderOnce(uuid: string): void {
    this.checkoutApi.getOrder(uuid).subscribe({
      next: (o) => {
        this.handleTerminalOrder(o.status, uuid);
      },
      error: () => {
        /* rely on polling */
      },
    });
  }

  /** @returns true if terminal (paid / failed / cancelled) was handled */
  private handleTerminalOrder(status: string, uuid: string): boolean {
    if (status === 'paid') {
      this.stopPolling();
      void this.router.navigate(['/checkout/complete'], { queryParams: { order: uuid } });
      return true;
    }
    if (status === 'failed' || status === 'cancelled') {
      this.stopPolling();
      void this.router.navigate(['/checkout/failed'], {
        queryParams: { order: uuid, reason: 'declined' },
      });
      return true;
    }
    return false;
  }

  onTapFrameLoaded(): void {
    this.zone.run(() => this.tapFrameLoading.set(false));
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  showTapLocalDevBanner(): boolean {
    return (
      !environment.production &&
      environment.tapPreferFullPageRedirectOnLocalhost &&
      this.hostIsLocal()
    );
  }

  private hostIsLocal(): boolean {
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );
  }

  private checkoutErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return this.i18n.t('checkout.networkError');
      }
      if (err.status === 401) {
        return this.i18n.t('checkout.errorMissingCart');
      }
      if (err.status === 502) {
        return this.i18n.t('checkout.errorPaymentProvider');
      }
      const body = err.error as { message?: string } | null;
      if (body && typeof body.message === 'string' && body.message.length > 0) {
        return body.message;
      }
    }
    return this.i18n.t('checkout.failed');
  }

  currencySuffix(currency: string): string {
    return this.i18n.currencyLabel(currency);
  }

  removeLine(line: CartLine): void {
    this.cart.removeItem(line.id).subscribe({ error: () => this.error.set(this.i18n.t('checkout.failed')) });
  }
}
