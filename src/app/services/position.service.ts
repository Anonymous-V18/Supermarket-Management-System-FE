import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiUrl } from '../environments/api-url';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { PositionDTOResponse } from '../dtos/response/positions/position.dto';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private apiUrlShowAllNoParam = ApiUrl.position.showAllNoParam;
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

  showAllNoParam(): Observable<ApiResponse<PositionDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<PositionDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

}
