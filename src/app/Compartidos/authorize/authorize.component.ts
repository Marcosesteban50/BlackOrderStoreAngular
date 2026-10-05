import { Component, inject, Input } from '@angular/core';
import { SecurityService } from '../../Services/security.service';

@Component({
  selector: 'app-authorize',
  imports: [],
  templateUrl: './authorize.component.html',
  styleUrl: './authorize.component.css'
})
export class AuthorizeComponent {

  securityService = inject(SecurityService);


  @Input()
  role?: string;


  isAuthorized(): boolean {
    if (this.role) {
      return this.securityService.getRole() === this.role;
    } else {
      return this.securityService.isLoggedIn();
    }
  }

}
