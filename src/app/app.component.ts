import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './Compartidos/navbar/navbar.component';
import { SideBarComponent } from './Compartidos/sidebar/sidebar.component';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBarComponent, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // En PC controla si la sidebar está estrecha.
  menuCollapsed = false;

  // En móvil controla si la sidebar está abierta.
  mobileMenuOpen = false;

  toggleMenu(): void {
    if (window.innerWidth <= 900) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.menuCollapsed = !this.menuCollapsed;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 900) {
      this.mobileMenuOpen = false;
    }
  }
}
