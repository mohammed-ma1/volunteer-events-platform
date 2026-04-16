import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-bold text-brand-900">{{ i18n.t('cart.title') }}</h1>
      <p class="mt-2 text-sm text-ink-600">{{ i18n.t('cart.reviewDetail') }}</p>

      <div class="mt-8 space-y-4">
        @if (cart.snapshot(); as snap) {
          @if (snap.items.length === 0) {
            <p class="rounded-2xl border border-ink-200 bg-white px-4 py-6 text-sm text-ink-600 shadow-sm">
              {{ i18n.t('cart.empty') }}
              <a routerLink="/" fragment="workshops" class="ms-1 font-semibold text-brand-700 hover:text-brand-900">{{
                i18n.t('cart.browseWorkshops')
              }}</a>
            </p>
          } @else {
            @for (line of snap.items; track line.id) {
              <div
                class="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div class="h-28 w-full overflow-hidden rounded-xl bg-ink-100 sm:h-24 sm:w-40">
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
                  <p class="font-semibold text-brand-900">{{ line.event?.title }}</p>
                  <p class="text-xs text-ink-500">{{ line.event?.starts_at | date: 'medium' }}</p>
                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="text-xs font-medium text-red-600 hover:text-red-700"
                      (click)="remove(line.id)"
                    >
                      {{ i18n.t('cart.remove') }}
                    </button>
                  </div>
                </div>
                <div class="text-end">
                  <p class="text-xs text-ink-500">{{ i18n.t('cart.lineTotal') }}</p>
                  <p class="text-lg font-bold text-brand-900">
                    {{ line.line_total | number: '1.0-3' }} {{ i18n.currencyLabel(snap.currency) }}
                  </p>
                </div>
              </div>
            }

            <div
              class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-ink-50/80 px-6 py-4"
            >
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-ink-500">{{ i18n.t('cart.subtotal') }}</p>
                <p class="text-2xl font-bold text-brand-900">
                  {{ snap.subtotal | number: '1.0-3' }} {{ i18n.currencyLabel(snap.currency) }}
                </p>
              </div>
              <a
                routerLink="/checkout"
                class="ve-btn-primary ve-btn-primary--lg"
              >
                {{ i18n.t('cart.checkout') }}
              </a>
            </div>
          }
        } @else {
          <p class="text-sm text-ink-600">{{ i18n.t('cart.loading') }}</p>
        }
      </div>
    </div>
  `,
})
export class CartPageComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  constructor() {
    this.cart.refresh().subscribe();
  }

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
