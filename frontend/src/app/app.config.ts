import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeArKw from '@angular/common/locales/ar-KW';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiUrlInterceptor } from './core/http/api-url.interceptor';
import { cartTokenInterceptor } from './core/http/cart-token.interceptor';

// Register Arabic locale data so Angular's `date`/`number` pipes can format
// values with `ar` / `ar-KW` (e.g. "26 أبريل 2026", "٠٩:٣٠ ص").
registerLocaleData(localeAr);
registerLocaleData(localeArKw);

/** `index.html` uses root-relative favicon links; make them absolute so HTTPS tunnels match the page origin. */
function patchFaviconLinksToAbsoluteOrigin(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const origin = document.location.origin;
  if (!origin) {
    return;
  }
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((el) => {
    const href = el.getAttribute('href');
    if (!href?.startsWith('/') || href.startsWith('//')) {
      return;
    }
    el.setAttribute('href', `${origin}${href}`);
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => patchFaviconLinksToAbsoluteOrigin(),
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(withInterceptors([apiUrlInterceptor, authInterceptor, cartTokenInterceptor])),
  ],
};
