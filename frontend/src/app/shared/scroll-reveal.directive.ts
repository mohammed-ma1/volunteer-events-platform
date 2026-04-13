import { Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/**
 * Fades/slides the host into view once when it crosses the viewport (respects reduced motion).
 * Includes a safety timeout so content is never permanently hidden.
 */
@Directive({
  selector: '[veScrollReveal]',
  standalone: true,
  host: {
    class: 've-scroll-reveal',
  },
})
export class ScrollRevealDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const prefersReduced =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      this.el.nativeElement.classList.add('ve-reveal-visible');
      return;
    }

    const root = this.el.nativeElement;

    this.fallbackTimer = setTimeout(() => {
      if (!root.classList.contains('ve-reveal-visible')) {
        root.classList.add('ve-reveal-visible');
      }
      this.observer?.disconnect();
      this.observer = null;
    }, 2500);

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            root.classList.add('ve-reveal-visible');
            this.cleanup();
            break;
          }
        }
      },
      { threshold: 0.04, rootMargin: '0px 0px 0px 0px' },
    );
    this.observer.observe(root);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
}
