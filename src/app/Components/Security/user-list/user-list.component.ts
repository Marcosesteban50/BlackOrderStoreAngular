import { Component, inject, OnInit } from '@angular/core';
import { UserDTO } from '../../../Models/Security/securityDTO';
import { SecurityService } from '../../../Services/security.service';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  loading = true;
  error: string | null = null;
  admins: UserDTO[] = [];
  sellers: UserDTO[] = [];
  customers: UserDTO[] = [];

  private readonly securityService = inject(SecurityService);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.securityService.getUsers().subscribe({
      next: (users) => {
        this.admins = users.filter(user => this.hasRole(user, 'Admin'));
        this.sellers = users.filter(user => this.hasRole(user, 'Seller'));
        this.customers = users.filter(user => this.hasRole(user, 'Customer'));
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load users. Please try again.';
        this.loading = false;
      }
    });
  }




  //Buscando el rol del usuario
  hasRole(usuario: any, rol: string): boolean {
    return usuario.roles?.some(
      (r: string) => r.toLowerCase().startsWith(rol.toLowerCase())
    );
  }


}
