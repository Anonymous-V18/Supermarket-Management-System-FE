import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SupplierUpdateDTORequest } from '../dtos/request/suppliers/supplier-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { SupplierDTOResponse } from '../dtos/response/suppliers/supplier.dto';
import { ApiUrl } from '../environments/api-url';
import { SupplierInsertDTORequest } from './../dtos/request/suppliers/supplier-insert.dto';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private apiUrlShowAllNoParam = ApiUrl.supplier.showAllNoParam;
  private apiUrlInsert = ApiUrl.supplier.insert;
  private apiUrlUpdate = ApiUrl.supplier.update;
  private apiUrlGetDetail = ApiUrl.supplier.getDetail;
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

  insert(
    supplierInsertDTORequest: SupplierInsertDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      supplierInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    supplierId: string,
    supplierUpdateDTORequest: SupplierUpdateDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      `${this.apiUrlUpdate}/${supplierId}`,
      supplierUpdateDTORequest,
      this.apiConfig
    );
  }

  getDetail(supplierId: string): Observable<ApiResponse<SupplierDTOResponse>> {
    const params = new HttpParams().set('supplierId', supplierId);
    return this.httpClient.get<ApiResponse<SupplierDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

}
