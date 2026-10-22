import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockOutInsertDTORequest } from '../dtos/request/stockouts/stockout-insert.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StockoutDTOResponse } from '../dtos/response/stockouts/stockout.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';
import { StockOutUpdateDTORequest } from './../dtos/request/stockouts/stockout-update.dto';

@Injectable({
  providedIn: 'root',
})
export class StockoutService {
  private apiUrlShowAllNoParam = ApiUrl.stockout.showAllNoParam;
  private apiUrlInsert = ApiUrl.stockout.insert;
  private apiUrlUpdate = ApiUrl.stockout.update;
  private apiUrlGetDetail = ApiUrl.stockout.getDetail;
  private httpClient = inject(HttpClient);
  private apiConfig = {
    headers: this.createHeaders(),
  };

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  showAllNoParam(): Observable<ApiResponse<StockoutDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<StockoutDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  insert(
    stockOutInsertDTORequest: StockOutInsertDTORequest
  ): Observable<ApiResponse<StockoutDTOResponse>> {
    return this.httpClient.post<ApiResponse<StockoutDTOResponse>>(
      this.apiUrlInsert,
      stockOutInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    stockOutId: string,
    stockOutUpdateDTORequest: StockOutUpdateDTORequest
  ): Observable<ApiResponse<StockoutDTOResponse>> {
    return this.httpClient.put<ApiResponse<StockoutDTOResponse>>(
      `${this.apiUrlUpdate}/${stockOutId}`,
      stockOutUpdateDTORequest,
      this.apiConfig
    );
  }

  getDetail(stockOutId: string): Observable<ApiResponse<StockoutDTOResponse>> {
    const params = new HttpParams().set('stockOutId', stockOutId);
    return this.httpClient.get<ApiResponse<StockoutDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
    status?: string,
  ): Observable<ApiResponse<PageResponse<StockoutDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<StockoutDTOResponse>>>(
      ApiUrl.stockout.search,
      { headers: this.createHeaders(), params: params }
    );
  }

  // Soft delete on the server: the rows stay for history and disappear from lists
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.stockout.delete, {
      headers: this.createHeaders(),
      body: ids,
    });
  }
}
