import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

/**
 * Wraps the Meta (Facebook) Pixel so the rest of the app calls a typed,
 * Angular-friendly API instead of touching `window.fbq` directly.
 *
 * - `init()` is a no-op when `environment.metaPixelId` is empty (e.g. in dev).
 * - `track()` is a no-op when fbq isn't loaded (adblocker, dev, SSR).
 * - SPA route changes don't trigger Meta's auto PageView, so we re-fire it
 *   on every Router `NavigationEnd`.
 */
@Injectable({ providedIn: 'root' })
export class MetaPixelService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private initialized = false;

  init(): void {
    if (this.initialized) {
      return;
    }
    const pixelId = environment.metaPixelId;
    if (!pixelId) {
      return;
    }
    if (typeof window === 'undefined' || typeof this.document === 'undefined') {
      return;
    }

    this.injectLoader();

    const fbq = window.fbq;
    if (!fbq) {
      return;
    }
    fbq('init', pixelId);
    fbq('track', 'PageView');
    this.initialized = true;

    this.router.events
      .pipe(filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd))
      .subscribe(() => {
        window.fbq?.('track', 'PageView');
      });
  }

  track(event: string, params?: Record<string, unknown>): void {
    if (typeof window === 'undefined') {
      return;
    }
    const fbq = window.fbq;
    if (!fbq) {
      return;
    }
    if (params) {
      fbq('track', event, params);
    } else {
      fbq('track', event);
    }
  }

  /** Standard Meta Pixel loader snippet, ported to TS. Defines `window.fbq`. */
  private injectLoader(): void {
    if (window.fbq) {
      return;
    }
    const fbq: FbqFn = function (this: FbqFn, ...args: unknown[]): void {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue?.push(args);
      }
    } as FbqFn;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    if (!window._fbq) {
      window._fbq = fbq;
    }

    const script = this.document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const first = this.document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
  }
}
