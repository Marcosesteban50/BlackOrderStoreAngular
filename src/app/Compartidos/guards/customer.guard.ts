import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SecurityService } from "../../Services/security.service";

export const CustomerGuard: CanActivateFn = (route, state) => {

    const router = inject(Router);
    const securityService = inject(SecurityService);

    if (!securityService.isLoggedIn() || !securityService.isCustomer()) {
        router.navigate(['/login']);
        return false;


    }

    router.navigate(['']);

    return true;
}
