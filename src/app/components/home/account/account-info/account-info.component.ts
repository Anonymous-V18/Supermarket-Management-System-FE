import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EmployeeUpdateDTORequest } from '../../../../dtos/request/employees/employee-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
import { EmployeeDTOResponse } from '../../../../dtos/response/employees/employee.dto';
import { PositionDTOResponse } from '../../../../dtos/response/positions/position.dto';
import { RoleDTOResponse } from '../../../../dtos/response/roles/role.dto';
import { WardDTOResponse } from '../../../../dtos/response/wards/ward.dto';
import { CityService } from '../../../../services/city.service';
import { DistrictService } from '../../../../services/district.service';
import { EmployeeService } from '../../../../services/employee.service';
import { PositionService } from '../../../../services/position.service';
import { RoleService } from '../../../../services/role.service';
import { WardService } from '../../../../services/ward.service';

@Component({
  selector: 'app-account-info',
  imports: [RouterLink, ReactiveFormsModule, NgSelectModule],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css',
})
export class AccountInfoComponent {
  private formBuilder = inject(FormBuilder);
  employeeUpdateForm = this.formBuilder.group({
    name: ['', Validators.required],
    gender: ['', Validators.required],
    dob: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    positionId: ['', Validators.required],
    currentAddress: this.formBuilder.group({
      id: ['', Validators.required],
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      wardId: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(100)]],
    }),
    roleIds: [[''], Validators.required],
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  employeeDTO!: EmployeeDTOResponse;
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private cityService = inject(CityService);
  private districtService = inject(DistrictService);
  private wardService = inject(WardService);
  private roleService = inject(RoleService);
  private postionService = inject(PositionService);
  cityDTOs!: CityDTOResponse[];
  districtDTOs!: DistrictDTOResponse[];
  wardDTOs!: WardDTOResponse[];
  roleDTOs!: RoleDTOResponse[];
  positionDTOs!: PositionDTOResponse[];
  private datePipe = inject(DatePipe);

  ngOnInit(): void {
    if (this.roleService.hasSystemAdmin()) {
      this.router.navigate(['/home/account/change-password']);
    }
    this.getMyInfo();
  }

  onSubmit() {
    this.employeeService
      .updateCurrentEmployee(this.mappingDataToDTORequest())
      .subscribe({
        next: (response: ApiResponse<void>) => {
          this.toastrService.success(
            'Updated successfully !',
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

  getMyInfo() {
    this.employeeService.getMyInfo().subscribe({
      next: (response: ApiResponse<EmployeeDTOResponse>) => {
        this.employeeDTO = response.result;
      },
      complete: () => {
        this.mappingDataFromDTOResponse();
        this.getAllCity();
        this.getAllRole();
        this.getAllPosition();
      },
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Error !',
          this.toastrConfig
        );
      },
    });
  }

  getAllCity() {
    this.cityService.showAllNoParam().subscribe({
      next: (response: ApiResponse<CityDTOResponse[]>) => {
        this.cityDTOs = response.result;
      },
      complete: () => {
        this.getAllDistrictByCity();
      },
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Error !',
          this.toastrConfig
        );
      },
    });
  }

  getAllDistrictByCity() {
    var cityId: string =
      this.employeeUpdateForm.get('currentAddress.cityId')?.value ?? '';
    this.districtService.getAllByCity(cityId).subscribe({
      next: (response: ApiResponse<DistrictDTOResponse[]>) => {
        this.districtDTOs = response.result;
      },
      complete: () => {
        this.getAllWardByDistrict();
      },
      error: (error) => {
        this.toastrService.error(
          error.error.message,
          'Error !',
          this.toastrConfig
        );
      },
    });
  }

  getAllWardByDistrict() {
    var districtId: string =
      this.employeeUpdateForm.get('currentAddress.districtId')?.value ?? '';
    this.wardService.getAllByDistrict(districtId).subscribe({
      next: (response: ApiResponse<WardDTOResponse[]>) => {
        this.wardDTOs = response.result;
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

  getAllRole() {
    this.roleService.showAllNoParam().subscribe({
      next: (response: ApiResponse<RoleDTOResponse[]>) => {
        this.roleDTOs = response.result;
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

  getAllPosition() {
    this.postionService.showAllNoParam().subscribe({
      next: (response: ApiResponse<PositionDTOResponse[]>) => {
        this.positionDTOs = response.result;
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

  mappingDataToDTORequest(): EmployeeUpdateDTORequest {
    return new EmployeeUpdateDTORequest(
      this.employeeUpdateForm.value.name,
      this.employeeUpdateForm.value.gender,
      new Date(this.employeeUpdateForm.value.dob ?? Date.now()).toISOString(),
      this.employeeUpdateForm.value.phoneNumber,
      this.employeeUpdateForm.value.email,
      this.employeeUpdateForm.value.positionId,
      this.employeeUpdateForm.value.currentAddress,
      this.employeeUpdateForm.value.roleIds
    );
  }

  mappingDataFromDTOResponse() {
    this.employeeUpdateForm.patchValue({
      name: this.employeeDTO.name,
      gender: this.employeeDTO.gender,
      phoneNumber: this.employeeDTO.phoneNumber,
      email: this.employeeDTO.email,
      positionId: this.employeeDTO.position.id,
      dob: this.datePipe.transform(this.employeeDTO.dob, 'yyyy-MM-ddTHH:mm:ss'),
      currentAddress: {
        id: this.employeeDTO.address.id,
        cityId: this.employeeDTO.address.district.city.id,
        districtId: this.employeeDTO.address.district.id,
        wardId: this.employeeDTO.address.ward.id,
        street: this.employeeDTO.address.street,
      },
      roleIds: this.employeeDTO.user.roles.map((role) => role.id) ?? [],
    });
    this.employeeUpdateForm.get('positionId')?.disable();
    this.employeeUpdateForm.get('roleIds')?.disable();
  }
}
