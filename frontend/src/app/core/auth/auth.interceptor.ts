import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;

const NEEDS_AUTH = ['/v1/auth/me', '/v1/auth/logout', '/v1/auth/refresh', '/v1/learn/'];

function needsAuthHeader(url: string): boolean {
  return NEEDS_AUTH.some(p => url.includes(p));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token && needsAuthHeader(req.url)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        needsAuthHeader(req.url) &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register') &&
        !req.url.includes('/auth/refresh')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          return auth.refreshToken().pipe(
            switchMap(res => {
              isRefreshing = false;
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access_token}` } }));
            }),
            catchError(refreshErr => {
              isRefreshing = false;
              auth.logout();
              return throwError(() => refreshErr);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
