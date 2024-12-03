import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { DistrictDTOResponse } from '../dtos/response/districts/district.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  private apiUrlGetByCity = ApiUrl.district.getAllByCity;
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

  getAllByCity(cityId: string): Observable<ApiResponse<DistrictDTOResponse[]>> {
    const params = new HttpParams().set('cityId', cityId);
    return this.httpClient.get<ApiResponse<DistrictDTOResponse[]>>(
      this.apiUrlGetByCity,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }
}
