import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

/** Sends Accept-Language on `/v1/*` requests so Laravel can localize JSON messages (e.g. forgot-password). */
export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/v1/')) {
    return next(req);
  }

  const i18n = inject(I18nService);
  const value =
    i18n.locale() === 'ar' ? 'ar-KW,ar;q=0.9,en;q=0.5' : 'en-US,en;q=0.9,ar;q=0.3';

  return next(req.clone({ setHeaders: { 'Accept-Language': value } }));
};
