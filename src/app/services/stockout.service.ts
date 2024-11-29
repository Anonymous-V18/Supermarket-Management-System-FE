import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StockOutInsertDTORequest } from '../dtos/request/stockouts/stockout-insert.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StockoutDTOResponse } from '../dtos/response/stockouts/stockout.dto';
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
  ): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      stockOutInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    stockOutId: string,
    stockOutUpdateDTORequest: StockOutUpdateDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
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
}
