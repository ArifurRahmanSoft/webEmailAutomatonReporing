import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('stores only the permitted session fields after login', () => {
    service.login({ user_id: 'admin', password: 'secret' }).subscribe();

    const request = httpController.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({
      success: true,
      user_id: 'admin',
      role: 'ADMIN',
      register_date: '2026-08-01T10:00:00Z',
    });

    const stored = JSON.parse(sessionStorage.getItem('email_reporting_session') ?? '{}');
    expect(stored).toEqual({
      user_id: 'admin',
      role: 'ADMIN',
      register_date: '2026-08-01T10:00:00Z',
    });
    expect(stored.password).toBeUndefined();
    expect(stored.success).toBeUndefined();
    expect(service.isAuthenticated()).toBe(true);
  });

  it('restores a valid session on service creation', () => {
    TestBed.resetTestingModule();
    sessionStorage.setItem(
      'email_reporting_session',
      JSON.stringify({
        user_id: 'reporter',
        role: 'REPORT_VIEW',
        register_date: '2026-08-01T10:00:00Z',
      }),
    );
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const restoredService = TestBed.inject(AuthService);
    expect(restoredService.isAuthenticated()).toBe(true);
    expect(restoredService.session()?.role).toBe('REPORT_VIEW');
  });

  it('clears the session on logout', () => {
    sessionStorage.setItem('email_reporting_session', '{}');
    service.logout();

    expect(sessionStorage.getItem('email_reporting_session')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('uses the existing users and registration endpoints', () => {
    service.getUsers().subscribe();
    const listRequest = httpController.expectOne(`${environment.apiUrl}/api/auth/users`);
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    const user = { user_id: 'reporter', password: 'secret', role: 'REPORT_VIEW' as const };
    service.registerUser(user).subscribe();
    const registerRequest = httpController.expectOne(`${environment.apiUrl}/api/auth/register`);
    expect(registerRequest.request.method).toBe('POST');
    expect(registerRequest.request.body).toEqual(user);
    registerRequest.flush({
      success: true,
      user_id: 'reporter',
      role: 'REPORT_VIEW',
      register_date: '2026-08-01T10:00:00Z',
    });
  });

  it('uses the existing user update endpoint with its UUID', () => {
    const user = { user_id: 'admin-2', password: 'new-secret', role: 'ADMIN' as const };
    const id = 'd94f1ca7-4aee-4ba1-a855-6323de77fb63';

    service.updateUser(id, user).subscribe();
    const request = httpController.expectOne(`${environment.apiUrl}/api/auth/users/${id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(user);
    request.flush({
      success: true,
      id,
      user_id: 'admin-2',
      role: 'ADMIN',
      register_date: '2026-08-01T10:00:00Z',
      updated_at: '2026-08-02T10:00:00Z',
    });
  });
});
