import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.baseUrl}/registro`, data);
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  get currentUser() {
    return this.userSubject.value || JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.rol === role;
  }
}
