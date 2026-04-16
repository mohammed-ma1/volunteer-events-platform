import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, ChangePasswordRequest, LearnerUser, LoginRequest } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 've_access_token';
  private readonly USER_KEY = 've_user';

  private readonly currentUser = signal<LearnerUser | null>(this.loadUser());
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/v1/auth/login', credentials).pipe(
      tap(res => this.storeSession(res)),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this.http.post('/v1/auth/logout', {}).subscribe({ error: () => {} });
    this.clearSession();
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/v1/auth/refresh', {}).pipe(
      tap(res => this.storeSession(res)),
      catchError(err => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>('/v1/auth/password', data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private loadUser(): LearnerUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
}
