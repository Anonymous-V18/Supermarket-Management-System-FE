import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { RoleDTOResponse } from '../dtos/response/roles/role.dto';
import { CONSTANT } from '../environments/constant';
import { ApiUrl } from './../environments/api-url';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrlShowAllNoParam = ApiUrl.role.showAllNoParam;
  private httpClient = inject(HttpClient);
  private apiConfig = {
    headers: this.createHeaders(),
  };
  private localStorageService = inject(LocalStorageService);
  private usernameSystemAdmin = CONSTANT.USERNAME_SYSTEM_ADMIN;

  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  showAllNoParam(): Observable<ApiResponse<RoleDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<RoleDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  hasRole(roleCodes: string[]): boolean {
    var roles: string[] =
      this.localStorageService.get('roles')?.split(',') ?? [];
    return roles.some((role) => roleCodes.includes(role));
  }

  hasSystemAdmin(): boolean {
    var roles: string[] =
      this.localStorageService.get('roles')?.split(',') ?? [];
    var username: string = this.localStorageService.get('username') ?? '';
    return (
      roles.some((role) => role === 'ADMIN') &&
      username === this.usernameSystemAdmin
    );
  }
}
