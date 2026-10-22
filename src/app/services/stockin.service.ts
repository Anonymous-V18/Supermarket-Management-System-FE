import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockInInsertDTORequest } from '../dtos/request/stockins/stockin-insert.dto';
import { StockInUpdateDTORequest } from '../dtos/request/stockins/stockin-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StockinDTOResponse } from '../dtos/response/stockins/stockin.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from './../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class StockinService {
  private apiUrlShowAllNoParam = ApiUrl.stockin.showAllNoParam;
  private apiUrlInsert = ApiUrl.stockin.insert;
  private apiUrlGetDetail = ApiUrl.stockin.getDetail;
  private apiUrlUpdate = ApiUrl.stockin.update;
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

  showAllNoParam(): Observable<ApiResponse<StockinDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<StockinDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  insert(
    stockInInsertDTORequest: StockInInsertDTORequest
  ): Observable<ApiResponse<StockinDTOResponse>> {
    return this.httpClient.post<ApiResponse<StockinDTOResponse>>(
      this.apiUrlInsert,
      stockInInsertDTORequest,
      this.apiConfig
    );
  }

  getDetail(stockInId: string): Observable<ApiResponse<StockinDTOResponse>> {
    const params = new HttpParams().set('stockInId', stockInId);
    return this.httpClient.get<ApiResponse<StockinDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  update(
    stockInId: string,
    stockInUpdateDTORequest: StockInUpdateDTORequest
  ): Observable<ApiResponse<StockinDTOResponse>> {
    return this.httpClient.put<ApiResponse<StockinDTOResponse>>(
      this.apiUrlUpdate + '/' + stockInId,
      stockInUpdateDTORequest
    );
  }

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
    status?: string,
  ): Observable<ApiResponse<PageResponse<StockinDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<StockinDTOResponse>>>(
      ApiUrl.stockin.search,
      { headers: this.createHeaders(), params: params }
    );
  }

  // Soft delete on the server: the rows stay for history and disappear from lists
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.stockin.delete, {
      headers: this.createHeaders(),
      body: ids,
    });
  }
}
