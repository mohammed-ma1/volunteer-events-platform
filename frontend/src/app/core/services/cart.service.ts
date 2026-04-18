import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { CartSnapshot } from '../models/api.types';

const STORAGE_KEY = 've_cart_token';
/** Last known cart from API — survives refresh/navigation if the server round-trip fails briefly. */
const SNAPSHOT_STORAGE_KEY = 've_cart_snapshot';

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
      const cached = this.readCachedSnapshot(t);
      this.snapshot.set(cached ?? this.emptySnapshot());
      queueMicrotask(() => this.hydrateFromServer());
    } else {
      this.snapshot.set(this.emptySnapshot());
      this.clearSnapshotStorage();
    }
  }

  /** Load server state; keep local token + cached lines unless the cart no longer exists (404). */
  private hydrateFromServer(): void {
    if (!this.token()) {
      return;
    }
    this.refresh().subscribe({
      error: (err: unknown) => {
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 404) {
          this.clearLocalCart();
        }
      },
    });
  }

  private readCachedSnapshot(cartToken: string): CartSnapshot | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const s = JSON.parse(raw) as CartSnapshot;
      if (!s || typeof s !== 'object' || s.token !== cartToken || !Array.isArray(s.items)) {
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  private clearSnapshotStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  }

  private applySnapshot(s: CartSnapshot): void {
    this.snapshot.set(s);
    const t = this.token();
    if (t && s.token === t && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(s));
      } catch {
        /* storage full — cart still works in-memory */
      }
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

    return this.http.get<CartSnapshot>('v1/cart').pipe(tap((s) => this.applySnapshot(s)));
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
        this.applySnapshot(s);
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
      .pipe(tap((s) => this.applySnapshot(s)));
  }

  removeItem(itemId: number): Observable<CartSnapshot> {
    return this.http
      .delete<CartSnapshot>(`v1/cart/items/${itemId}`)
      .pipe(tap((s) => this.applySnapshot(s)));
  }

  clear(): Observable<CartSnapshot> {
    return this.http.delete<CartSnapshot>('v1/cart').pipe(
      tap((s) => this.applySnapshot(s)),
    );
  }

  clearLocalCart(): void {
    this.token.set(null);
    this.snapshot.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.clearSnapshotStorage();
  }

  private readToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }
}
