import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

export const signedInGuard: CanActivateFn = (route, state) => {
  const router = inject( Router );

  if (StorageService.isStaffLoggedIn() || StorageService.isCustomerLoggedIn()) {
    return true;
  }

  return router.navigateByUrl("/");
};
