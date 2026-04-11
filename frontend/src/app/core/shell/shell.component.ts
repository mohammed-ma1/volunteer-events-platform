import { Component, inject } from '@angular/core';
import { PRIMARY_OUTLET, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { cartIconBump } from '../animations/cart-animations';
import { routeFade } from '../animations/route-animations';
import { I18nService } from '../i18n/i18n.service';
import { CartService } from '../services/cart.service';
import { CartDrawerComponent } from './cart-drawer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CartDrawerComponent],
  animations: [routeFade, cartIconBump],
  template: `
    <div class="relative min-h-screen bg-[var(--ve-surface)]">
      <header
        class="sticky top-0 z-30 border-b border-ink-200/80 bg-white/90 backdrop-blur-md"
      >
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-6 md:py-4"
        >
          <a routerLink="/" class="group flex items-center gap-2.5">
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white shadow-sm"
              aria-hidden="true"
              >📖</span
            >
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

      <main class="mx-auto max-w-6xl px-4 pb-8 pt-6 md:pb-12 md:pt-8">
        <div class="relative min-h-[40vh]" [@routeFade]="animationKey()">
          <router-outlet />
        </div>
      </main>

      <footer class="border-t border-brand-900/20 bg-brand-900 text-white">
        <div class="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div class="space-y-3">
              <div class="h-10 w-10 rounded-lg bg-white/20" aria-hidden="true"></div>
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

      <app-cart-drawer />
    </div>
  `,
})
export class ShellComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

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
