import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state/auth-state.service';

export const notSignedInGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/');
};
