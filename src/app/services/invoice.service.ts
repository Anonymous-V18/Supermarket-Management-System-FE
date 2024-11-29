import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceUpdateDTORequest } from '../dtos/request/invoices/invoice-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { InvoiceDTOResponse } from '../dtos/response/invoices/invoice.dto';
import { ApiUrl } from '../environments/api-url';
import { InvoiceInsertDTORequest } from './../dtos/request/invoices/invoice-insert.dto';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private apiUrlShowAllNoParam = ApiUrl.invoice.showAllNoParam;
  private apiUrlInsert = ApiUrl.invoice.insert;
  private apiUrlGetDetail = ApiUrl.invoice.getDetail;
  private apiUrlUpdate = ApiUrl.invoice.update;
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

  showAllNoParam(): Observable<ApiResponse<InvoiceDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<InvoiceDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  insert(
    invoiceInsertDTORequest: InvoiceInsertDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      invoiceInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    invoiceId: string,
    invoiceUpdateDTORequest: InvoiceUpdateDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      `${this.apiUrlUpdate}/${invoiceId}`,
      invoiceUpdateDTORequest,
      this.apiConfig
    );
  }

  getDetail(invoiceId: string): Observable<ApiResponse<InvoiceDTOResponse>> {
    const params = new HttpParams().set('invoiceId', invoiceId);
    return this.httpClient.get<ApiResponse<InvoiceDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }
  
}
