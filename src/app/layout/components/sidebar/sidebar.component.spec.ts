import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent role visibility', () => {
  const isAdmin = signal(false);
  let fixture: ComponentFixture<SidebarComponent>;

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

  it('hides Settings and About for REPORT_VIEW users', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Dashboard');
    expect(text).toContain('Report');
    expect(text).not.toContain('Settings');
    expect(text).not.toContain('User Management');
    expect(text).not.toContain('About');
  });

  it('shows all menus and the Settings submenu for ADMIN users', () => {
    isAdmin.set(true);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Dashboard');
    expect(text).toContain('Report');
    expect(text).toContain('Settings');
    expect(text).toContain('User Management');
    expect(text).toContain('About');
    expect(text).toContain('Logout');
  });
});
