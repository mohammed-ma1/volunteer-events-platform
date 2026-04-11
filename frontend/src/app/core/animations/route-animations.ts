import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const routeFade = trigger('routeFade', [
  transition('* => *', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
    query(
      ':enter',
      [style({ opacity: 0, transform: 'translateY(10px)', pointerEvents: 'none' })],
      { optional: true },
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '220ms ease-out',
            style({ opacity: 0, transform: 'translateY(-6px)', pointerEvents: 'none' }),
          ),
        ],
        {
          optional: true,
        },
      ),
      query(
        ':enter',
        [
          animate(
            '360ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'none', pointerEvents: 'auto' }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
