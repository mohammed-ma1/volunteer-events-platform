import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { CartSnapshot } from '../models/api.types';

const STORAGE_KEY = 've_cart_token';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(this.readToken());
  readonly snapshot = signal<CartSnapshot | null>(null);
  readonly drawerOpen = signal(false);
  /** Briefly set after a successful add — UI can show per-item success (cards, detail). */
  readonly lastAddedEventId = signal<number | null>(null);

  readonly itemCount = computed(() => this.snapshot()?.item_count ?? 0);

  private clearAddedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const t = this.token();
    if (t) {
      this.refresh().subscribe({ error: () => this.clearLocalCart() });
    } else {
      this.snapshot.set(this.emptySnapshot());
    }
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  ensureCart(): Observable<void> {
    if (this.token()) {
      return of(void 0);
    }

    return this.http.post<{ token: string }>('v1/carts', {}).pipe(
      tap((res) => {
        this.token.set(res.token);
        localStorage.setItem(STORAGE_KEY, res.token);
      }),
      switchMap(() => of(void 0)),
    );
  }

  refresh(): Observable<CartSnapshot> {
    if (!this.token()) {
      const empty = this.emptySnapshot();
      this.snapshot.set(empty);

      return of(empty);
    }

    return this.http.get<CartSnapshot>('v1/cart').pipe(tap((s) => this.snapshot.set(s)));
  }

  private emptySnapshot(): CartSnapshot {
    return {
      token: '',
      items: [],
      currency: 'KWD',
      subtotal: 0,
      item_count: 0,
    };
  }

  addItem(eventId: number, quantity = 1): Observable<CartSnapshot> {
    return this.ensureCart().pipe(
      switchMap(() =>
        this.http.post<CartSnapshot>('v1/cart/items', { event_id: eventId, quantity }),
      ),
      tap((s) => {
        this.snapshot.set(s);
        this.lastAddedEventId.set(eventId);
        if (this.clearAddedTimer) {
          clearTimeout(this.clearAddedTimer);
        }
        this.clearAddedTimer = setTimeout(() => {
          this.lastAddedEventId.set(null);
          this.clearAddedTimer = null;
        }, 1100);
      }),
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartSnapshot> {
    return this.http
      .patch<CartSnapshot>(`v1/cart/items/${itemId}`, { quantity })
      .pipe(tap((s) => this.snapshot.set(s)));
  }

  removeItem(itemId: number): Observable<CartSnapshot> {
    return this.http
      .delete<CartSnapshot>(`v1/cart/items/${itemId}`)
      .pipe(tap((s) => this.snapshot.set(s)));
  }

  clear(): Observable<CartSnapshot> {
    return this.http.delete<CartSnapshot>('v1/cart').pipe(
      tap((s) => this.snapshot.set(s)),
    );
  }

  clearLocalCart(): void {
    this.token.set(null);
    this.snapshot.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}
