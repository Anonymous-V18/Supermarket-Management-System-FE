import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from '../services/login.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // The token lives in localStorage, which only exists in the browser.
  // Let the server render the shell; the guard runs again on the client.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const router: Router = inject(Router);
  const loginService: LoginService = inject(LoginService);

  return loginService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

// For /login: an already signed-in user goes straight to the app.
export const GuestGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const router: Router = inject(Router);
  const loginService: LoginService = inject(LoginService);

  return loginService.isLoggedIn() ? router.createUrlTree(['/home']) : true;
};
