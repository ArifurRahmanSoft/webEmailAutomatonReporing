import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CLIENT_DASHBOARD_API_ENDPOINTS } from '../core/api-endpoints';
import { ClientDashboardStatistics } from '../models/client-dashboard.model';

@Injectable({ providedIn: 'root' })
export class ClientDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getClientDashboard(clientCode: string): Observable<ClientDashboardStatistics> {
    return this.http.get<ClientDashboardStatistics>(
      `${this.apiUrl}${CLIENT_DASHBOARD_API_ENDPOINTS.dashboard}`,
      { params: { client_code: clientCode } },
    );
  }
}
