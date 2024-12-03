import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { WardDTOResponse } from '../dtos/response/wards/ward.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class WardService {
  private apiUrlGetAllByDistrict = ApiUrl.ward.getAllByDistrict;
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

  getAllByDistrict(
    districtId: string
  ): Observable<ApiResponse<WardDTOResponse[]>> {
    const params = new HttpParams().set('districtId', districtId);
    return this.httpClient.get<ApiResponse<WardDTOResponse[]>>(
      this.apiUrlGetAllByDistrict,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }
  
}
