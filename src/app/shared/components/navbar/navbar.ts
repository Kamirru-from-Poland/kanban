import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  get initials(): string {
    const login = this.auth.getUserLogin();
    return login ? login.substring(0, 2).toUpperCase() : '?';
  }
}
