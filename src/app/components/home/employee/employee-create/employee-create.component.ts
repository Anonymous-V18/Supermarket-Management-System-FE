import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EmployeeInsertDTORequest } from '../../../../dtos/request/employees/employee-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
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
  selector: 'app-employee-create',
  imports: [RouterLink, ReactiveFormsModule, NgSelectModule],
  templateUrl: './employee-create.component.html',
  styleUrl: './employee-create.component.css',
})
export class EmployeeCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  employeeCreateForm = this.formBuilder.group({
    name: ['', Validators.required],
    gender: ['', Validators.required],
    dob: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    positionId: ['', Validators.required],
    newAddress: this.formBuilder.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      wardId: ['', Validators.required],
      street: ['', [Validators.required, Validators.minLength(5)]],
    }),
    roleIds: [[], Validators.required],
  });

  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
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

  ngOnInit(): void {
    this.getAllCity();
    this.getAllRole();
    this.getAllPosition();
  }

  onSubmit() {
    this.employeeService.insert(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          'Employee created successfully !',
          'Success !',
          this.toastrConfig
        );
        this.router.navigate(['/home/employee']);
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

  getAllCity() {
    this.cityService.showAllNoParam().subscribe({
      next: (response: ApiResponse<CityDTOResponse[]>) => {
        this.cityDTOs = response.result;
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

  getAllDistrictByCity() {
    var cityId: string =
      this.employeeCreateForm.get('newAddress.cityId')?.value ?? '';
    this.districtService.getAllByCity(cityId).subscribe({
      next: (response: ApiResponse<DistrictDTOResponse[]>) => {
        this.districtDTOs = response.result;
      },
      complete: () => {},
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
      this.employeeCreateForm.get('newAddress.districtId')?.value ?? '';
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

  mappingDataToDTORequest(): EmployeeInsertDTORequest {
    return new EmployeeInsertDTORequest(
      this.employeeCreateForm.value.name,
      this.employeeCreateForm.value.gender,
      new Date(this.employeeCreateForm.value.dob ?? Date.now()).toISOString(),
      this.employeeCreateForm.value.phoneNumber,
      this.employeeCreateForm.value.email,
      this.employeeCreateForm.value.positionId,
      this.employeeCreateForm.value.newAddress,
      this.employeeCreateForm.value.roleIds
    );
  }
}
