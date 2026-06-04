import { DecimalPipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, NgZone, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription, switchMap, take, timer } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { isLocalBrowserOrigin, isTapCheckoutCompleteMessage } from '../../core/payment/tap-messages';
import { CartLine, CartSnapshot, VolunteerEvent } from '../../core/models/api.types';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { EventsService } from '../../core/services/events.service';
import { MetaPixelService } from '../../core/analytics/meta-pixel.service';
import { ALL_PACKAGE_SLUGS, PACKAGE_100_EVENT_SLUG } from '../../core/constants/package-offer';
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

/** A row in the right-hand Order Summary panel — real cart line or a virtual upsell/add-on. */
interface SummaryRow {
  key: string;
  kind: 'real' | 'bundle' | 'bita';
  title: string;
  price: number;
  imageUrl: string | null;
  realLineId: string | null;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, NgClass],
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
          <div class="space-y-6">
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
                <div class="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-ink-200 bg-white focus-within:border-brand-900/40 focus-within:ring-2 focus-within:ring-brand-900/10">
                  <span
                    class="flex shrink-0 select-none items-center justify-center border-e border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700"
                    dir="ltr"
                    aria-hidden="true"
                  >+965</span>
                  <input
                    id="ph"
                    class="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm text-[#0a1628] outline-none"
                    type="tel"
                    formControlName="phone"
                    autocomplete="tel"
                    inputmode="numeric"
                    maxlength="8"
                    placeholder="9999 9999"
                    dir="ltr"
                  />
                </div>
                <p class="mt-1 text-xs text-ink-500">{{ i18n.t('checkout.phoneHint') }}</p>
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
                <p class="mt-1.5 max-w-prose text-xs leading-snug text-red-600" role="note">
                  {{ i18n.t('checkout.emailImportantNote') }}
                </p>
              </div>

              @if (error()) {
                <p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {{ error() }}
                </p>
              }
            </form>
          </div>

          @if (showUpsell()) {
            <label
              id="checkout-upsell"
              class="motion-safe:animate-ve-fade-up relative block rounded-2xl border-2 border-dashed bg-gradient-to-br from-brand-50/60 via-white to-white p-5 shadow-sm transition md:p-6"
              [ngClass]="[
                upgradeBundle()
                  ? 'border-brand-900 ring-2 ring-brand-900/15'
                  : 'border-brand-900/30 hover:border-brand-900/50',
                cartHasBundle() ? 'cursor-default' : 'cursor-pointer'
              ]"
            >
              <span
                class="absolute -top-3 end-5 inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-3 py-1 text-[11px] font-bold text-white shadow-md"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true"></span>
                {{ i18n.t('checkout.upsellBadge') }}
              </span>

              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  class="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-ink-300 text-brand-900 accent-brand-900 focus:ring-2 focus:ring-brand-900/20 disabled:cursor-not-allowed disabled:opacity-90"
                  [checked]="upgradeBundle()"
                  [disabled]="cartHasBundle()"
                  (change)="toggleUpgrade($event)"
                />
                <div class="min-w-0">
                  <p class="text-base font-extrabold leading-snug text-[#0a1628]">
                    {{ i18n.t('checkout.upsellTitle') }}
                  </p>
                  <p class="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {{ i18n.t('checkout.upsellBody') }}
                  </p>

                  <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3" dir="ltr">
                    <div class="inline-flex items-baseline gap-2 rounded-xl bg-brand-50 px-3 py-2">
                      <span class="text-xl font-black tracking-tight text-brand-900">{{
                        i18n.t('checkout.upsellPriceNow')
                      }}</span>
                      <span class="text-sm font-medium text-ink-400 line-through">{{
                        i18n.t('checkout.upsellPriceWas')
                      }}</span>
                    </div>
                    <span class="hidden h-8 w-px bg-ink-200 sm:block" aria-hidden="true"></span>
                    <div class="inline-flex items-center gap-2">
                      <span class="text-lg font-extrabold text-pink-600">{{
                        i18n.t('checkout.upsellInstallmentAmount')
                      }}</span>
                      <span class="max-w-[14rem] text-xs leading-snug text-ink-600">{{
                        i18n.t('checkout.upsellInstallmentNote')
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          }

          @if (showBitaAddon()) {
            <label
              id="checkout-bita"
              class="motion-safe:animate-ve-fade-up relative block cursor-pointer rounded-2xl border-2 border-dashed bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-sm transition md:p-6"
              [ngClass]="
                addBitaCertificate()
                  ? 'border-amber-500 ring-2 ring-amber-500/15'
                  : 'border-amber-400/40 hover:border-amber-500/70'
              "
            >
              <span
                class="absolute -top-3 end-5 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow-md"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true"></span>
                {{ i18n.t('checkout.bitaBadge') }}
              </span>

              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  class="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-ink-300 text-amber-500 accent-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  [checked]="addBitaCertificate()"
                  (change)="toggleBita($event)"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-base font-extrabold leading-snug text-[#0a1628]">
                    {{ i18n.t('checkout.bitaTitle') }}
                  </p>
                  <p class="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {{ i18n.t('checkout.bitaBody') }}
                  </p>

                  <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2" dir="ltr">
                    <span class="text-xl font-black tracking-tight text-amber-700">{{
                      i18n.t('checkout.bitaPrice')
                    }}</span>
                  </div>
                </div>

                <!-- Official BITA badge -->
                <div
                  class="hidden h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white p-1.5 shadow-sm sm:flex"
                  aria-hidden="true"
                >
                  <img src="/images/branding/bita-logo.png" alt="BITA" class="h-full w-full object-contain" />
                </div>
              </div>
            </label>
          }
          </div>

          <aside class="rounded-2xl border border-ink-200/90 bg-white p-5 shadow-sm md:p-7">
            <h2 class="text-lg font-bold text-[#0a1628]">{{ i18n.t('checkout.orderSummary') }}</h2>

            <ul class="mt-5 space-y-4">
              @for (row of displayedSummaryItems(); track row.key) {
                <li class="flex gap-3 border-b border-ink-100 pb-4 last:border-0 last:pb-0">
                  @if (row.imageUrl) {
                    <img
                      [src]="row.imageUrl"
                      alt=""
                      class="h-16 w-20 shrink-0 rounded-lg object-cover ring-1 ring-ink-100"
                    />
                  } @else if (row.kind === 'bita') {
                    <div
                      class="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 ring-1 ring-amber-100"
                      aria-hidden="true"
                    >
                      <svg class="h-9 w-9 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                    </div>
                  } @else {
                    <div
                      class="h-16 w-20 shrink-0 rounded-lg bg-ink-100 ring-1 ring-ink-100"
                      aria-hidden="true"
                    ></div>
                  }
                  <div class="min-w-0 flex-1 text-start">
                    <p class="text-sm font-bold leading-snug text-[#0a1628]">{{ row.title }}</p>
                    <p class="mt-1 text-sm font-semibold text-brand-900">
                      {{ row.price | number: '1.0-3' }}
                      {{ currencySuffix(snap.currency) }}
                    </p>
                    @if (row.kind === 'bundle') {
                      <span class="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                        <span class="h-1.5 w-1.5 rounded-full bg-brand-700" aria-hidden="true"></span>
                        {{ i18n.t('checkout.upsellAppliedNote') }}
                      </span>
                    } @else if (row.kind === 'bita') {
                      <span class="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                        {{ i18n.t('checkout.bitaBadge') }}
                      </span>
                    }
                  </div>
                  @if (row.kind === 'real') {
                    <button
                      type="button"
                      class="ve-focus-ring self-start rounded-lg p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                      (click)="removeRealLine(row.realLineId)"
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
                  }
                </li>
              }
            </ul>

            <div class="mt-6 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <div class="flex justify-between text-ink-600">
                <span>{{ i18n.t('checkout.subtotalLine') }}</span>
                <span class="font-semibold text-[#0a1628]"
                  >{{ subtotalDisplay() | number: '1.0-3' }} {{ currencySuffix(snap.currency) }}</span
                >
              </div>
              <div class="flex justify-between text-ink-600">
                <span>{{ i18n.t('checkout.extraFees') }}</span>
                <span class="font-semibold text-[#0a1628]">
                  @if (additionalFees() > 0) {
                    {{ additionalFees() | number: '1.0-3' }} {{ currencySuffix(snap.currency) }}
                  } @else {
                    {{ i18n.t('checkout.feesZero') }}
                  }
                </span>
              </div>
              <div class="flex items-baseline justify-between pt-2">
                <span class="text-base font-bold text-[#0a1628]">{{ i18n.t('checkout.total') }}</span>
                <span class="text-xl font-black text-brand-900"
                  >{{ effectiveTotal() | number: '1.0-3' }} {{ currencySuffix(snap.currency) }}</span
                >
              </div>
              @if (showUpsell() && upgradeBundle()) {
                <p class="flex items-center justify-end gap-1.5 pt-1 text-xs font-semibold text-brand-900">
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ i18n.t('checkout.upsellAppliedNote') }}
                </p>
              }
              @if (addBitaCertificate()) {
                <p class="flex items-center justify-end gap-1.5 pt-1 text-xs font-semibold text-amber-700">
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ i18n.t('checkout.bitaAppliedNote') }}
                </p>
              }
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
  private readonly events = inject(EventsService);
  private readonly metaPixel = inject(MetaPixelService);

  /** Guard so the InitiateCheckout pixel fires only once per page visit. */
  private initiateCheckoutFired = false;

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly paymentActive = signal(false);
  readonly safePaymentUrl = signal<SafeResourceUrl | null>(null);
  readonly paymentUrlRaw = signal<string | null>(null);
  readonly tapFrameLoading = signal(false);
  private readonly activeOrderUuid = signal<string | null>(null);

  // ── One-time bundle upsell + Premium add-on ─────────────────────────────
  /** User intent toggle — true when they tick "upgrade to the bundle". */
  private readonly upgradeBundleSignal = signal(false);
  /** User intent toggle — true when they tick the BITA paper-cert add-on. */
  private readonly addBitaSignal = signal(false);
  /** Resolved 100-workshop bundle event (for id + price), loaded on init. */
  private readonly bundleEvent = signal<VolunteerEvent | null>(null);

  /** True when the live cart already contains the 100-workshop bundle. */
  readonly cartHasBundle = computed(() => {
    const snap = this.cart.snapshot();
    if (!snap || snap.items.length === 0) {
      return false;
    }
    return snap.items.some((l) => l.event?.slug === PACKAGE_100_EVENT_SLUG);
  });

  /** True when the cart has at least one item AND no other package SKU. */
  readonly upsellEligible = computed(() => {
    const snap = this.cart.snapshot();
    if (!snap || snap.items.length === 0) {
      return false;
    }
    return !snap.items.some(
      (l) => l.event && ALL_PACKAGE_SLUGS.includes(l.event.slug) && l.event.slug !== PACKAGE_100_EVENT_SLUG,
    );
  });

  /** Upsell card is visible whenever the cart has items (no Pay-click gate). */
  readonly showUpsell = computed(
    () => this.upsellEligible() && (this.cart.snapshot()?.items.length ?? 0) > 0,
  );

  /**
   * Effective checkbox state for the upsell. When the bundle is already in
   * the cart it's pinned to true (the user is buying the bundle either way);
   * otherwise it reflects the user's choice.
   */
  readonly upgradeBundle = computed(() => this.cartHasBundle() || this.upgradeBundleSignal());

  /** True when the final order will include the 100-bundle. Drives BITA visibility. */
  readonly bundleInFinalOrder = computed(() => this.upgradeBundle());

  /** BITA premium add-on is offered only when the buyer will get the bundle. */
  readonly showBitaAddon = computed(() => this.bundleInFinalOrder());

  /** Effective checkbox state for the BITA add-on (auto-clears if upsell is off). */
  readonly addBitaCertificate = computed(
    () => this.showBitaAddon() && this.addBitaSignal(),
  );

  /** Fixed add-on price (must match CheckoutController::BITA_ADDON_PRICE on the backend). */
  private static readonly BITA_ADDON_PRICE = 30;

  /**
   * The Order Summary preview rows. Synthesises the displayed list from the
   * raw cart + the user's upsell / add-on choices so the right-hand panel
   * always matches what the buyer is about to pay for:
   *
   *  - Upgrade ticked (and bundle not already in cart) → real items hidden,
   *    a single virtual "100 Workshops Bundle" row replaces them.
   *  - BITA ticked → a virtual "BITA paper certificate" row is appended.
   *  - Toggling either off restores the original cart view.
   *
   * `kind: 'real'` rows keep their remove (×) button; virtual rows don't,
   * since the upsell / BITA checkboxes above are the canonical control.
   */
  readonly displayedSummaryItems = computed<SummaryRow[]>(() => {
    const snap = this.cart.snapshot();
    const rows: SummaryRow[] = [];

    if (this.upgradeBundle() && !this.cartHasBundle()) {
      const ev = this.bundleEvent();
      rows.push({
        key: 'synth-bundle',
        kind: 'bundle',
        title: ev?.title ?? this.i18n.t('checkout.upsellTitle'),
        price: ev?.price ?? 100,
        imageUrl: ev?.image_url ?? null,
        realLineId: null,
      });
    } else {
      for (const line of snap?.items ?? []) {
        rows.push({
          key: `real-${line.id}`,
          kind: 'real',
          title: line.event?.title ?? '—',
          price: Number(line.event?.price ?? 0),
          imageUrl: line.event?.image_url ?? null,
          realLineId: String(line.id),
        });
      }
    }

    if (this.addBitaCertificate()) {
      rows.push({
        key: 'synth-bita',
        kind: 'bita',
        title: this.i18n.t('checkout.bitaSummaryLine'),
        price: CheckoutPageComponent.BITA_ADDON_PRICE,
        imageUrl: null,
        realLineId: null,
      });
    }

    return rows;
  });

  /** Subtotal of the displayed rows excluding the BITA add-on (it sits in "Additional fees"). */
  readonly subtotalDisplay = computed(() =>
    this.displayedSummaryItems()
      .filter((r) => r.kind !== 'bita')
      .reduce((acc, r) => acc + r.price, 0),
  );

  /** Sum of extra fees (today: only the BITA add-on if selected). */
  readonly additionalFees = computed(() =>
    this.addBitaCertificate() ? CheckoutPageComponent.BITA_ADDON_PRICE : 0,
  );

  /** Final amount the buyer pays — bundle price if upgrading, else cart subtotal, plus any add-ons. */
  readonly effectiveTotal = computed(() => this.subtotalDisplay() + this.additionalFees());

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
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
  });

  constructor() {
    // Refresh first so we have an up-to-date snapshot, then fire the
    // Meta InitiateCheckout pixel once. Without this the funnel looks
    // broken in Pixel Helper: AddToCart fires on the home/event page,
    // PageView fires on the cart page, and nothing in between — making
    // it look like the AddToCart "disappeared" after navigation.
    this.cart.refresh().subscribe({
      next: (s) => this.fireInitiateCheckoutOnce(s),
      error: () => this.fireInitiateCheckoutOnce(this.cart.snapshot()),
    });
    // Resolve the 100-workshop bundle so the upsell can show its price + add it.
    this.events.bySlug(PACKAGE_100_EVENT_SLUG).subscribe({
      next: (ev) => this.bundleEvent.set(ev),
      error: () => {
        /* upsell falls back to copy-only pricing */
      },
    });
    window.addEventListener('message', this.onWindowMessage);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('message', this.onWindowMessage);
      this.stopPolling();
    });
  }

  private fireInitiateCheckoutOnce(snap: CartSnapshot | null): void {
    if (this.initiateCheckoutFired || !snap || snap.items.length === 0) {
      return;
    }
    this.initiateCheckoutFired = true;
    this.metaPixel.track('InitiateCheckout', {
      content_ids: snap.items
        .map((l) => l.event?.id)
        .filter((id): id is number => typeof id === 'number')
        .map(String),
      content_type: 'product',
      num_items: snap.item_count,
      value: snap.subtotal,
      currency: snap.currency || 'KWD',
    });
  }

  submit(): void {
    if (this.form.invalid || this.busy()) {
      return;
    }

    // Upgrade-to-bundle accepted but cart still holds individual workshops →
    // swap the cart to the bundle event first, then start payment.
    if (this.upgradeBundle() && !this.cartHasBundle()) {
      const ev = this.bundleEvent();
      if (ev) {
        this.busy.set(true);
        this.error.set(null);
        this.cart
          .clear()
          .pipe(switchMap(() => this.cart.addItem(ev.id, 1)))
          .subscribe({
            next: () => this.startPayment(),
            error: (err) => {
              this.error.set(this.checkoutErrorMessage(err));
              this.busy.set(false);
            },
          });
        return;
      }
      // Bundle didn't resolve — fall through and pay for the current cart.
    }

    this.startPayment();
  }

  /** Builds the order from the current cart and opens Tap. */
  private startPayment(): void {
    this.busy.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const customer_name = `${v.firstName.trim()} ${v.lastName.trim()}`.trim();
    const localDigits = (v.phone ?? '').replace(/\D+/g, '');
    const body = {
      customer_name,
      email: v.email,
      phone: localDigits ? `+965${localDigits}` : undefined,
      bita_addon: this.addBitaCertificate(),
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
      this.cart.clear().subscribe({ error: () => this.cart.clearLocalCart() });
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
      const body = err.error as { message?: string; code?: string } | null;
      if (err.status === 503 && body?.code === 'payments_disabled') {
        return this.i18n.t('checkout.paymentsDisabled');
      }
      if (body && typeof body.message === 'string' && body.message.length > 0) {
        return body.message;
      }
    }
    return this.i18n.t('checkout.failed');
  }

  toggleUpgrade(ev: Event): void {
    // Pinned to true when the cart already contains the bundle — the checkbox
    // is disabled in that case, but guard here too so a programmatic event
    // can't downgrade silently.
    if (this.cartHasBundle()) {
      return;
    }
    const checked = (ev.target as HTMLInputElement).checked;
    this.upgradeBundleSignal.set(checked);
    // Auto-clear the BITA tick if the user backs out of the bundle.
    if (!checked) {
      this.addBitaSignal.set(false);
    }
  }

  toggleBita(ev: Event): void {
    this.addBitaSignal.set((ev.target as HTMLInputElement).checked);
  }

  currencySuffix(currency: string): string {
    return this.i18n.currencyLabel(currency);
  }

  removeLine(line: CartLine): void {
    this.cart.removeItem(line.id).subscribe({ error: () => this.error.set(this.i18n.t('checkout.failed')) });
  }

  /** Remove handler bound to real-cart Summary rows (the synthesized bundle / BITA rows hide the X). */
  removeRealLine(lineId: string | null): void {
    if (!lineId) return;
    const id = Number(lineId);
    if (!Number.isFinite(id)) return;
    this.cart.removeItem(id).subscribe({ error: () => this.error.set(this.i18n.t('checkout.failed')) });
  }
}
