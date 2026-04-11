import { animate, query, style, transition, trigger } from '@angular/animations';

/** Enter-only fade — avoids absolute :leave/:enter collapsing the router host (footer jump). */
export const routeFade = trigger('routeFade', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(
          '320ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'none' }),
        ),
      ],
      { optional: true },
    ),
  ]),
]);
