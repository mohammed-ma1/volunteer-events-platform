import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { I18nService } from '../i18n/i18n.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('280ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('drawerSlide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0.5 }),
        animate('320ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(100%)', opacity: 0.5 })),
      ]),
    ]),
  ],
  template: `
    @if (cart.drawerOpen()) {
      <div
        @backdropFade
        class="fixed inset-0 z-40 bg-brand-900/40 backdrop-blur-sm"
        (click)="cart.closeDrawer()"
        role="presentation"
      ></div>

      <aside
        @drawerSlide
        class="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col border-s border-ink-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="i18n.t('cart.title')"
      >
        <div class="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <div>
            <p class="text-lg font-bold text-brand-900">{{ i18n.t('cart.title') }}</p>
            <p class="text-sm text-ink-500">
              {{ cart.itemCount() }} {{ i18n.t('cart.subtitle') }}
            </p>
          </div>
          <button
            type="button"
            class="ve-focus-ring rounded-full border border-ink-200 px-3 py-1 text-sm font-medium text-brand-900 transition hover:bg-ink-50"
            (click)="cart.closeDrawer()"
          >
            {{ i18n.t('cart.close') }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4">
          @if (cart.snapshot(); as snap) {
            @if (snap.items.length) {
              <ul class="space-y-4">
                @for (line of snap.items; track line.id) {
                  <li class="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
                    <div class="flex gap-3">
                      <div class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-200">
                        @if (line.event?.image_url) {
                          <img
                            [src]="line.event!.image_url!"
                            [alt]="line.event!.title"
                            loading="lazy"
                            class="h-full w-full object-cover"
                          />
                        }
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-semibold text-brand-900">{{ line.event?.title }}</p>
                        <p class="text-xs text-ink-500">
                          {{ line.event?.starts_at | date: 'mediumDate' }}
                        </p>
                        <div class="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            class="rounded-lg border border-ink-200 px-2 py-0.5 text-xs text-brand-900 hover:bg-white"
                            (click)="bump(line.id, line.quantity - 1)"
                            [disabled]="line.quantity <= 1"
                          >
                            −
                          </button>
                          <span class="text-sm font-medium text-brand-900">{{ line.quantity }}</span>
                          <button
                            type="button"
                            class="rounded-lg border border-ink-200 px-2 py-0.5 text-xs text-brand-900 hover:bg-white"
                            (click)="bump(line.id, line.quantity + 1)"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            class="ms-auto text-xs font-medium text-red-600 hover:text-red-700"
                            (click)="remove(line.id)"
                          >
                            {{ i18n.t('cart.remove') }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-ink-600">{{ i18n.t('cart.empty') }}</p>
            }
          } @else {
            <p class="text-sm text-ink-600">{{ i18n.t('cart.loading') }}</p>
          }
        </div>

        <div class="border-t border-ink-200 px-6 py-4">
          <div class="mb-3 flex items-center justify-between text-sm text-ink-600">
            <span>{{ i18n.t('cart.subtotal') }}</span>
            <span class="font-bold text-brand-900">
              {{ cart.snapshot()?.subtotal ?? 0 | number: '1.0-3' }}
              {{ i18n.currencyLabel(cart.snapshot()?.currency) }}
            </span>
          </div>
          <a
            routerLink="/checkout"
            class="block w-full rounded-xl bg-brand-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 ve-focus-ring"
            (click)="cart.closeDrawer()"
          >
            {{ i18n.t('cart.checkout') }}
          </a>
          <a
            routerLink="/cart"
            class="mt-2 block text-center text-xs font-medium text-brand-700 hover:text-brand-900"
            (click)="cart.closeDrawer()"
          >
            {{ i18n.t('cart.viewFull') }}
          </a>
        </div>
      </aside>
    }
  `,
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  bump(id: number, quantity: number): void {
    if (quantity < 1) {
      return;
    }
    this.cart.updateQuantity(id, quantity).subscribe();
  }

  remove(id: number): void {
    this.cart.removeItem(id).subscribe();
  }
}
