import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { AuditLogDTOResponse } from '../dtos/response/reports/report.dto';
import { ApiUrl } from '../environments/api-url';

export interface AuditLogFilter {
  keyword: string;
  action: string;
  from: string;
  to: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private httpClient = inject(HttpClient);

  search(filter: AuditLogFilter, page: number, size: number): Observable<ApiResponse<PageResponse<AuditLogDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filter.keyword.trim()) params = params.set('keyword', filter.keyword.trim());
    if (filter.action) params = params.set('action', filter.action);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    return this.httpClient.get<ApiResponse<PageResponse<AuditLogDTOResponse>>>(ApiUrl.auditLog.search, { params });
  }
}
