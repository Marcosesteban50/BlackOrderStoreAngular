import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthorizeComponent } from '../authorize/authorize.component';
import { SecurityService } from '../../Services/security.service';

@Component({
  selector: 'app-navbar',
  imports: [ReactiveFormsModule, MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule, RouterLink, MatSliderModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavBarComponent  {


  securityService = inject(SecurityService);

 
}
