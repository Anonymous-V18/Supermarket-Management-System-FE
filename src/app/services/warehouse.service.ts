import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { WarehouseDTResponse } from '../dtos/response/warehouses/warehouse.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private apiUrlShowAllNoParam = ApiUrl.warehouse.showAllNoParam;
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
}
