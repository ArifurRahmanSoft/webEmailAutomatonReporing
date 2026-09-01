import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { ClientDashboardService } from './client-dashboard.service';

describe('ClientDashboardService', () => {
  let service: ClientDashboardService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientDashboardService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('uses the client dashboard endpoint and sends client_code as a query parameter', () => {
    service.getClientDashboard('08427').subscribe();

    const request = httpController.expectOne(
      `${environment.apiUrl}/api/campaigns/client-dashboard?client_code=08427`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('client_code')).toBe('08427');
    request.flush({});
  });
});
