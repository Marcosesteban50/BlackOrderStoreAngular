import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SecurityService } from '../../Services/security.service';

export const SellerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const securityService = inject(SecurityService);

  if (securityService.isAdmin() || securityService.isSeller()) {
    return true;
  }

  return router.createUrlTree(['']);
};
