import { Component, HostListener, inject, signal } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { cartIconBump } from '../animations/cart-animations';
import { routeFade } from '../animations/route-animations';
import { PROMO_HERO_IMAGE_URL } from '../constants/promo-hero';
import { I18nService } from '../i18n/i18n.service';
import { AuthService } from '../auth/auth.service';
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
      <div class="sticky top-0 z-40 isolate flex shrink-0 flex-col">
      <div
        class="relative shrink-0 border-x-0 border-b border-white/10 bg-[#0f1624] text-white"
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
        class="shrink-0 border-b border-ink-200/80 bg-white/90 backdrop-blur-md transition-[box-shadow] duration-300"
        [class.shadow-sm]="headerCompact()"
      >
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-[padding] duration-300 md:gap-6"
          [class.py-3]="!headerCompact()"
          [class.py-1.5]="headerCompact()"
          [class.md:py-4]="!headerCompact()"
          [class.md:py-2]="headerCompact()"
        >
          <a routerLink="/" class="group flex items-center gap-2.5">
            <svg
              class="shrink-0 text-[#0f172a] transition-[height,width] duration-300"
              [class.h-10]="!headerCompact()"
              [class.w-10]="!headerCompact()"
              [class.h-8]="headerCompact()"
              [class.w-8]="headerCompact()"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
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
              (click)="onSearchClick()"
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

            @if (auth.isAuthenticated()) {
              <a routerLink="/dashboard"
                 class="ve-focus-ring hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-brand-100 transition md:inline-flex">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                My Workshops
              </a>
              <button type="button" (click)="auth.logout()"
                      class="ve-focus-ring hidden rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-red-600 md:inline-flex"
                      aria-label="Logout">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            } @else {
              <a routerLink="/login"
                 class="ve-focus-ring hidden items-center gap-1.5 rounded-full bg-brand-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 transition shadow-sm md:inline-flex">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Sign In
              </a>
            }

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
      </div>

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

      <footer class="mt-auto shrink-0 border-t border-white/5 bg-[#0b1221] text-white">
        <div class="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-14">
          <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

            <div class="space-y-4">
              <svg
                class="h-14 w-14 shrink-0 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <p class="max-w-[17rem] text-sm leading-relaxed text-white/65">{{ i18n.t('footer.brand') }}</p>
              <div class="flex items-center gap-2.5 pt-1">
                <a href="#" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Twitter" (click)="$event.preventDefault()">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Instagram" (click)="$event.preventDefault()">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="#" class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="LinkedIn" (click)="$event.preventDefault()">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5H12v2.1h.06c.48-.9 1.66-1.85 3.42-1.85 3.66 0 4.34 2.4 4.34 5.52V24h-4v-6.84c0-1.63-.03-3.73-2.27-3.73-2.27 0-2.62 1.78-2.62 3.6V24h-4V8.5z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <p class="mb-4 text-sm font-bold">{{ i18n.t('footer.quick') }}</p>
              <ul class="space-y-3 text-sm text-white/65">
                <li>
                  <a routerLink="/" class="transition hover:text-white">{{ i18n.t('footer.linkHome') }}</a>
                </li>
                <li>
                  <a routerLink="/" fragment="workshops" class="transition hover:text-white">{{ i18n.t('footer.linkWorkshops') }}</a>
                </li>
                <li>
                  <a routerLink="/career" class="transition hover:text-white">{{ i18n.t('footer.linkCareer') }}</a>
                </li>
                <li>
                  <a routerLink="/login" class="transition hover:text-white">{{ i18n.t('footer.linkStudentLogin') }}</a>
                </li>
              </ul>
            </div>

            <div>
              <p class="mb-4 text-sm font-bold">{{ i18n.t('footer.contact') }}</p>
              <ul class="space-y-4 text-sm text-white/65">
                <li class="flex items-start gap-3">
                  <svg class="mt-0.5 h-5 w-5 shrink-0 text-white/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  <span>{{ i18n.t('footer.contactAddress') }}</span>
                </li>
                <li>
                  <a href="tel:+96512345678" class="flex items-center gap-3 transition hover:text-white">
                    <svg class="h-5 w-5 shrink-0 text-white/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                    <span>{{ i18n.t('footer.contactPhone') }}</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/96598765432" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 transition hover:text-white">
                    <svg class="h-5 w-5 shrink-0 text-white/40" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span>{{ i18n.t('footer.contactWhatsapp') }}</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:info@ku.edu.kw" class="flex items-center gap-3 transition hover:text-white">
                    <svg class="h-5 w-5 shrink-0 text-white/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    <span>{{ i18n.t('footer.contactEmail') }}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p class="mb-2 text-sm font-bold">{{ i18n.t('footer.newsletter') }}</p>
              <p class="mb-4 text-sm leading-relaxed text-white/55">{{ i18n.t('footer.newsletterHint') }}</p>
              <label class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                <svg class="h-4 w-4 shrink-0 text-white/35" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                <input
                  type="email"
                  class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  [placeholder]="i18n.t('footer.emailPlaceholder')"
                />
              </label>
            </div>

          </div>

          <div class="mt-10 border-t border-white/8 pt-6">
            <p class="text-center text-xs text-white/45">{{ i18n.t('footer.copyright') }}</p>
          </div>
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
              <span
                class="mx-auto flex w-fit items-center gap-2 rounded-full border border-ink-200/80 bg-ink-50/90 px-3 py-1.5 text-xs font-semibold text-ink-800"
              >
                <span class="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true"></span>
                {{ i18n.t('workshops.promoLimitedBadge') }}
              </span>
              <h2 class="text-center text-lg font-extrabold leading-tight tracking-tight text-brand-900 sm:text-xl">
                {{ i18n.t('workshops.promoTitle') }}
              </h2>
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

      <button
        type="button"
        class="fixed bottom-6 end-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-lg transition-all duration-300 ease-out hover:bg-[#1e293b] hover:shadow-xl active:scale-90 motion-reduce:transition-none"
        [class.scale-100]="showScrollTop()"
        [class.opacity-100]="showScrollTop()"
        [class.scale-0]="!showScrollTop()"
        [class.opacity-0]="!showScrollTop()"
        [class.pointer-events-none]="!showScrollTop()"
        [attr.aria-label]="'Scroll to top'"
        [attr.aria-hidden]="!showScrollTop()"
        [tabIndex]="showScrollTop() ? 0 : -1"
        (click)="scrollToTop()"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <app-cart-drawer />
    </div>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly checkoutFlow = inject(CheckoutFlowService);

  readonly promoModalOpen = signal(false);
  readonly showScrollTop = signal(false);
  readonly headerCompact = signal(false);
  readonly promoHeroUrl = PROMO_HERO_IMAGE_URL;

  /** Decorative icons on modal hero (design reference). */
  readonly promoModalIcons = ['📚', '💡', '👤', '🎤'] as const;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const y = window.scrollY;
    this.showScrollTop.set(y > 400);
    this.headerCompact.set(y > 60);
  }

  @HostListener('document:keydown.escape')
  onEscapeClosePromo(): void {
    if (this.promoModalOpen()) {
      this.closePromoModal();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchClick(): void {
    this.router.navigate(['/'], { fragment: 'workshops' }).then(() => {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('#workshop-search-input');
        if (input) {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => input.focus(), 350);
        }
      }, 100);
    });
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
