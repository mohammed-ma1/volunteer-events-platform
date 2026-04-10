import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  const base = environment.apiUrl.replace(/\/$/, '');
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  const url = `${base}${path}`;

  return next(req.clone({ url }));
};
