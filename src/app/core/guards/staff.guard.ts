import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

export const staffGuard: CanActivateFn = (route, state) => {
  const router = inject( Router );

  if (StorageService.isStaffLoggedIn()) {
    return true;
  }

  return router.navigateByUrl("/");
};
