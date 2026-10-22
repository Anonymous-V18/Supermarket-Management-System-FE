import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WarehouseInsertDTORequest } from '../dtos/request/warehouses/warehouse-insert.dto';
import { WarehouseUpdateDTORequest } from '../dtos/request/warehouses/warehouse-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { WarehouseDTResponse } from '../dtos/response/warehouses/warehouse.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private apiUrlShowAllNoParam = ApiUrl.warehouse.showAllNoParam;
  private apiUrlInsert = ApiUrl.warehouse.insert;
  private apiUrlUpdate = ApiUrl.warehouse.update;
  private apiUrlGetDetail = ApiUrl.warehouse.getDetail;
  private apiConfig = {
    headers: this.createHeaders(),
  };
  private httpClient = inject(HttpClient);

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  showAllNoParam(): Observable<ApiResponse<WarehouseDTResponse[]>> {
    return this.httpClient.get<ApiResponse<WarehouseDTResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  insert(
    warehouseInsertDTORequest: WarehouseInsertDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      warehouseInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    warehouseId: string,
    warehouseUpdateDTORequest: WarehouseUpdateDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      `${this.apiUrlUpdate}/${warehouseId}`,
      warehouseUpdateDTORequest,
      this.apiConfig
    );
  }

  getDetail(warehouseId: string): Observable<ApiResponse<WarehouseDTResponse>> {
    const params = new HttpParams().set('warehouseId', warehouseId);
    return this.httpClient.get<ApiResponse<WarehouseDTResponse>>(
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
  ): Observable<ApiResponse<PageResponse<WarehouseDTResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    return this.httpClient.get<ApiResponse<PageResponse<WarehouseDTResponse>>>(
      ApiUrl.warehouse.search,
      { headers: this.createHeaders(), params: params }
    );
  }
}
