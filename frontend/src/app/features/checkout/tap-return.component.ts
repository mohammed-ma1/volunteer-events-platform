import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TAP_CHECKOUT_COMPLETE } from '../../core/payment/tap-messages';

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
        window.parent.postMessage(payload, window.location.origin);
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
      this.http.post(`v1/orders/${order}/mock-complete`, {}).subscribe({
        next: () => notifyParent(),
        error: () => notifyParent(),
      });
    } else {
      notifyParent();
    }
  }
}
