import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AUTH_API_ENDPOINTS } from '../core/api-endpoints';
import {
  AuthSession,
  AuthUserListItem,
  AuthUserResponse,
  LoginRequest,
  SaveUserRequest,
  UpdateUserResponse,
  UserRole,
} from './auth.models';

const SESSION_STORAGE_KEY = 'email_reporting_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly currentSession = signal<AuthSession | null>(this.readSession());

  readonly session = this.currentSession.asReadonly();
  readonly isAuthenticated = computed(() => this.currentSession() !== null);
  readonly isAdmin = computed(() => this.currentSession()?.role === 'ADMIN');

  login(credentials: LoginRequest): Observable<AuthUserResponse> {
    return this.http
      .post<AuthUserResponse>(`${this.apiUrl}${AUTH_API_ENDPOINTS.login}`, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentSession.set(null);
  }

  hasRole(role: UserRole): boolean {
    return this.currentSession()?.role === role;
  }

  getUsers(): Observable<AuthUserListItem[]> {
    return this.http.get<AuthUserListItem[]>(`${this.apiUrl}${AUTH_API_ENDPOINTS.users}`);
  }

  registerUser(user: SaveUserRequest): Observable<AuthUserResponse> {
    return this.http.post<AuthUserResponse>(`${this.apiUrl}${AUTH_API_ENDPOINTS.register}`, user);
  }

  updateUser(id: string, user: SaveUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(
      `${this.apiUrl}${AUTH_API_ENDPOINTS.users}/${encodeURIComponent(id)}`,
      user,
    );
  }

  private saveSession(response: AuthUserResponse): void {
    const session: AuthSession = {
      user_id: response.user_id,
      role: response.role,
      register_date: response.register_date,
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.currentSession.set(session);
  }

  private readSession(): AuthSession | null {
    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as Partial<AuthSession>;
      const validRole = session.role === 'ADMIN' || session.role === 'REPORT_VIEW';

      if (
        typeof session.user_id === 'string' &&
        session.user_id.length > 0 &&
        validRole &&
        typeof session.register_date === 'string'
      ) {
        return session as AuthSession;
      }
    } catch {
      // Invalid session data is treated as logged out.
    }

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}
