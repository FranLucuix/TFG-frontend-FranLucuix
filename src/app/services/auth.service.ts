import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser$: Observable<LoginResponse | null>;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('usuario');
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, datos, { withCredentials: true }).pipe(
      tap(user => {
        localStorage.setItem('usuario', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  registro(usuario: RegistroRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro`, usuario, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => this.clearAuth(),
        error: () => this.clearAuth() 
      })
    );
  }
  

  clearAuth(): void {
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
  }

  getUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.rol === 'ADMIN';
  }
}
