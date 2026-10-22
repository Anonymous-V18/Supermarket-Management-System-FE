import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesReturnDTORequest } from '../dtos/request/operations/operations.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { SalesReturnDTOResponse, ReturnableLineDTOResponse } from '../dtos/response/operations/operations.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class SalesReturnService {
  private httpClient = inject(HttpClient);

  insert(request: SalesReturnDTORequest): Observable<ApiResponse<SalesReturnDTOResponse>> {
    return this.httpClient.post<ApiResponse<SalesReturnDTOResponse>>(ApiUrl.salesReturn.insert, request);
  }

  update(id: string, request: SalesReturnDTORequest): Observable<ApiResponse<SalesReturnDTOResponse>> {
    return this.httpClient.put<ApiResponse<SalesReturnDTOResponse>>(`${ApiUrl.salesReturn.update}/${id}`, request);
  }

  getDetail(id: string): Observable<ApiResponse<SalesReturnDTOResponse>> {
    return this.httpClient.get<ApiResponse<SalesReturnDTOResponse>>(ApiUrl.salesReturn.getDetail, {
      params: new HttpParams().set('id', id),
    });
  }

  search(
    keyword: string,
    page: number,
    size: number,
    status?: string
  ): Observable<ApiResponse<PageResponse<SalesReturnDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<SalesReturnDTOResponse>>>(ApiUrl.salesReturn.search, { params });
  }

  // Soft delete; completed documents must be cancelled instead
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.salesReturn.delete, { body: ids });
  }

  returnableLines(invoiceId: string): Observable<ApiResponse<ReturnableLineDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<ReturnableLineDTOResponse[]>>(ApiUrl.salesReturn.returnableLines, {
      params: new HttpParams().set('invoiceId', invoiceId),
    });
  }
}
