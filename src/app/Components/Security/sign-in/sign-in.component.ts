import { Component, inject } from '@angular/core';
import { UserCredentialsDTO } from '../../../Models/Security/securityDTO';
import { Router } from '@angular/router';
import { SecurityService } from '../../../Services/security.service';
import { AuthenticationSignInFormComponent } from '../authentication-sign-in-form/authentication-sign-in-form.component';

@Component({
  selector: 'app-sign-in',
  imports: [AuthenticationSignInFormComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

  private securityService = inject(SecurityService);
  // private cartService =inject(CartService);
  private router = inject(Router);
  errors: string[] = [];


  login(creds: UserCredentialsDTO) {
    this.securityService.login(creds).subscribe({
      next: () => {
        this.router.navigate(['/']);
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
