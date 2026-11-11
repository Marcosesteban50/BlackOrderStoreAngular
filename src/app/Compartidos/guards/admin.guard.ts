import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SecurityService } from "../../Services/security.service";

export const AdminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const securityService = inject(SecurityService);

  if (securityService.hasRole('Admin')) {
    return true;
  }

  router.navigate(['']);

  return true;


}