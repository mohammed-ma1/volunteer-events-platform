import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, NgZone, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription, switchMap, take, timer } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { isTapCheckoutCompleteMessage } from '../../core/payment/tap-messages';
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

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="relative mx-auto min-h-[14rem] max-w-xl">
      @if (busy()) {
        <div
          class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div
            class="h-11 w-11 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
            aria-hidden="true"
          ></div>
          <p class="text-sm font-medium text-brand-900">{{ i18n.t('checkout.preparingTap') }}</p>
        </div>
      }

      <h1 class="text-3xl font-bold text-brand-900">{{ i18n.t('checkout.title') }}</h1>
      <p class="mt-2 text-sm text-ink-600">{{ i18n.t('checkout.subtitle') }}</p>

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
          <a routerLink="/" fragment="workshops" class="ms-1 font-semibold text-brand-700 hover:text-brand-900">{{
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
                    class="h-11 w-11 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
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
            class="inline-flex w-full items-center justify-center rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-brand-900 shadow-sm transition hover:border-ink-300 ve-focus-ring"
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
        <form class="mt-8 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="text-xs font-medium uppercase tracking-wide text-ink-500" for="name">{{
              i18n.t('checkout.labelName')
            }}</label>
            <input
              id="name"
              class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              type="text"
              formControlName="customer_name"
              autocomplete="name"
            />
          </div>
          <div>
            <label class="text-xs font-medium uppercase tracking-wide text-ink-500" for="email">{{
              i18n.t('checkout.labelEmail')
            }}</label>
            <input
              id="email"
              class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              type="email"
              formControlName="email"
              autocomplete="email"
            />
          </div>
          <div>
            <label class="text-xs font-medium uppercase tracking-wide text-ink-500" for="phone">{{
              i18n.t('checkout.labelPhone')
            }}</label>
            <input
              id="phone"
              class="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              type="tel"
              formControlName="phone"
              autocomplete="tel"
            />
          </div>

          @if (error()) {
            <p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {{ error() }}
            </p>
          }

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40 ve-focus-ring"
            [disabled]="form.invalid || busy()"
          >
            @if (busy()) {
              <span
                class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              ></span>
              <span>{{ i18n.t('checkout.paying') }}</span>
            } @else {
              {{ i18n.t('checkout.payTap') }}
            }
          </button>
        </form>
      }
    </div>
  `,
})
export class CheckoutPageComponent {
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
    if (ev.origin !== window.location.origin) {
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
    customer_name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
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
    const body = {
      customer_name: v.customer_name,
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
        if (environment.tapPreferFullPageRedirectOnLocalhost && this.hostIsLocal()) {
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
    return environment.tapPreferFullPageRedirectOnLocalhost && this.hostIsLocal();
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
}
