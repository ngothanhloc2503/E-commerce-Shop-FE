import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notSignedInGuard } from './not-signed-in.guard';

describe('notSignedInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notSignedInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
