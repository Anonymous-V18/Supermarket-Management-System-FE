import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { ApiUrl } from '../environments/api-url';
import { CONSTANT } from '../environments/constant';
import { TokenService } from './token.service';
import { LogoutDTORequest } from '../dtos/request/users/logout.dto';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  private apiUrlLogout = ApiUrl.logout;
  private httpClient = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiConfig = {
    headers: this.createHeaders(),
  };

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  logout(): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlLogout,
      new LogoutDTORequest(this.tokenService.getToken(CONSTANT.ACCESS_TOKEN_NAME_KEY) ?? ''),
      this.apiConfig
    );
  }

}
