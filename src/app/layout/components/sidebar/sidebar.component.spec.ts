import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent role visibility', () => {
  const isAdmin = signal(false);
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
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAdmin,
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

  it('shows Dashboard for ADMIN users with its existing route', () => {
    isAdmin.set(true);
    fixture.detectChanges();

    expect(menuLabels()).toContain('Dashboard');
    expect(menuLink('Dashboard')?.getAttribute('href')).toBe('/dashboard');
  });

  it('keeps Report visible with its existing route for non-admin users', () => {
    expect(menuLabels()).toContain('Report');
    expect(menuLink('Report')?.getAttribute('href')).toBe('/report');
  });

  it('keeps the existing visibility rules for all other menus', () => {
    expect(menuLabels()).not.toContain('Settings');
    expect(menuLabels()).not.toContain('User Management');
    expect(menuLabels()).not.toContain('About');

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
