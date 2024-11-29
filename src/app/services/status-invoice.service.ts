import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { StatusInvoiceDTOResponse } from '../dtos/response/status-invoice/status-invoice.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class StatusInvoiceService {
  private apiUrlShowAllNoParam = ApiUrl.statusInvoice.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<StatusInvoiceDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<StatusInvoiceDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }
}
