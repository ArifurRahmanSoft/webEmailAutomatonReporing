import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { adminGuard, authGuard, dashboardGuard, loginGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

describe('authentication guards', () => {
  let authenticated = false;
  let role: UserRole = 'REPORT_VIEW';
  let router: Router;

  beforeEach(() => {
    authenticated = false;
    role = 'REPORT_VIEW';
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => authenticated,
            isAdmin: () => role === 'ADMIN',
            hasRole: (requiredRole: UserRole) => role === requiredRole,
          },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('redirects logged-out users to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/report' } as RouterStateSnapshot),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Freport');
  });

  it('allows authenticated users into protected routes', () => {
    authenticated = true;
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects non-admin users away from admin routes', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('allows admins into admin routes', () => {
    role = 'ADMIN';
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('allows ADMIN users to load the standard Dashboard', () => {
    role = 'ADMIN';
    const result = TestBed.runInInjectionContext(() =>
      dashboardGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects REPORT_VIEW users away from the standard Dashboard', () => {
    role = 'REPORT_VIEW';
    const result = TestBed.runInInjectionContext(() =>
      dashboardGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/client-dashboard');
  });

  it('redirects authenticated ADMIN users to Dashboard', () => {
    authenticated = true;
    role = 'ADMIN';
    const result = TestBed.runInInjectionContext(() =>
      loginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/dashboard');
  });

  it('redirects authenticated REPORT_VIEW users to Client Dashboard', () => {
    authenticated = true;
    role = 'REPORT_VIEW';
    const result = TestBed.runInInjectionContext(() =>
      loginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/client-dashboard');
  });
});
