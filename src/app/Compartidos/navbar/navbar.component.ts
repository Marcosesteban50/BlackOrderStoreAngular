import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthorizeComponent } from '../authorize/authorize.component';
import { SecurityService } from '../../Services/security.service';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe, ReactiveFormsModule, MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule, RouterLink, MatSliderModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavBarComponent implements OnInit {


  securityService = inject(SecurityService);
  private cartService = inject(CartService);
  cartAmount$ = this.cartService.cartAmount$;

  @Output() toggleSidebar = new EventEmitter<void>();

  ngOnInit(): void {
    this.cartService.updateQuantity();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.securityService.logout();
    this.cartService.updateQuantity();
  }
}
