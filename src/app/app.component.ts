import { Component } from '@angular/core';
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
  title = 'BlackOrder-Angular';
  menuCollapsed = false;
}
