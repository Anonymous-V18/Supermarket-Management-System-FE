import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../dtos/response/customers/customer.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
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

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<PageResponse<CustomerDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    return this.httpClient.get<ApiResponse<PageResponse<CustomerDTOResponse>>>(
      ApiUrl.customer.search,
      { headers: this.createHeaders(), params: params }
    );
  }
}
