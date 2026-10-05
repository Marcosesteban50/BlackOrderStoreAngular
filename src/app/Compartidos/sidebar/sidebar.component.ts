import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { SecurityService } from '../../Services/security.service';
import { AuthorizeComponent } from '../authorize/authorize.component';

@Component({
  selector: 'app-sidebar',
  imports: [
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    MatSliderModule,
    AuthorizeComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SideBarComponent implements OnInit {

  securityService = inject(SecurityService);

  ActiveSearch = false;
  ColpasedMenu = false;

  // ESTADOS DROPDOWN
  dropdownOrdersOpen = false;
  dropdownAdminOpen = false;

  ngOnInit(): void { }

  // METHODS DE DROPDOWN Y MENÚ
  toggleDropdown(dropdown: string): void {
    if (dropdown === 'ordenes') {
      this.dropdownOrdersOpen = !this.dropdownOrdersOpen;
      this.dropdownAdminOpen = false;
    } else if (dropdown === 'admin') {
      this.dropdownAdminOpen = !this.dropdownAdminOpen;
      this.dropdownOrdersOpen = false;
    }
  }

  closeAdminMenu(): void {
    this.dropdownOrdersOpen = false;
    this.dropdownAdminOpen = false;
  }

  closeMenu(): void {
    if (window.innerWidth <= 1100) {
      this.ColpasedMenu = true;
    }
  }

  toggleMenu(): void {
    this.ColpasedMenu = !this.ColpasedMenu;
  }

  toggleBusqueda(): void {
    this.ActiveSearch = !this.ActiveSearch;
  }

}