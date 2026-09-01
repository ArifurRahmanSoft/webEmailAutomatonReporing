import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { AuthUserResponse, UserRole } from '../../auth/auth.models';
import { LoginComponent } from './login.component';

interface LoginTestAccess {
  loginForm: FormGroup;
  submit(): void;
}

describe('LoginComponent role landing page', () => {
  const login = vi.fn();
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginTestAccess;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    login.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance as unknown as LoginTestAccess;
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  const submitAs = (role: UserRole) => {
    const response: AuthUserResponse = {
      success: true,
      user_id: '08427',
      role,
      register_date: '2026-09-01T10:00:00Z',
    };
    login.mockReturnValue(of(response));
    component.loginForm.setValue({ user_id: '08427', password: 'secret' });
    component.submit();
  };

  it('sends ADMIN users to Dashboard after login', () => {
    submitAs('ADMIN');

    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('sends REPORT_VIEW users to Client Dashboard after login', () => {
    submitAs('REPORT_VIEW');

    expect(navigateByUrl).toHaveBeenCalledWith('/client-dashboard');
  });
});
