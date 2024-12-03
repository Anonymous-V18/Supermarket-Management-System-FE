import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiUrl } from '../environments/api-url';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { BrandDTOResponse } from '../dtos/response/brands/brand.dto';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrlShowAllNoParam = ApiUrl.brand.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<BrandDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<BrandDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }
  
}
