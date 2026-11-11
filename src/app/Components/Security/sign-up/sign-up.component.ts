import { Component, inject } from '@angular/core';
import { SecurityService } from '../../../Services/security.service';
import { Router } from '@angular/router';
import { UserCredentialsDTO } from '../../../Models/Security/securityDTO';
import { CartService } from '../../../Services/cart.service';
import { AuthenticationSignUpFormComponent } from '../authentication-sign-up-form/authentication-sign-up-form.component';
import { GoogleLoginComponent } from '../../google-login/google-login.component';


@Component({
  selector: 'app-sign-up',
  imports: [AuthenticationSignUpFormComponent, GoogleLoginComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  private securityService = inject(SecurityService);
  private cartService = inject(CartService);
  private router = inject(Router);
  errors: string[] = [];


  register(creds: UserCredentialsDTO) {
    this.securityService.register(creds).subscribe({
      next: () => {
        this.cartService.syncLocalCartToServer().subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            console.error('Error syncing guest cart after sign-up:', err);
            this.errors = ['Your account was created, but your cart could not be synced.'];
          },
        });
      },
      error: err => {
        console.error('Error al registrarse:', err.status, err.error);
        if (err.status === 400) {
          this.errors = ['Email or password wrong'];
        } else if (err.status === 0) {
          this.errors = ['server error'];
        } else {
          this.errors = ['Error while triying to sign in'];
        }


      }
    })
  }



}
