import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { SecurityService } from "../../Services/security.service";


// Intercepts HTTP requests before they are sent to the API
export const authInterceptor: HttpInterceptorFn = (

    // The HTTP request
    req: HttpRequest<any>,

    // Sends the request to the next step
    next: HttpHandlerFn

) => {

    // Inject SecurityService
    const securityService = inject(SecurityService);


    // Get JWT from LocalStorage
    const token = securityService.getToken();


    // Only add Authorization if a token exists
    if (token) {

        // Clone the request because HttpRequest is immutable
        req = req.clone({

            // Add JWT to the Authorization header
            setHeaders: {
                'Authorization': `Bearer ${token}`
            }

        });
    }


    // Continue sending the request
    return next(req);
}