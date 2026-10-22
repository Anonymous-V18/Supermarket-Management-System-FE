import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShiftChecklistDTORequest } from '../dtos/request/dashboard/shift-checklist.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { DashboardSummaryDTOResponse } from '../dtos/response/dashboard/dashboard-summary.dto';
import { ShiftChecklistDTOResponse } from '../dtos/response/dashboard/shift-checklist.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrlSummary = ApiUrl.dashboard.summary;
  private apiUrlShiftChecklist = ApiUrl.dashboard.shiftChecklist;
  private httpClient = inject(HttpClient);

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  // Sales figures of one shift; scoped to the logged-in cashier, or the whole store for admins.
  getSummary(
    date?: string,
    shift?: string
  ): Observable<ApiResponse<DashboardSummaryDTOResponse>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (shift) params = params.set('shift', shift);
    return this.httpClient.get<ApiResponse<DashboardSummaryDTOResponse>>(
      this.apiUrlSummary,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  // The checklist belongs to the logged-in account; the backend falls back to the current shift.
  getShiftChecklist(
    date?: string,
    shift?: string
  ): Observable<ApiResponse<ShiftChecklistDTOResponse>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (shift) params = params.set('shift', shift);
    return this.httpClient.get<ApiResponse<ShiftChecklistDTOResponse>>(
      this.apiUrlShiftChecklist,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  saveShiftChecklist(
    shiftChecklistDTORequest: ShiftChecklistDTORequest
  ): Observable<ApiResponse<ShiftChecklistDTOResponse>> {
    return this.httpClient.put<ApiResponse<ShiftChecklistDTOResponse>>(
      this.apiUrlShiftChecklist,
      shiftChecklistDTORequest,
      { headers: this.createHeaders() }
    );
  }
}
