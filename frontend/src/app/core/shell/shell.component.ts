import { NgClass } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { cartIconBump } from '../animations/cart-animations';
import { routeFade } from '../animations/route-animations';
import { PROMO_HERO_IMAGE_URL } from '../constants/promo-hero';
import { I18nService } from '../i18n/i18n.service';
import type { Locale } from '../i18n/translations';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../services/cart.service';
import { CheckoutFlowService } from '../services/checkout-flow.service';
import { CartDrawerComponent } from './cart-drawer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgClass, RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  animations: [routeFade, cartIconBump],
  template: `
    <div class="flex min-h-dvh flex-col bg-[var(--ve-surface)]">
      <div class="sticky top-0 z-40 isolate flex shrink-0 flex-col">
      <div
        class="relative shrink-0 border-x-0 border-b border-white/10 bg-brand-900 text-white"
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
            class="shrink-0 rounded-sm border-0 bg-transparent px-0.5 text-inherit underline decoration-dotted decoration-white/90 underline-offset-[3px] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
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
          <a routerLink="/" class="group flex shrink-0 items-center">
            <img
              src="/images/branding/next-levels-logo.png"
              alt=""
              class="w-auto shrink-0 object-contain object-start transition-[height,max-width] duration-300"
              [ngClass]="
                headerCompact()
                  ? 'h-8 max-w-[9rem] sm:max-w-[9.5rem]'
                  : 'h-9 max-w-[10.5rem] sm:h-10 sm:max-w-[11.5rem] md:max-w-[12.5rem]'
              "
              width="180"
              height="48"
              fetchpriority="high"
            />
          </a>

          <nav class="hidden items-center gap-1 text-sm font-medium text-ink-600 md:flex md:gap-4 lg:gap-5">
            <a
              routerLink="/"
              routerLinkActive="relative text-brand-900 after:pointer-events-none after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="relative rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.home') }}</a
            >
            <a
              routerLink="/"
              fragment="workshops"
              class="relative rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.workshops') }}</a
            >
            <a
              routerLink="/"
              fragment="trainers"
              class="relative rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.trainers') }}</a
            >
            <a
              routerLink="/faq"
              routerLinkActive="relative text-brand-900 after:pointer-events-none after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand-600"
              class="relative rounded-lg px-2 py-1 transition hover:text-brand-900"
              >{{ i18n.t('nav.faq') }}</a
            >
          </nav>

          <div class="flex items-center gap-0.5 sm:gap-1 md:gap-1.5" dir="ltr">
            @if (!auth.isAuthenticated()) {
              <a
                routerLink="/login"
                class="ve-focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-2 text-xs font-bold text-brand-900 shadow-none transition hover:bg-slate-100 sm:px-3.5"
              >
                <span class="max-w-[7.5rem] truncate sm:max-w-none">{{ i18n.t('nav.studentLogin') }}</span>
                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.75"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                  />
                </svg>
              </a>
            }

            <span [@cartIconBump]="cart.itemCount()" class="inline-flex">
              <button
                type="button"
                (click)="cart.toggleDrawer()"
                class="ve-focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-900 transition-colors hover:bg-slate-100"
                [attr.aria-label]="i18n.t('cart.title')"
              >
                <svg class="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
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
              class="ve-focus-ring hidden h-9 w-9 items-center justify-center rounded-lg text-brand-900 transition-colors hover:bg-slate-100 md:inline-flex"
              [attr.aria-label]="i18n.t('nav.searchAria')"
              (click)="onSearchClick()"
            >
              <svg class="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            @if (auth.isAuthenticated()) {
              <div class="relative hidden md:block">
                <button
                  type="button"
                  (click)="userMenuOpen.set(!userMenuOpen()); langMenuOpen.set(false)"
                  class="ve-focus-ring flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 py-1 pe-2.5 ps-1 transition-all hover:border-slate-300 hover:bg-slate-100"
                >
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-800 to-brand-900 text-xs font-bold text-white shadow-sm"
                  >
                    {{ userInitial() }}
                  </span>
                  <span class="max-w-[100px] truncate text-sm font-medium text-brand-900">{{ auth.user()?.name }}</span>
                  <svg
                    class="h-4 w-4 shrink-0 text-brand-900/50 transition-transform"
                    [class.rotate-180]="userMenuOpen()"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <div class="fixed inset-0 z-40" (click)="userMenuOpen.set(false)"></div>

                  <div
                    class="absolute end-0 top-full z-50 mt-2 w-64 rounded-2xl border border-ink-100 bg-white py-2 shadow-xl shadow-ink-200/30 animate-ve-slide-down"
                  >
                    <div class="border-b border-ink-100 px-4 py-3">
                      <div class="flex items-center gap-3">
                        <span
                          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-900 text-sm font-bold text-white shadow-sm"
                        >
                          {{ userInitial() }}
                        </span>
                        <div class="min-w-0">
                          <span class="block truncate text-sm font-semibold text-ink-900">{{ auth.user()?.name }}</span>
                          <span class="block truncate text-xs text-ink-400">{{ auth.user()?.email }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="py-1.5">
                      <a
                        routerLink="/dashboard"
                        (click)="userMenuOpen.set(false)"
                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        <svg class="h-[18px] w-[18px] text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                            d="M4 6h16M4 12h16M4 18h7"
                          />
                        </svg>
                        {{ i18n.t('nav.myWorkshops') }}
                      </a>
                      <a
                        routerLink="/"
                        fragment="workshops"
                        (click)="userMenuOpen.set(false)"
                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        <svg class="h-[18px] w-[18px] text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        {{ i18n.t('nav.browseWorkshops') }}
                      </a>
                      <a
                        routerLink="/change-password"
                        (click)="userMenuOpen.set(false)"
                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        <svg class="h-[18px] w-[18px] text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                            d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                          />
                        </svg>
                        {{ i18n.t('nav.changePassword') }}
                      </a>
                    </div>

                    <div class="border-t border-ink-100 pb-0.5 pt-1.5">
                      <button
                        type="button"
                        (click)="userMenuOpen.set(false); auth.logout()"
                        class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {{ i18n.t('nav.signOut') }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

            <div class="relative">
              <button
                type="button"
                id="ve-lang-menu-button"
                class="ve-focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-900 transition-colors hover:bg-slate-100"
                [attr.aria-label]="i18n.t('nav.langAria')"
                [attr.aria-expanded]="langMenuOpen()"
                aria-haspopup="menu"
                aria-controls="ve-lang-menu"
                (click)="toggleLangMenu()"
              >
                <svg class="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 21a9 9 0 100-18 9 9 0 000 18z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.25 12h19.5M12 2.25c2.815 2.815 4.5 6.646 4.5 9.75s-1.685 6.935-4.5 9.75M12 2.25c-2.815 2.815-4.5 6.646-4.5 9.75s1.685 6.935 4.5 9.75"
                  />
                </svg>
              </button>

              @if (langMenuOpen()) {
                <div class="fixed inset-0 z-40" (click)="langMenuOpen.set(false)" aria-hidden="true"></div>
                <div
                  id="ve-lang-menu"
                  role="menu"
                  aria-labelledby="ve-lang-menu-button"
                  class="absolute end-0 top-full z-50 mt-1.5 min-w-[11rem] rounded-xl border border-ink-100 bg-white py-1 shadow-xl shadow-ink-200/30 animate-ve-slide-down"
                >
                  <button
                    type="button"
                    role="menuitemradio"
                    [attr.aria-checked]="i18n.locale() === 'ar'"
                    class="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start text-sm font-medium text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-900"
                    (click)="selectLocale('ar')"
                  >
                    <span>{{ i18n.t('nav.langOptionArabic') }}</span>
                    @if (i18n.locale() === 'ar') {
                      <svg class="h-4 w-4 shrink-0 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    [attr.aria-checked]="i18n.locale() === 'en'"
                    class="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start text-sm font-medium text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-900"
                    (click)="selectLocale('en')"
                  >
                    <span>{{ i18n.t('nav.langOptionEnglish') }}</span>
                    @if (i18n.locale() === 'en') {
                      <svg class="h-4 w-4 shrink-0 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </button>
                </div>
              }
            </div>
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

      <footer class="mt-auto shrink-0 border-t border-white/5 bg-[#020617] pt-16 pb-8 text-slate-300">
        <div class="mx-auto max-w-6xl px-4 md:px-8">
          <div class="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">

            <!-- Brand -->
            <div class="flex flex-col items-start lg:col-span-4">
              <img
                src="/images/branding/next-levels-logo.png"
                alt="Next Levels"
                class="mb-6 h-10 w-auto max-w-[12rem] object-contain"
                width="176"
                height="40"
                loading="lazy"
              />
              <p class="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">{{ i18n.t('footer.brand') }}</p>
              <div class="flex items-center gap-3">
                <a href="https://www.instagram.com/nextlevels.education/" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 -translate-y-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900" aria-label="Instagram">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61588054763784" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900" aria-label="Facebook">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="https://maps.app.goo.gl/rffCT3D3ynvPPdQH9" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900" aria-label="Google Maps">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="lg:col-span-4">
              <h3 class="mb-6 flex items-center gap-3 text-lg font-bold text-white">
                <span class="h-1 w-6 rounded-full bg-gold-400"></span>
                {{ i18n.t('footer.quick') }}
              </h3>
              <ul class="grid grid-cols-2 gap-x-4 gap-y-4">
                <li>
                  <a routerLink="/" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.linkHome') }}</a>
                </li>
                <li>
                  <a routerLink="/" fragment="workshops" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.linkWorkshops') }}</a>
                </li>
                <li>
                  <a routerLink="/" fragment="trainers" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.linkTrainers') }}</a>
                </li>
                <li>
                  <a routerLink="/faq" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.linkFaq') }}</a>
                </li>
                <li>
                  <a routerLink="/privacy" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.privacy') }}</a>
                </li>
                <li>
                  <a routerLink="/terms" class="text-sm text-slate-400 transition-colors hover:text-white">{{ i18n.t('footer.terms') }}</a>
                </li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="lg:col-span-4">
              <h3 class="mb-6 flex items-center gap-3 text-lg font-bold text-white">
                <span class="h-1 w-6 rounded-full bg-gold-400"></span>
                {{ i18n.t('footer.contact') }}
              </h3>
              <ul class="space-y-5">
                <li>
                  <a href="https://maps.app.goo.gl/rffCT3D3ynvPPdQH9" target="_blank" rel="noopener noreferrer" class="group flex items-start gap-4 text-slate-400">
                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-colors group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                      <svg class="h-4 w-4 text-slate-400 transition-colors group-hover:text-gold-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    </span>
                    <span class="mt-2 text-sm leading-relaxed transition-colors group-hover:text-white">{{ i18n.t('footer.contactAddress') }}</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+96599974367" class="group flex items-center gap-4 text-slate-400">
                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-colors group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                      <svg class="h-4 w-4 text-slate-400 transition-colors group-hover:text-gold-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                    </span>
                    <span dir="ltr" class="text-sm font-medium transition-colors group-hover:text-white">+965 9997 4367</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:info@nextlevels.education" class="group flex items-center gap-4 text-slate-400">
                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-colors group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                      <svg class="h-4 w-4 text-slate-400 transition-colors group-hover:text-gold-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    </span>
                    <span class="text-sm transition-colors group-hover:text-white">info&#64;nextlevels.education</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div class="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <p class="text-sm text-slate-500">{{ i18n.t('footer.copyrightNextLevel') }}</p>
            <a
              href="https://mediasolution.io"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
            >
              <span>{{ i18n.t('footer.mediaSolution') }}</span>
              <span class="font-bold transition-colors group-hover:text-gold-400">Media Solution</span>
            </a>
          </div>
        </div>
      </footer>

      <!-- Floating WhatsApp Chat Button -->
      <a
        href="https://api.whatsapp.com/send?phone=96599974367"
        target="_blank"
        rel="noopener noreferrer"
        class="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#20ba56] md:bottom-8 md:left-8"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      @if (promoModalOpen()) {
        <div
          class="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px]"
          role="presentation"
          (click)="closePromoModal()"
        ></div>
        <div
          class="fixed inset-0 z-[61] flex items-center justify-center overflow-y-auto p-4 sm:p-6 pointer-events-none"
          role="presentation"
        >
          <div
            class="pointer-events-auto my-auto w-full max-w-[min(100%,42rem)] overflow-hidden rounded-[20px] bg-white shadow-[0_28px_64px_-16px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="i18n.t('banner.promoAria')"
            (click)="$event.stopPropagation()"
          >
            <div class="relative aspect-[2/1] min-h-[13rem] w-full sm:aspect-[21/9] sm:min-h-[15rem] md:min-h-[16.5rem]">
              <img
                [src]="promoHeroUrl"
                alt=""
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-black/25"
                aria-hidden="true"
              ></div>
              <button
                type="button"
                class="ve-focus-ring absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-1 ring-ink-200/70 transition hover:bg-ink-50 hover:text-brand-800"
                (click)="closePromoModal()"
                [attr.aria-label]="i18n.t('banner.modalCloseAria')"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p
                class="absolute start-3 top-3 max-w-[min(100%-5rem,14rem)] text-[11px] font-bold uppercase leading-snug tracking-wide text-white/95 drop-shadow-md sm:max-w-[16rem] sm:text-xs"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              >
                {{ i18n.t('banner.modalImageEyebrow') }}
              </p>
              <div
                class="absolute start-3 top-[3.25rem] flex flex-col gap-1.5 sm:top-14 sm:gap-2"
                aria-hidden="true"
              >
                @for (ic of promoModalIcons; track ic) {
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[0.95rem] shadow-md ring-1 ring-black/10 sm:h-9 sm:w-9"
                    >{{ ic }}</span
                  >
                }
              </div>
              <div
                class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-4 pb-5 pt-16 sm:pb-6 sm:pt-20"
                aria-hidden="true"
              ></div>
              <p
                class="absolute inset-x-0 bottom-0 px-4 pb-5 pt-10 text-center text-xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:pb-6 sm:text-2xl"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
              >
                {{ i18n.t('banner.modalHeroBanner') }}
              </p>
            </div>
            <div class="space-y-4 px-5 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-6" [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'">
              <p class="text-center text-sm leading-relaxed text-ink-600">
                {{ i18n.t('banner.modalBody') }}
              </p>
              <div class="rounded-xl bg-slate-100 px-4 py-4 shadow-inner shadow-black/[0.03]" dir="ltr">
                <div class="flex items-end justify-between gap-3">
                  <span
                    class="inline-flex shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-sm ring-1 ring-emerald-200/80"
                    >{{ i18n.t('workshops.promoSavePct') }}</span
                  >
                  <div class="min-w-0 text-end">
                    <div class="text-sm font-medium text-ink-400 line-through">{{
                      i18n.t('workshops.promoPriceWas')
                    }}</div>
                    <div class="text-[1.75rem] font-black leading-none tracking-tight text-brand-900 sm:text-[2rem]">
                      {{ i18n.t('workshops.promoPrice') }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="rounded-xl border border-pink-200 bg-white px-3 py-3.5 shadow-sm sm:px-4" dir="ltr">
                <div class="flex items-center justify-between gap-2.5 text-sm leading-snug text-ink-700">
                  <span
                    class="inline-flex shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-600 ring-1 ring-pink-200/90"
                    >{{ i18n.t('workshops.promoInterestFree') }}</span
                  >
                  <p class="min-w-0 flex-1 px-1 text-center">
                    {{ i18n.t('workshops.promoInstallmentPrefix') }}
                    <span class="font-bold text-pink-600">{{ i18n.t('workshops.promoInstallmentAmount') }}</span>
                  </p>
                  <span class="h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-hidden="true"></span>
                </div>
              </div>
              <button
                type="button"
                class="ve-focus-ring flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#302b85] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#282266] active:scale-[0.99] motion-reduce:active:scale-100"
                [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
                (click)="onPromoModalCheckout()"
              >
                @if (i18n.isRtl()) {
                  <svg class="h-5 w-5 shrink-0 opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>{{ i18n.t('banner.modalCheckoutCta') }}</span>
                } @else {
                  <span>{{ i18n.t('banner.modalCheckoutCta') }}</span>
                  <svg class="h-5 w-5 shrink-0 opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <button
        type="button"
        class="fixed bottom-6 end-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-white shadow-lg shadow-brand-900/30 transition-all duration-300 ease-out hover:bg-brand-800 hover:shadow-xl active:scale-90 motion-reduce:transition-none"
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
  readonly userMenuOpen = signal(false);
  readonly langMenuOpen = signal(false);
  readonly showScrollTop = signal(false);
  readonly headerCompact = signal(false);

  userInitial(): string {
    return (this.auth.user()?.name ?? '?').charAt(0).toUpperCase();
  }
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
  onEscapeClose(): void {
    if (this.langMenuOpen()) {
      this.langMenuOpen.set(false);
    } else if (this.userMenuOpen()) {
      this.userMenuOpen.set(false);
    } else if (this.promoModalOpen()) {
      this.closePromoModal();
    }
  }

  toggleLangMenu(): void {
    const next = !this.langMenuOpen();
    this.langMenuOpen.set(next);
    if (next) {
      this.userMenuOpen.set(false);
    }
  }

  selectLocale(loc: Locale): void {
    this.i18n.setLocale(loc);
    this.langMenuOpen.set(false);
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
    this.langMenuOpen.set(false);
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
