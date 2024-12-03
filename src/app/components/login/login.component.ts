import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginDTORequest } from '../../dtos/request/users/login.dto';
import { ApiResponse } from '../../dtos/response/api-response/api-response.dto';
import { AuthDTOResponse } from '../../dtos/response/auth/auth.dto';
import { CONSTANT } from '../../environments/constant';
import { LocalStorageService } from '../../services/local-storage.service';
import { LoginService } from '../../services/login.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    username: ['', [Validators.minLength(8), Validators.required]],
    password: ['', [Validators.minLength(8), Validators.required]],
  });
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private loginService = inject(LoginService);
  private loginDTORequest!: LoginDTORequest;
  private localStorageService = inject(LocalStorageService);
  private toastService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    progressBar: true,
    closeButton: true,
  };

  onSubmit() {
    this.loginDTORequest = {
      ...this.loginDTORequest,
      ...this.loginForm.value,
    };
    this.loginService.login(this.loginDTORequest).subscribe({
      next: (response: ApiResponse<AuthDTOResponse>) => {
        var authDTOResponse: AuthDTOResponse = response.result;
        this.tokenService.setToken(
          CONSTANT.ACCESS_TOKEN_NAME_KEY,
          authDTOResponse.accessToken
        );
        if (authDTOResponse.employee) {
          this.localStorageService.set(
            'username',
            response.result.employee.user.username
          );
          this.localStorageService.set('name', response.result.employee.name);
          this.localStorageService.set(
            'roles',
            response.result.employee.user.roles
              .map((role) => role.code)
              .join(',')
          );
        } else {
          this.toastService.error(
            "Employee isn't found !",
            'Error !',
            this.toastrConfig
          );
          return;
        }
        this.toastService.success(
          'Đăng nhập thành công !',
          'Successfully !',
          this.toastrConfig
        );
        this.router.navigate(['/home']);
      },
      complete: () => {},
      error: (error: any) => {
        this.toastService.error(
          error.error.message,
          'Login failed !',
          this.toastrConfig
        );
      },
    });
  }
}
