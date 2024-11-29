import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private localStorageService = inject(LocalStorageService);

  constructor() {}

  getToken(key: string): string | null {
    return this.localStorageService.get(key);
  }

  setToken(key: string, value: string): void {
    this.localStorageService.set(key, value);
  }

  removeToken(key: string): void {
    this.localStorageService.remove(key);
  }

  clearToken(): void {
    this.localStorageService.clear();
  }

  isTokenExpired(key: string): boolean {
    const token = this.getToken(key);

    if (!token) return true;

    const payloadToken = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return payloadToken.exp ? currentTime >= payloadToken.exp : true;
  }
  
}

