import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent role visibility', () => {
  const isAdmin = signal(false);
  const role = signal<'ADMIN' | 'REPORT_VIEW' | 'OTHER'>('REPORT_VIEW');
  let fixture: ComponentFixture<SidebarComponent>;

  const menuLabels = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.sidebar__nav .sidebar__label',
      ),
    ).map((element) => element.textContent?.trim() ?? '');

  const menuLink = (label: string) =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.sidebar__nav a'),
    ).find((link) => link.querySelector('.sidebar__label')?.textContent?.trim() === label);

  beforeEach(async () => {
    isAdmin.set(false);
    role.set('REPORT_VIEW');
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAdmin,
            hasRole: (requiredRole: 'ADMIN' | 'REPORT_VIEW') => role() === requiredRole,
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
  });

  it('hides Dashboard for REPORT_VIEW users', () => {
    expect(menuLabels()).not.toContain('Dashboard');
  });

  it('shows Client Dashboard only for REPORT_VIEW users', () => {
    expect(menuLabels()).toContain('Client Dashboard');
    expect(menuLink('Client Dashboard')?.getAttribute('href')).toBe('/client-dashboard');

    role.set('ADMIN');
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).not.toContain('Client Dashboard');
  });

  it('shows Dashboard for ADMIN users with its existing route', () => {
    role.set('ADMIN');
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).toContain('Dashboard');
    expect(menuLink('Dashboard')?.getAttribute('href')).toBe('/dashboard');
  });

  it('shows Report for ADMIN and hides it for REPORT_VIEW', () => {
    expect(menuLabels()).not.toContain('Report');

    role.set('ADMIN');
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).toContain('Report');
    expect(menuLink('Report')?.getAttribute('href')).toBe('/report');
  });

  it('shows Client Report only for REPORT_VIEW', () => {
    expect(menuLabels()).toContain('Client Report');
    expect(menuLink('Client Report')?.getAttribute('href')).toBe('/client-report');

    role.set('ADMIN');
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).not.toContain('Client Report');
  });

  it('keeps Report behavior unchanged for other roles', () => {
    role.set('OTHER');
    fixture.detectChanges();

    expect(menuLabels()).toContain('Report');
    expect(menuLabels()).not.toContain('Client Report');
  });

  it('keeps the existing visibility rules for all other menus', () => {
    expect(menuLabels()).not.toContain('Settings');
    expect(menuLabels()).not.toContain('User Management');
    expect(menuLabels()).not.toContain('About');

    role.set('ADMIN');
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).toEqual([
      'Dashboard',
      'Report',
      'Settings',
      'User Management',
      'About',
    ]);
  });
});
