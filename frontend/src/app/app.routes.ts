import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/events/events-home.component').then((m) => m.EventsHomeComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/pages/about-page.component').then((m) => m.AboutPageComponent),
      },
      {
        path: 'facilitator-workshops',
        loadComponent: () =>
          import('./features/events/facilitator-workshops-page.component').then(
            (m) => m.FacilitatorWorkshopsPageComponent,
          ),
      },
      {
        path: 'career',
        loadComponent: () =>
          import('./features/pages/career-page.component').then((m) => m.CareerPageComponent),
      },
      {
        path: 'events/:slug',
        loadComponent: () =>
          import('./features/events/event-detail.component').then((m) => m.EventDetailComponent),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/cart-page.component').then((m) => m.CartPageComponent),
      },
      // Longer `checkout/...` paths MUST come before `checkout` — otherwise `/checkout/tap-return`
      // matches `checkout` first and the leftover segment has no child outlet (NG04002).
      {
        path: 'checkout/tap-return',
        loadComponent: () =>
          import('./features/checkout/tap-return.component').then((m) => m.TapReturnComponent),
      },
      {
        path: 'checkout/failed',
        loadComponent: () =>
          import('./features/checkout/checkout-failed.component').then((m) => m.CheckoutFailedComponent),
      },
      {
        path: 'checkout/complete',
        loadComponent: () =>
          import('./features/checkout/checkout-complete.component').then((m) => m.CheckoutCompleteComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent),
      },
    ],
  },
];
