import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockTakeDTORequest } from '../dtos/request/operations/operations.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StockTakeDTOResponse } from '../dtos/response/operations/operations.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class StockTakeService {
  private httpClient = inject(HttpClient);

  insert(request: StockTakeDTORequest): Observable<ApiResponse<StockTakeDTOResponse>> {
    return this.httpClient.post<ApiResponse<StockTakeDTOResponse>>(ApiUrl.stockTake.insert, request);
  }

  update(id: string, request: StockTakeDTORequest): Observable<ApiResponse<StockTakeDTOResponse>> {
    return this.httpClient.put<ApiResponse<StockTakeDTOResponse>>(`${ApiUrl.stockTake.update}/${id}`, request);
  }

  getDetail(id: string): Observable<ApiResponse<StockTakeDTOResponse>> {
    return this.httpClient.get<ApiResponse<StockTakeDTOResponse>>(ApiUrl.stockTake.getDetail, {
      params: new HttpParams().set('id', id),
    });
  }

  search(
    keyword: string,
    page: number,
    size: number,
    status?: string
  ): Observable<ApiResponse<PageResponse<StockTakeDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<StockTakeDTOResponse>>>(ApiUrl.stockTake.search, { params });
  }

  // Soft delete; completed documents must be cancelled instead
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.stockTake.delete, { body: ids });
  }
}
