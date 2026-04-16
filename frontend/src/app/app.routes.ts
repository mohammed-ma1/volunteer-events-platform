import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Auth routes (full-page, outside shell)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  // Main shell
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
        path: 'faq',
        loadComponent: () =>
          import('./features/pages/faq-page.component').then((m) => m.FaqPageComponent),
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./features/pages/privacy-page.component').then((m) => m.PrivacyPageComponent),
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/pages/terms-page.component').then((m) => m.TermsPageComponent),
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
      // Learner routes (protected)
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/learn/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/change-password.component').then((m) => m.ChangePasswordComponent),
      },
      // Video player route kept for future use but not active
      // { path: 'learn/:eventId', canActivate: [authGuard], loadComponent: () => import('./features/learn/workshop-player.component').then((m) => m.WorkshopPlayerComponent) },
    ],
  },
];
