import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { SupplierDTOResponse } from '../dtos/response/suppliers/supplier.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private apiUrlShowAllNoParam = ApiUrl.supplier.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<SupplierDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<SupplierDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }
}
