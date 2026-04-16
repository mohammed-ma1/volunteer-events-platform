import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { PACKAGE_100_EVENT_SLUG } from '../constants/package-offer';
import { CartService } from './cart.service';
import { EventsService } from './events.service';

@Injectable({ providedIn: 'root' })
export class CheckoutFlowService {
  private readonly cart = inject(CartService);
  private readonly events = inject(EventsService);
  private readonly router = inject(Router);

  /** Loads the package event from the API, adds one seat to cart, then opens checkout. */
  startPackage100Checkout(onError?: () => void): void {
    this.startPackageCheckout(PACKAGE_100_EVENT_SLUG, onError);
  }

  /** Generic: resolve any package slug, add to cart, navigate to checkout. */
  startPackageCheckout(slug: string, onError?: () => void): void {
    this.events.bySlug(slug).pipe(switchMap((ev) => this.cart.addItem(ev.id, 1))).subscribe({
      next: () => void this.router.navigate(['/checkout']),
      error: () => {
        onError?.();
        void this.router.navigate(['/checkout']);
      },
    });
  }

  /** Adds workshop to cart then navigates to checkout. Demo/offline cards (negative id) still open checkout. */
  startEventCheckout(eventId: number, eventSlug: string): void {
    if (eventId < 0) {
      void this.router.navigate(['/checkout']);
      return;
    }
    this.cart.addItem(eventId, 1).subscribe({
      next: () => void this.router.navigate(['/checkout']),
      error: () => void this.router.navigate(['/checkout']),
    });
  }
}
