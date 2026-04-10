import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckoutResponse, OrderSummary } from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);

  startCheckout(
    body: { email: string; customer_name: string; phone?: string },
    idempotencyKey: string,
    checkoutLocale: 'ar' | 'en',
  ): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('v1/checkout', body, {
      headers: {
        'Idempotency-Key': idempotencyKey,
        'X-Checkout-Locale': checkoutLocale,
      },
    });
  }

  getOrder(uuid: string): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`v1/orders/${uuid}`);
  }

  /** Calls Tap GET /v2/charges/{id} server-side and returns the updated order. */
  syncOrderWithTap(uuid: string): Observable<OrderSummary> {
    return this.http.post<OrderSummary>(`v1/orders/${uuid}/sync-tap`, {});
  }
}
