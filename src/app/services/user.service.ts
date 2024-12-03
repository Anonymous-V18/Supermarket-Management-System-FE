import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { UserDetailsDTOResponse } from '../dtos/response/users/user-details.dto';
import { ApiUrl } from '../environments/api-url';
import { ChangePasswordDTORequest } from './../dtos/request/users/change-password.dto';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storageService = inject(LocalStorageService);
  private apiUrlChangePassword = ApiUrl.user.changePassword;
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

  saveUserDetailsToLocalStorage(userDetails: UserDetailsDTOResponse): void {
    this.storageService.set('user-details', JSON.stringify(userDetails));
  }

  getUserDetailsFromLocalStorage(): UserDetailsDTOResponse {
    const userDetails = this.storageService.get('user-details');
    return JSON.parse(userDetails || '{}');
  }

  changePassword(
    changePasswordDTORequest: ChangePasswordDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.patch<ApiResponse<void>>(
      this.apiUrlChangePassword,
      changePasswordDTORequest,
      this.apiConfig
    );
  }
}
