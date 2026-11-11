import { Component, inject } from '@angular/core';
import { UserCredentialsDTO } from '../../../Models/Security/securityDTO';
import { Router } from '@angular/router';
import { SecurityService } from '../../../Services/security.service';
import { CartService } from '../../../Services/cart.service';
import { AuthenticationSignInFormComponent } from '../authentication-sign-in-form/authentication-sign-in-form.component';
import { GoogleLoginComponent } from '../../google-login/google-login.component';
import { DiscordLoginComponent } from '../../discord-login/discord-login.component';

@Component({
  selector: 'app-sign-in',
  imports: [AuthenticationSignInFormComponent, GoogleLoginComponent, DiscordLoginComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

  private securityService = inject(SecurityService);
  private cartService = inject(CartService);
  // private cartService =inject(CartService);
  private router = inject(Router);
  errors: string[] = [];


  login(creds: UserCredentialsDTO) {
    this.securityService.login(creds).subscribe({
      next: () => {
        this.cartService.syncLocalCartToServer().subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            console.error('Error syncing guest cart after sign-in:', err);
            this.errors = ['You are signed in, but your cart could not be synced.'];
          },
        });
      },
      error: err => {
        console.log('Error', err);
        if (err.status === 400) {
          this.errors = ['Email o contraseña incorrectos'];
        } else if (err.status === 0) {
          this.errors = ['No se puede conectar con el servidor'];
        } else {
          this.errors = ['Error al iniciar sesión'];
        }

      }
    })
  }
}
