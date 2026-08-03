import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * Blocks the public site while coming-soon mode is on, redirecting every guarded
 * route to the "available soon" landing page.
 */
export const comingSoonGuard: CanActivateFn = () => {
  if (!environment.comingSoon) {
    return true;
  }

  return inject(Router).createUrlTree(['/coming-soon']);
};
