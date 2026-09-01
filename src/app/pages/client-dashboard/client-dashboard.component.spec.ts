import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ClientDashboardStatistics } from '../../models/client-dashboard.model';
import { ClientDashboardService } from '../../services/client-dashboard.service';
import { ClientDashboardComponent } from './client-dashboard.component';

describe('ClientDashboardComponent', () => {
  const dashboard: ClientDashboardStatistics = {
    campaign_count: 4,
    campaign_codes: ['PC014', 'PC015', 'PC019', 'PC020'],
    total_sent: 1250,
    total_click_by_mail: 310,
    total_download_by_mail: 87,
    total_reply_by_mail: 42,
    monthly_sent: 760,
    weekly_sent: 215,
    success_rate: 92.5,
    failure_rate: 7.5,
    total_unsubscribe: 12,
    total_open_by_mail: 640,
    last_updated: '2026-08-31T10:30:00Z',
  };

  const session = signal({
    user_id: '08427',
    role: 'REPORT_VIEW' as const,
    register_date: '2026-08-01T10:00:00Z',
  });
  const getClientDashboard = vi.fn();
  let fixture: ComponentFixture<ClientDashboardComponent>;

  const pageText = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  const metricValue = (label: string) => {
    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.client-dashboard-metric',
      ),
    );
    const card = cards.find((element) => element.textContent?.includes(label));
    return card?.querySelector('strong')?.textContent?.trim();
  };

  beforeEach(async () => {
    getClientDashboard.mockReset();
    getClientDashboard.mockReturnValue(of(dashboard));

    await TestBed.configureTestingModule({
      imports: [ClientDashboardComponent],
      providers: [
        { provide: AuthService, useValue: { session } },
        { provide: ClientDashboardService, useValue: { getClientDashboard } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientDashboardComponent);
  });

  it('uses the logged-in user_id as client_code and loads dashboard data', () => {
    fixture.detectChanges();

    expect(getClientDashboard).toHaveBeenCalledExactlyOnceWith('08427');
    expect(pageText()).toContain('Client Dashboard');
    expect(pageText()).toContain('PC014');
    expect(pageText()).toContain('PC020');
  });

  it('shows a loading state while the API request is running', () => {
    const response = new Subject<ClientDashboardStatistics>();
    getClientDashboard.mockReturnValue(response);

    fixture.detectChanges();

    expect(pageText()).toContain('Loading Client Dashboard data');
    response.next(dashboard);
    response.complete();
    fixture.detectChanges();
    expect(pageText()).not.toContain('Loading Client Dashboard data');
  });

  it('maps campaign and mail totals to their required labels', () => {
    fixture.detectChanges();

    expect(metricValue('Total Campaign')).toBe('4');
    expect(metricValue('Total Mail')).toBe('1,250');
    expect(metricValue('Monthly Sent')).toBe('760');
    expect(metricValue('Weekly Sent')).toBe('215');
  });

  it('maps mail interaction fields without exposing raw by_mail labels', () => {
    fixture.detectChanges();

    expect(metricValue('Total Open')).toBe('640');
    expect(metricValue('Total Click')).toBe('310');
    expect(metricValue('Total Download')).toBe('87');
    expect(metricValue('Total Reply')).toBe('42');
    expect(pageText()).not.toContain('by_mail');
  });

  it('displays success, failure, and unsubscribe values', () => {
    fixture.detectChanges();

    expect(metricValue('Success Rate')).toBe('92.5 %');
    expect(metricValue('Failure Rate')).toBe('7.5 %');
    expect(metricValue('Total Unsubscribe')).toBe('12');
  });

  it('handles API errors without crashing', () => {
    getClientDashboard.mockReturnValue(throwError(() => new Error('API unavailable')));

    fixture.detectChanges();

    expect(pageText()).toContain('Unable to load Client Dashboard data.');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.client-dashboard-grid'),
    ).toBeNull();
  });
});
