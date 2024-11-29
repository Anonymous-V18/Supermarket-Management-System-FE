import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { CONSTANT } from './../environments/constant';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getToken(CONSTANT.ACCESS_TOKEN_NAME_KEY);
  if (token !== null)  {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};
