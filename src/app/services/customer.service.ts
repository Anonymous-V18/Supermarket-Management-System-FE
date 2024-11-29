import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../dtos/response/customers/customer.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrlShowAllNoParam = ApiUrl.customer.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<CustomerDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<CustomerDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }
}
