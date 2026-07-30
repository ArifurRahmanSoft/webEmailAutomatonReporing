import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DASHBOARD_API_ENDPOINTS } from '../core/api-endpoints';
import { DashboardStatistics } from '../models/dashboard.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(
      `${this.apiUrl}${DASHBOARD_API_ENDPOINTS.statistics}`,
    );
  }
}
