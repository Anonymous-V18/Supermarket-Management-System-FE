import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockTransferDTORequest } from '../dtos/request/operations/operations.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StockTransferDTOResponse } from '../dtos/response/operations/operations.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class StockTransferService {
  private httpClient = inject(HttpClient);

  insert(request: StockTransferDTORequest): Observable<ApiResponse<StockTransferDTOResponse>> {
    return this.httpClient.post<ApiResponse<StockTransferDTOResponse>>(ApiUrl.stockTransfer.insert, request);
  }

  update(id: string, request: StockTransferDTORequest): Observable<ApiResponse<StockTransferDTOResponse>> {
    return this.httpClient.put<ApiResponse<StockTransferDTOResponse>>(`${ApiUrl.stockTransfer.update}/${id}`, request);
  }

  getDetail(id: string): Observable<ApiResponse<StockTransferDTOResponse>> {
    return this.httpClient.get<ApiResponse<StockTransferDTOResponse>>(ApiUrl.stockTransfer.getDetail, {
      params: new HttpParams().set('id', id),
    });
  }

  search(
    keyword: string,
    page: number,
    size: number,
    status?: string
  ): Observable<ApiResponse<PageResponse<StockTransferDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<StockTransferDTOResponse>>>(ApiUrl.stockTransfer.search, { params });
  }

  // Soft delete; completed documents must be cancelled instead
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.stockTransfer.delete, { body: ids });
  }
}
