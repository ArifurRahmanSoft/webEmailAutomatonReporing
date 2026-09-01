import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { ClientReportFilters } from '../models/client-report.model';
import { ClientReportService } from './client-report.service';

describe('ClientReportService', () => {
  let service: ClientReportService;
  let httpController: HttpTestingController;

  const emptyFilters = (): ClientReportFilters => ({
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientReportService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('uses the client report URL with logged-in client_code and server pagination', () => {
    service
      .getClientReport('arif@gmail.com', { ...emptyFilters(), page: 1, perPage: 20 })
      .subscribe();

    const request = httpController.expectOne(
      `${environment.apiUrl}/api/client-report?client_code=arif@gmail.com&page=1&per_page=20`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ items: [] });
  });

  it('uses the client dropdown URL with client_code', () => {
    service.getDropdownData('arif@gmail.com').subscribe();

    const request = httpController.expectOne(
      `${environment.apiUrl}/api/campaigns/client-dropdown-data?client_code=arif@gmail.com`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ campaigns: [], projects: [], sender_emails: [] });
  });

  it('maps campaign, project, sender, boolean, and date filters to API parameters', () => {
    service
      .getClientReport('arif@gmail.com', {
        ...emptyFilters(),
        senderMail: 'sender@gmail.com',
        project: 'PC014',
        campaignCode: 'PC014',
        fromDate: new Date(2026, 7, 1),
        toDate: new Date(2026, 7, 31),
        isBounce: true,
        isReply: false,
        isOpen: true,
        isClick: false,
        isDownload: true,
        isUnsubscribe: false,
        page: 2,
        perPage: 20,
      })
      .subscribe();

    const request = httpController.expectOne((candidate) =>
      candidate.url.endsWith('/api/client-report'),
    );
    const params = request.request.params;

    expect(params.get('client_code')).toBe('arif@gmail.com');
    expect(params.get('sender_mail')).toBe('sender@gmail.com');
    expect(params.get('project')).toBe('PC014');
    expect(params.get('campaign_code')).toBe('PC014');
    expect(params.get('from_date')).toBe('2026-08-01');
    expect(params.get('to_date')).toBe('2026-08-31');
    expect(params.get('is_bounce')).toBe('1');
    expect(params.get('is_reply')).toBe('0');
    expect(params.get('is_open')).toBe('1');
    expect(params.get('is_click')).toBe('0');
    expect(params.get('is_download')).toBe('1');
    expect(params.get('is_unsubscribe')).toBe('0');
    expect(params.get('page')).toBe('2');
    expect(params.get('per_page')).toBe('20');
    request.flush({ items: [] });
  });

  it('downloads from the client export URL with client_code and selected filters', () => {
    service
      .downloadExcel('arif@gmail.com', {
        ...emptyFilters(),
        campaignCode: 'PC014',
      })
      .subscribe();

    const request = httpController.expectOne(
      `${environment.apiUrl}/api/client-report/export?client_code=arif@gmail.com&campaign_code=PC014`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob());
  });
});
