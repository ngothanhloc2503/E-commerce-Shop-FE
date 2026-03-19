import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

export const notSignedInGuard: CanActivateFn = (route, state) => {
  const router = inject( Router );

  if (StorageService.isStaffLoggedIn() || StorageService.isCustomerLoggedIn()) {
    return router.navigateByUrl("/");
  }

  return true;
};
