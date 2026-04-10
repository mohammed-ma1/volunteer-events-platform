import { animate, keyframes, style, transition, trigger } from '@angular/animations';

/** Runs when the bound numeric state increases (e.g. cart item count). */
export const cartIconBump = trigger('cartIconBump', [
  transition(
    ':increment',
    [
      animate(
        '520ms cubic-bezier(0.34, 1.45, 0.64, 1)',
        keyframes([
          style({ transform: 'scale(1) rotate(0deg)', offset: 0 }),
          style({ transform: 'scale(1.12) rotate(-6deg)', offset: 0.25 }),
          style({ transform: 'scale(1.08) rotate(5deg)', offset: 0.45 }),
          style({ transform: 'scale(1) rotate(0deg)', offset: 1 }),
        ]),
      ),
    ],
  ),
]);
