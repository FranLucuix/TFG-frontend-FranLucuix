import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  user$: Observable<LoginResponse | null>;

  constructor(public authService: AuthService, private router: Router) {
    this.user$ = this.authService.currentUser$;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']) 
    });
  }

  isAdmin(user: LoginResponse | null): boolean {
    return user?.rol === 'ADMIN';
  }

  isLoggedIn(user: LoginResponse | null): boolean {
    return !!user;
  }
}
