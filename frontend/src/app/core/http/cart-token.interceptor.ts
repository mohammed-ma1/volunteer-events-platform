import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CartService } from '../services/cart.service';

function needsCartTokenHeader(url: string): boolean {
  if (url.includes('/api/v1/checkout')) {
    return true;
  }
  if (url.includes('/api/v1/carts')) {
    return false;
  }

  return url.includes('/api/v1/cart');
}

export const cartTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cart = inject(CartService);
  const token = cart.token();

  if (!token || !needsCartTokenHeader(req.url)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { 'X-Cart-Token': token },
    }),
  );
};
