import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShiftChecklistDTORequest } from '../dtos/request/dashboard/shift-checklist.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { ShiftChecklistDTOResponse } from '../dtos/response/dashboard/shift-checklist.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrlShiftChecklist = ApiUrl.dashboard.shiftChecklist;
  private httpClient = inject(HttpClient);

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  // The backend falls back to the current shift / logged-in user for any omitted param.
  getShiftChecklist(
    date?: string,
    shift?: string,
    username?: string
  ): Observable<ApiResponse<ShiftChecklistDTOResponse>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (shift) params = params.set('shift', shift);
    if (username) params = params.set('username', username);
    return this.httpClient.get<ApiResponse<ShiftChecklistDTOResponse>>(
      this.apiUrlShiftChecklist,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  saveShiftChecklist(
    shiftChecklistDTORequest: ShiftChecklistDTORequest,
    username?: string
  ): Observable<ApiResponse<ShiftChecklistDTOResponse>> {
    let params = new HttpParams();
    if (username) params = params.set('username', username);
    return this.httpClient.put<ApiResponse<ShiftChecklistDTOResponse>>(
      this.apiUrlShiftChecklist,
      shiftChecklistDTORequest,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }
}
