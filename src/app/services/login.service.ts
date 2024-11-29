import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTORequest } from '../dtos/request/users/login.dto';
import { TokenDTOResponse } from '../dtos/response/tokens/token.dto';
import { ApiUrl } from '../environments/api-url';
import { CONSTANT } from '../environments/constant';
import { ApiResponse } from './../dtos/response/api-response/api-response.dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private loginUrl = ApiUrl.login;
  private apiConfig = {
    headers: this.createHeaders(),
  };
  private httpClient = inject(HttpClient);
  private tokenService = inject(TokenService);

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  login(loginDTO: LoginDTORequest): Observable<ApiResponse<TokenDTOResponse>> {
    return this.httpClient.post<ApiResponse<TokenDTOResponse>>(
      this.loginUrl,
      loginDTO,
      this.apiConfig
    );
  }

  isLoggedIn(): boolean {
    const token = this.tokenService.getToken(CONSTANT.ACCESS_TOKEN_NAME_KEY);
    return (
      token !== null &&
      !this.tokenService.isTokenExpired(CONSTANT.ACCESS_TOKEN_NAME_KEY)
    );
  }
}
