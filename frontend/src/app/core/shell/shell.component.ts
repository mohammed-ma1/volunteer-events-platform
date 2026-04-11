import { Component, HostListener, inject, signal } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { cartIconBump } from '../animations/cart-animations';
import { routeFade } from '../animations/route-animations';
import { PROMO_HERO_IMAGE_URL } from '../constants/promo-hero';
import { I18nService } from '../i18n/i18n.service';
import { CartService } from '../services/cart.service';
import { CheckoutFlowService } from '../services/checkout-flow.service';
import { CartDrawerComponent } from './cart-drawer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  animations: [routeFade, cartIconBump],
  template: `
    <div class="flex min-h-dvh flex-col bg-[var(--ve-surface)]">
      <div
        class="relative z-40 shrink-0 border-x-0 border-b border-white/10 bg-[#0f1624] text-white"
        role="region"
        [attr.aria-label]="i18n.t('banner.promoAria')"
      >
        <div
          class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center text-xs font-semibold leading-snug sm:text-sm md:gap-3"
          [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
        >
          <span class="shrink-0 text-base leading-none motion-safe:animate-ve-float-slow" aria-hidden="true">🔥</span>
          <span class="min-w-0">{{ i18n.t('banner.promoMain') }}</span>
          <button
            type="button"
            class="ve-focus-ring shrink-0 rounded-sm px-0.5 text-inherit underline decoration-dotted decoration-white/90 underline-offset-[3px] transition hover:bg-white/10 hover:text-white"
            (click)="openPromoModal()"
          >
            {{ i18n.t('banner.promoDetails') }}
          </button>
        </div>
      </div>
      <header
        class="sticky top-0 z-30 shrink-0 border-b border-ink-200/80 bg-white/90 backdrop-blur-md"
      >
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-6 md:py-4"
        >
          <a routerLink="/" class="group flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt=""
              width="40"
              height="40"
              class="h-10 w-10 shrink-0 object-contain"
              aria-hidden="true"
            />
            <div class="hidden leading-tight sm:block">
              <p class="text-sm font-semibold text-brand-900">KU</p>
              <p class="text-xs text-ink-500">{{ i18n.t('hero.badge') }}</p>
            </div>
          </a>

          <nav
            class="hidden items-center gap-1 text-sm font-medium text-ink-600 md:flex md:gap-5"
          >
            <a
              routerLink="/"
              routerLinkActive="text-brand-900 after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:bg-brand-900 relative"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.home') }}</a
            >
            <a
              routerLink="/"
              fragment="workshops"
              class="rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.workshops') }}</a
            >
            <a
              routerLink="/facilitator-workshops"
              routerLinkActive="text-brand-900 after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:bg-brand-900 relative"
              class="rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.facilitatorWorkshops') }}</a
            >
            <a
              routerLink="/career"
              routerLinkActive="text-brand-900 after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:bg-brand-900 relative"
              class="rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.career') }}</a
            >
            <a
              routerLink="/about"
              routerLinkActive="text-brand-900 after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:bg-brand-900 relative"
              class="rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.about') }}</a
            >
          </nav>

          <div class="flex items-center gap-1.5 md:gap-2">
            <button
              type="button"
              class="ve-focus-ring hidden rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-brand-900 md:inline-flex"
              [attr.aria-label]="i18n.t('nav.searchAria')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <span [@cartIconBump]="cart.itemCount()" class="inline-flex">
              <button
                type="button"
                (click)="cart.toggleDrawer()"
                class="ve-focus-ring relative rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-brand-900"
                [attr.aria-label]="i18n.t('cart.title')"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                @if (cart.itemCount() > 0) {
                  <span
                    class="absolute end-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                    >{{ cart.itemCount() }}</span
                  >
                }
              </button>
            </span>

            <button
              type="button"
              (click)="i18n.toggleLocale()"
              class="ve-focus-ring ms-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-brand-900 hover:bg-ink-200/90"
            >
              {{ i18n.locale() === 'ar' ? i18n.t('nav.langShortEn') : i18n.t('nav.langShortAr') }}
            </button>
          </div>
        </div>
      </header>

      <main
        class="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 pb-8 pt-6 md:pb-12 md:pt-8"
      >
        <div
          class="relative isolate w-full flex-1 min-h-[min(50vh,24rem)] sm:min-h-[min(55vh,26rem)]"
          [@routeFade]="animationKey()"
        >
          <router-outlet />
        </div>
      </main>

      <footer class="mt-auto shrink-0 border-t border-brand-900/20 bg-brand-900 text-white">
        <div class="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div class="space-y-3">
              <img
                src="/favicon.svg"
                alt=""
                width="40"
                height="40"
                class="h-10 w-10 shrink-0 rounded-lg bg-white/10 p-1.5 object-contain brightness-0 invert"
                aria-hidden="true"
              />
              <p class="text-sm leading-relaxed text-white/85">{{ i18n.t('footer.brand') }}</p>
            </div>
            <div>
              <p class="mb-3 text-sm font-semibold">{{ i18n.t('footer.quick') }}</p>
              <ul class="space-y-2 text-sm text-white/80">
                <li>
                  <a routerLink="/" class="transition hover:text-white">{{ i18n.t('footer.linkHome') }}</a>
                </li>
                <li>
                  <a routerLink="/" fragment="workshops" class="transition hover:text-white">{{
                    i18n.t('footer.linkWorkshops')
                  }}</a>
                </li>
                <li>
                  <a routerLink="/facilitator-workshops" class="transition hover:text-white">{{
                    i18n.t('nav.facilitatorWorkshops')
                  }}</a>
                </li>
                <li>
                  <a routerLink="/career" class="transition hover:text-white">{{ i18n.t('footer.linkCareer') }}</a>
                </li>
                <li>
                  <a routerLink="/about" class="transition hover:text-white">{{ i18n.t('footer.linkAbout') }}</a>
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-3 text-sm font-semibold">{{ i18n.t('footer.policies') }}</p>
              <ul class="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" class="transition hover:text-white" (click)="$event.preventDefault()">{{
                    i18n.t('footer.terms')
                  }}</a>
                </li>
                <li>
                  <a href="#" class="transition hover:text-white" (click)="$event.preventDefault()">{{
                    i18n.t('footer.privacy')
                  }}</a>
                </li>
                <li>
                  <a href="#" class="transition hover:text-white" (click)="$event.preventDefault()">{{
                    i18n.t('footer.refund')
                  }}</a>
                </li>
                <li>
                  <a href="#" class="transition hover:text-white" (click)="$event.preventDefault()">{{
                    i18n.t('footer.contact')
                  }}</a>
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-2 text-sm font-semibold">{{ i18n.t('footer.newsletter') }}</p>
              <p class="mb-3 text-sm text-white/75">{{ i18n.t('footer.newsletterHint') }}</p>
              <div class="flex flex-wrap items-stretch gap-2">
                <input
                  type="email"
                  class="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  [placeholder]="i18n.t('footer.emailPlaceholder')"
                />
                <button
                  type="button"
                  class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-900 transition hover:bg-ink-100"
                >
                  {{ i18n.t('footer.subscribe') }}
                </button>
              </div>
            </div>
          </div>
          <p class="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/55">
            {{ i18n.t('footer.copyright') }}
          </p>
        </div>
      </footer>

      @if (promoModalOpen()) {
        <div
          class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
          role="presentation"
          (click)="closePromoModal()"
        ></div>
        <div
          class="fixed inset-0 z-[61] flex items-center justify-center overflow-y-auto p-4 sm:p-6 pointer-events-none"
          role="presentation"
        >
          <div
            class="pointer-events-auto my-auto w-full max-w-[26rem] overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="i18n.t('banner.promoAria')"
            (click)="$event.stopPropagation()"
          >
            <div class="relative aspect-[16/10] min-h-[11.5rem] w-full sm:aspect-[16/9] sm:min-h-[13rem]">
              <img
                [src]="promoHeroUrl"
                alt=""
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35"
                aria-hidden="true"
              ></div>
              <button
                type="button"
                class="ve-focus-ring absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-lg transition hover:bg-sky-700"
                (click)="closePromoModal()"
                [attr.aria-label]="i18n.t('banner.modalCloseAria')"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p
                class="absolute start-3 top-3 max-w-[58%] text-sm font-bold leading-snug tracking-tight text-white drop-shadow-md sm:text-[0.95rem]"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              >
                {{ i18n.t('banner.modalHeroTitle') }}
              </p>
              <div
                class="absolute start-2.5 top-[3.25rem] flex flex-col gap-1.5 sm:start-3 sm:top-14 sm:gap-2"
                aria-hidden="true"
              >
                @for (ic of promoModalIcons; track ic) {
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[0.95rem] shadow-md ring-1 ring-black/10 sm:h-9 sm:w-9"
                    >{{ ic }}</span
                  >
                }
              </div>
              <div
                class="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-white/10 bg-black px-4 py-2.5 text-xs font-semibold text-white sm:text-sm"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              >
                <span aria-hidden="true">🔥</span>
                <span>{{ i18n.t('banner.modalImageBarText') }}</span>
              </div>
            </div>
            <div class="space-y-5 px-6 pb-7 pt-6" [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'">
              <p class="text-center text-[0.8125rem] leading-relaxed text-ink-600 sm:text-sm">
                {{ i18n.t('banner.modalBody') }}
              </p>
              <div
                class="rounded-2xl border-2 border-sky-200/90 bg-gradient-to-b from-sky-50/90 to-white px-5 py-4 shadow-sm"
              >
                <div class="flex flex-wrap items-end justify-between gap-3">
                  <span class="text-[1.65rem] font-black leading-none tracking-tight text-blue-600 sm:text-3xl">{{
                    i18n.t('workshops.promoPrice')
                  }}</span>
                  <div class="flex flex-col items-end gap-1.5">
                    <span class="text-sm font-medium text-ink-400 line-through">{{
                      i18n.t('workshops.promoPriceWas')
                    }}</span>
                    <span
                      class="inline-flex rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm"
                      >{{ i18n.t('workshops.promoSavePct') }}</span
                    >
                  </div>
                </div>
              </div>
              <div
                class="rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/90 to-white px-4 py-4 shadow-sm"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-sm leading-snug text-ink-700">
                    {{ i18n.t('workshops.promoInstallmentPrefix') }}
                    <span class="font-bold text-pink-600">{{ i18n.t('workshops.promoInstallmentAmount') }}</span>
                  </p>
                  <div class="flex items-center gap-2 sm:shrink-0">
                    <span
                      class="inline-flex rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-bold text-pink-900 ring-1 ring-pink-200/80"
                      >{{ i18n.t('workshops.promoInterestFree') }}</span
                    >
                    <span class="h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden="true"></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="ve-focus-ring flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1a1f2e] px-5 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#121722] active:scale-[0.99]"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
                (click)="onPromoModalCheckout()"
              >
                <svg class="h-5 w-5 shrink-0 opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>{{ i18n.t('workshops.promoCta') }}</span>
              </button>
            </div>
          </div>
        </div>
      }

      <app-cart-drawer />
    </div>
  `,
})
export class ShellComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly checkoutFlow = inject(CheckoutFlowService);

  readonly promoModalOpen = signal(false);
  readonly promoHeroUrl = PROMO_HERO_IMAGE_URL;

  /** Decorative icons on modal hero (design reference). */
  readonly promoModalIcons = ['📚', '💡', '👤', '🎤'] as const;

  @HostListener('document:keydown.escape')
  onEscapeClosePromo(): void {
    if (this.promoModalOpen()) {
      this.closePromoModal();
    }
  }

  openPromoModal(): void {
    this.promoModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closePromoModal(): void {
    this.promoModalOpen.set(false);
    document.body.style.overflow = '';
  }

  onPromoModalCheckout(): void {
    this.closePromoModal();
    this.checkoutFlow.startPackage100Checkout();
  }

  /** Path only — omit `#fragment` so hash-only navigations do not re-run routeFade (invisible absolute layer would steal clicks). */
  animationKey(): string {
    const tree = this.router.parseUrl(this.router.url);
    const primary = tree.root.children[PRIMARY_OUTLET];
    if (!primary?.segments.length) {
      return '/';
    }
    return '/' + primary.segments.map((s) => s.path).join('/');
  }
}
