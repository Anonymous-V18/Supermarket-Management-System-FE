import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChecklistItemDTORequest } from '../dtos/request/operations/operations.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { ChecklistItemDTOResponse } from '../dtos/response/reports/report.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  private httpClient = inject(HttpClient);

  showAll(): Observable<ApiResponse<ChecklistItemDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<ChecklistItemDTOResponse[]>>(ApiUrl.checklistItem.showAllNoParam);
  }

  insert(request: ChecklistItemDTORequest): Observable<ApiResponse<ChecklistItemDTOResponse>> {
    return this.httpClient.post<ApiResponse<ChecklistItemDTOResponse>>(ApiUrl.checklistItem.insert, request);
  }

  update(id: string, request: ChecklistItemDTORequest): Observable<ApiResponse<ChecklistItemDTOResponse>> {
    return this.httpClient.put<ApiResponse<ChecklistItemDTOResponse>>(`${ApiUrl.checklistItem.update}/${id}`, request);
  }
}
