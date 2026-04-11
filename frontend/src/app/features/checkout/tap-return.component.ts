import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/i18n/i18n.service';
import { TAP_CHECKOUT_COMPLETE } from '../../core/payment/tap-messages';

/** One HTTP call per order id (iframe reloads / HMR were spamming mock-complete). */
const mockComplete$ = new Map<string, Observable<void>>();

function mockCompleteOnce(http: HttpClient, orderUuid: string): Observable<void> {
  let o = mockComplete$.get(orderUuid);
  if (!o) {
    o = http.post<unknown>(`v1/orders/${orderUuid}/mock-complete`, {}).pipe(
      map(() => undefined),
      catchError((err: HttpErrorResponse) => {
        const body = err.error as { message?: string } | null;
        const msg = (body && typeof body.message === 'string' ? body.message : null) ?? err.message;
        console.warn(`[tap-return] mock-complete HTTP ${err.status}: ${msg}`);
        return of(undefined);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    mockComplete$.set(orderUuid, o);
  }
  return o;
}

@Component({
  selector: 'app-tap-return',
  standalone: true,
  template: `
    <div class="mx-auto max-w-md px-4 py-16 text-center">
      <p class="text-sm text-ink-600">{{ i18n.t('tapReturn.finishing') }}</p>
    </div>
  `,
})
export class TapReturnComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly i18n = inject(I18nService);

  ngOnInit(): void {
    const order = this.route.snapshot.queryParamMap.get('order');
    const mock = this.route.snapshot.queryParamMap.get('mock');

    if (!order) {
      void this.router.navigate(['/checkout']);
      return;
    }

    const notifyParent = (): void => {
      if (window.parent !== window) {
        const payload = { type: TAP_CHECKOUT_COMPLETE, orderUuid: order };
        // Dev: parent may be https://*.trycloudflare.com while iframe is http://localhost — use *.
        const targetOrigin = environment.production ? window.location.origin : '*';
        window.parent.postMessage(payload, targetOrigin);
      } else {
        void this.router.navigate(['/checkout/complete'], {
          queryParams: {
            order,
            ...(mock ? { mock } : {}),
          },
        });
      }
    };

    if (mock === '1') {
      mockCompleteOnce(this.http, order).subscribe(() => notifyParent());
    } else {
      notifyParent();
    }
  }
}
