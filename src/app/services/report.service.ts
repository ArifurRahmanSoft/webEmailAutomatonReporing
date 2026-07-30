import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ReportFilterOptionsResponse,
  ReportFilters,
  ReportQuery,
  ReportResponse,
} from '../models/report.model';
import { REPORT_API_ENDPOINTS } from '../core/api-endpoints';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getReport(query: ReportQuery): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}${REPORT_API_ENDPOINTS.report}`, {
      params: this.buildParams(query),
    });
  }

  getFilterOptions(): Observable<ReportFilterOptionsResponse> {
    return this.http.get<ReportFilterOptionsResponse>(
      `${this.apiUrl}${REPORT_API_ENDPOINTS.filterOptions}`,
    );
  }

  downloadExcel(filters: ReportFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${REPORT_API_ENDPOINTS.export}`, {
      observe: 'response',
      params: this.buildParams(filters),
      responseType: 'blob',
    });
  }

  private buildParams(filters: ReportFilters | ReportQuery): HttpParams {
    let params = new HttpParams();

    if (this.hasPagination(filters)) {
      params = params.set('page', filters.page.toString()).set('page_size', filters.pageSize.toString());
    }

    if (filters.senderEmail) {
      params = params.set('sender_email', filters.senderEmail);
    }

    if (filters.projectName) {
      params = params.set('project_name', filters.projectName);
    }

    const fromDate = this.formatDateParam(filters.fromDate);
    const toDate = this.formatDateParam(filters.toDate);

    if (fromDate) {
      params = params.set('from_date', fromDate);
    }

    if (toDate) {
      params = params.set('to_date', toDate);
    }

    params = this.setBooleanParam(params, 'is_bounce', filters.isBounce);
    params = this.setBooleanParam(params, 'is_reply', filters.isReply);
    params = this.setBooleanParam(params, 'is_open', filters.isOpen);
    params = this.setBooleanParam(params, 'is_click', filters.isClick);
    params = this.setBooleanParam(params, 'is_download', filters.isDownload);

    return params;
  }

  private setBooleanParam(params: HttpParams, key: string, value: boolean | null): HttpParams {
    return value === null ? params : params.set(key, String(value));
  }

  private formatDateParam(date: Date | null): string | null {
    if (!date || Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private hasPagination(filters: ReportFilters | ReportQuery): filters is ReportQuery {
    return 'page' in filters && 'pageSize' in filters;
  }
}
