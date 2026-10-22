import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceUpdateDTORequest } from '../dtos/request/invoices/invoice-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { InvoiceDTOResponse } from '../dtos/response/invoices/invoice.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
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
  ): Observable<ApiResponse<InvoiceDTOResponse>> {
    return this.httpClient.post<ApiResponse<InvoiceDTOResponse>>(
      this.apiUrlInsert,
      invoiceInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    invoiceId: string,
    invoiceUpdateDTORequest: InvoiceUpdateDTORequest
  ): Observable<ApiResponse<InvoiceDTOResponse>> {
    return this.httpClient.put<ApiResponse<InvoiceDTOResponse>>(
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

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
    status?: string,
  ): Observable<ApiResponse<PageResponse<InvoiceDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    if (status) params = params.set('status', status);
    return this.httpClient.get<ApiResponse<PageResponse<InvoiceDTOResponse>>>(
      ApiUrl.invoice.search,
      { headers: this.createHeaders(), params: params }
    );
  }

  // Soft delete on the server: the rows stay for history and disappear from lists
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.invoice.delete, {
      headers: this.createHeaders(),
      body: ids,
    });
  }
}
