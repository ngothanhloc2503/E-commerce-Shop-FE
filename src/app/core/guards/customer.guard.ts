import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state/auth-state.service';

export const customerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStateService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isCustomer()) {
    return true;
  }

  return router.parseUrl('/staff');
};
