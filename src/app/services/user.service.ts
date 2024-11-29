import { inject, Injectable } from '@angular/core';
import { UserDetailsDTOResponse } from '../dtos/response/users/user-details.dto';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storageService = inject(LocalStorageService);

  constructor() {}

  saveUserDetailsToLocalStorage(userDetails: UserDetailsDTOResponse): void {
    this.storageService.set('user-details', JSON.stringify(userDetails));
  }

  getUserDetailsFromLocalStorage(): UserDetailsDTOResponse {
    const userDetails = this.storageService.get('user-details');
    return JSON.parse(userDetails || '{}');
  }
}
