import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { UnitDTOResponse } from '../dtos/response/units/unit.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private apiUrlShowAllNoParam = ApiUrl.unit.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<UnitDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<UnitDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }
}
