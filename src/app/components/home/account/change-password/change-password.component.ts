import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordDTORequest } from '../../../../dtos/request/users/change-password.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private formBuilder = inject(FormBuilder);
  changePasswordForm = this.formBuilder.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private userService = inject(UserService);

  onSubmit() {
    this.userService.changePassword(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          'Changed password successfully !',
          'Success !',
          this.toastrConfig
        );
      },
      complete: () => {},
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Error !',
          this.toastrConfig
        );
      },
    });
  }

  mappingDataToDTORequest(): ChangePasswordDTORequest {
    return new ChangePasswordDTORequest(
      this.changePasswordForm.value.oldPassword,
      this.changePasswordForm.value.newPassword
    );
  }
}
