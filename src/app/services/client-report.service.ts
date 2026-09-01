import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CLIENT_REPORT_API_ENDPOINTS } from '../core/api-endpoints';
import {
  ClientReportDropdownData,
  ClientReportFilters,
  ClientReportQuery,
  ClientReportResponse,
} from '../models/client-report.model';

@Injectable({ providedIn: 'root' })
export class ClientReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getClientReport(clientCode: string, query: ClientReportQuery): Observable<ClientReportResponse> {
    return this.http.get<ClientReportResponse>(
      `${this.apiUrl}${CLIENT_REPORT_API_ENDPOINTS.report}`,
      { params: this.buildParams(clientCode, query) },
    );
  }

  getDropdownData(clientCode: string): Observable<ClientReportDropdownData> {
    return this.http.get<ClientReportDropdownData>(
      `${this.apiUrl}${CLIENT_REPORT_API_ENDPOINTS.dropdownData}`,
      { params: { client_code: clientCode } },
    );
  }

  downloadExcel(clientCode: string, filters: ClientReportFilters): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}${CLIENT_REPORT_API_ENDPOINTS.export}`, {
      observe: 'response',
      params: this.buildParams(clientCode, filters),
      responseType: 'blob',
    });
  }

  private buildParams(
    clientCode: string,
    filters: ClientReportFilters | ClientReportQuery,
  ): HttpParams {
    let params = new HttpParams().set('client_code', clientCode);

    if (this.hasPagination(filters)) {
      params = params
        .set('page', filters.page.toString())
        .set('per_page', filters.perPage.toString());
    }

    if (filters.senderMail) {
      params = params.set('sender_mail', filters.senderMail);
    }

    if (filters.project) {
      params = params.set('project', filters.project);
    }

    if (filters.campaignCode) {
      params = params.set('campaign_code', filters.campaignCode);
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
    params = this.setBooleanParam(params, 'is_unsubscribe', filters.isUnsubscribe);

    return params;
  }

  private setBooleanParam(params: HttpParams, key: string, value: boolean | null): HttpParams {
    return value === null ? params : params.set(key, value ? '1' : '0');
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

  private hasPagination(
    filters: ClientReportFilters | ClientReportQuery,
  ): filters is ClientReportQuery {
    return 'page' in filters && 'perPage' in filters;
  }
}
