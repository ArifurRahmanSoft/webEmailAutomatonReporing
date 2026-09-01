import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { DashboardStatistics } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent role routing', () => {
  const statistics: DashboardStatistics = {
    total_sent: 0,
    total_open: 0,
    total_click: 0,
    total_download: 0,
    total_reply: 0,
    total_bounce: 0,
    total_open_by_mail: 0,
    total_click_by_mail: 0,
    total_download_by_mail: 0,
    total_reply_by_mail: 0,
    weekly_sent: 0,
    monthly_sent: 0,
    success_rate: 0,
    failure_rate: 0,
    last_updated: '2026-09-01T10:00:00Z',
    total_unsubscribe: 0,
    last_unsubscribe_time: null,
  };
  const hasRole = vi.fn();
  const getStatistics = vi.fn();
  let fixture: ComponentFixture<DashboardComponent>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    hasRole.mockReset();
    getStatistics.mockReset();
    getStatistics.mockReturnValue(of(statistics));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { hasRole } },
        { provide: DashboardService, useValue: { getStatistics } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('redirects REPORT_VIEW to Client Dashboard without calling the standard Dashboard API', () => {
    hasRole.mockImplementation((role: string) => role === 'REPORT_VIEW');

    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledExactlyOnceWith('/client-dashboard');
    expect(getStatistics).not.toHaveBeenCalled();
  });

  it('keeps ADMIN on Dashboard and calls the standard Dashboard API', () => {
    hasRole.mockReturnValue(false);

    fixture.detectChanges();

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(getStatistics).toHaveBeenCalledOnce();
  });
});
