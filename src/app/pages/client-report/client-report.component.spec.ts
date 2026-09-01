import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NEVER, of, throwError } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ClientReportResponse } from '../../models/client-report.model';
import { ClientReportService } from '../../services/client-report.service';
import { ClientReportComponent } from './client-report.component';

interface ClientReportTestAccess {
  filterForm: FormGroup;
  search(): void;
  reset(): void;
  onPageChange(page: number): void;
  downloadExcel(): void;
}

describe('ClientReportComponent', () => {
  const session = signal({
    user_id: 'arif@gmail.com',
    role: 'REPORT_VIEW' as const,
    register_date: '2026-08-01T10:00:00Z',
  });
  const response: ClientReportResponse = {
    page: 1,
    page_size: 20,
    total_records: 45,
    total_pages: 3,
    has_next_page: true,
    has_previous_page: false,
    items: [
      {
        tracking_id: 'track-1',
        sender_email: 'sender@gmail.com',
        receiver_email: 'receiver@gmail.com',
        project_name: 'PC014',
        send_date: '2026-08-15T10:00:00Z',
        open_count: 1,
        click_count: 1,
        download_count: 0,
        reply_count: 0,
        is_bounce: false,
      },
    ],
  };
  const getClientReport = vi.fn();
  const getDropdownData = vi.fn();
  const downloadExcel = vi.fn();
  let fixture: ComponentFixture<ClientReportComponent>;
  let component: ClientReportTestAccess;

  beforeEach(async () => {
    getClientReport.mockReset();
    getDropdownData.mockReset();
    downloadExcel.mockReset();
    getClientReport.mockReturnValue(of(response));
    getDropdownData.mockReturnValue(
      of({
        campaigns: [{ campaign_code: 'PC014', campaign_name: 'PC014 Power People' }],
        projects: ['PC014', 'PC015'],
        sender_emails: ['sender@gmail.com'],
      }),
    );
    downloadExcel.mockReturnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ClientReportComponent],
      providers: [
        { provide: AuthService, useValue: { session } },
        {
          provide: ClientReportService,
          useValue: { getClientReport, getDropdownData, downloadExcel },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientReportComponent);
    component = fixture.componentInstance as unknown as ClientReportTestAccess;
  });

  it('loads dropdowns and the first report page using logged-in user_id as client_code', () => {
    fixture.detectChanges();

    expect(getDropdownData).toHaveBeenCalledExactlyOnceWith('arif@gmail.com');
    expect(getClientReport).toHaveBeenCalledWith(
      'arif@gmail.com',
      expect.objectContaining({ page: 1, perPage: 20 }),
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('receiver@gmail.com');
  });

  it('displays campaign_name while retaining campaign_code as the option value', async () => {
    fixture.detectChanges();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const campaignSelect = await loader.getHarness(
      MatSelectHarness.with({ selector: '[formControlName="campaignCode"]' }),
    );

    await campaignSelect.open();
    const campaignOptionLabels = await Promise.all(
      (await campaignSelect.getOptions()).map((option) => option.getText()),
    );

    expect(campaignOptionLabels).toContain('PC014 Power People');
    await campaignSelect.clickOptions({ text: 'PC014 Power People' });
    expect(component.filterForm.get('campaignCode')?.value).toBe('PC014');
  });

  it('searches with all selected filters and starts from page one', () => {
    fixture.detectChanges();
    component.filterForm.patchValue({
      senderMail: 'sender@gmail.com',
      project: 'PC014',
      campaignCode: 'PC014',
      isBounce: true,
      isReply: false,
      isOpen: true,
      isClick: false,
      isDownload: true,
      isUnsubscribe: false,
      fromDate: new Date(2026, 7, 1),
      toDate: new Date(2026, 7, 31),
    });

    component.search();

    expect(getClientReport).toHaveBeenLastCalledWith('arif@gmail.com', {
      senderMail: 'sender@gmail.com',
      project: 'PC014',
      campaignCode: 'PC014',
      isBounce: true,
      isReply: false,
      isOpen: true,
      isClick: false,
      isDownload: true,
      isUnsubscribe: false,
      fromDate: new Date(2026, 7, 1),
      toDate: new Date(2026, 7, 31),
      page: 1,
      perPage: 20,
    });
  });

  it('clears every filter and reloads the default first page on reset', () => {
    fixture.detectChanges();
    component.filterForm.patchValue({ campaignCode: 'PC014', isOpen: true });

    component.reset();

    expect(component.filterForm.getRawValue()).toEqual({
      senderMail: null,
      project: null,
      campaignCode: null,
      fromDate: null,
      toDate: null,
      isBounce: null,
      isReply: null,
      isOpen: null,
      isClick: null,
      isDownload: null,
      isUnsubscribe: null,
    });
    expect(getClientReport).toHaveBeenLastCalledWith(
      'arif@gmail.com',
      expect.objectContaining({ page: 1, perPage: 20, campaignCode: null }),
    );
  });

  it('requests the selected API page instead of paginating locally', () => {
    fixture.detectChanges();

    component.onPageChange(2);

    expect(getClientReport).toHaveBeenLastCalledWith(
      'arif@gmail.com',
      expect.objectContaining({ page: 2, perPage: 20 }),
    );
  });

  it('downloads with client_code and the selected filters', () => {
    fixture.detectChanges();
    component.filterForm.patchValue({ campaignCode: 'PC014', project: 'PC014' });

    component.downloadExcel();

    expect(downloadExcel).toHaveBeenCalledWith(
      'arif@gmail.com',
      expect.objectContaining({
        campaignCode: 'PC014',
        project: 'PC014',
      }),
    );
  });

  it('shows the required message when the report API fails', () => {
    getClientReport.mockReturnValue(throwError(() => new Error('Unavailable')));

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Unable to load client report data.',
    );
  });
});
