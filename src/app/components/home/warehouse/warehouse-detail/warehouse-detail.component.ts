import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WarehouseUpdateDTORequest } from '../../../../dtos/request/warehouses/warehouse-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
import { WardDTOResponse } from '../../../../dtos/response/wards/ward.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { CityService } from '../../../../services/city.service';
import { DistrictService } from '../../../../services/district.service';
import { RoleService } from '../../../../services/role.service';
import { WardService } from '../../../../services/ward.service';
import { WarehouseService } from '../../../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './warehouse-detail.component.html',
  styleUrl: './warehouse-detail.component.css',
})
export class WarehouseDetailComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  warehouseUpdateForm = this.formBuilder.group({
    name: ['', Validators.required],
    moreInfo: ['', Validators.required],
    establishDate: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    currentAddress: this.formBuilder.group({
      id: ['', Validators.required],
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      wardId: ['', Validators.required],
      street: ['', [Validators.required, Validators.minLength(5)]],
    }),
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  warehouseId!: string;
  warehouseDTO!: WarehouseDTResponse;
  private activeRouter = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private warehouseService = inject(WarehouseService);
  private cityService = inject(CityService);
  private districtService = inject(DistrictService);
  private wardService = inject(WardService);
  cityDTOs!: CityDTOResponse[];
  districtDTOs!: DistrictDTOResponse[];
  wardDTOs!: WardDTOResponse[];
  private datePipe = inject(DatePipe);
  private roleService = inject(RoleService);

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.warehouseId = params['warehouseId'];
      this.getDetail();
    });
  }

  onSubmit() {
    console.log(this.warehouseUpdateForm.value);
    this.warehouseService
      .update(this.warehouseId, this.mappingDataToDTORequest())
      .subscribe({
        next: (response: ApiResponse<void>) => {
          this.toastrService.success(
            response.message,
            'Success !',
            this.toastrConfig
          );
          this.router.navigate(['/home/warehouse']);
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

  getDetail() {
    this.warehouseService.getDetail(this.warehouseId).subscribe({
      next: (response: ApiResponse<WarehouseDTResponse>) => {
        this.warehouseDTO = response.result;
      },
      complete: () => {
        this.mappingDataFormDTOResponse();
        this.getAllCity();
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

  getNewAddress() {
    return this.warehouseUpdateForm.get('currentAddress') as FormGroup;
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
      this.warehouseUpdateForm.get('currentAddress.cityId')?.value ?? '';
    this.districtService.getAllByCity(cityId).subscribe({
      next: (response: ApiResponse<DistrictDTOResponse[]>) => {
        this.districtDTOs = response.result;
      },
      complete: () => {
        this.getAllWardByDistrict();
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

  getAllWardByDistrict() {
    var districtId: string =
      this.warehouseUpdateForm.get('currentAddress.districtId')?.value ?? '';
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

  mappingDataToDTORequest(): WarehouseUpdateDTORequest {
    return new WarehouseUpdateDTORequest(
      this.warehouseUpdateForm.value.name,
      this.warehouseUpdateForm.value.moreInfo,
      new Date(
        this.warehouseUpdateForm.value.establishDate ?? Date.now()
      ).toISOString(),
      this.warehouseUpdateForm.value.phoneNumber,
      this.warehouseUpdateForm.value.email,
      this.warehouseUpdateForm.value.currentAddress
    );
  }

  mappingDataFormDTOResponse() {
    this.warehouseUpdateForm.patchValue({
      name: this.warehouseDTO.name,
      moreInfo: this.warehouseDTO.moreInfo,
      establishDate: this.datePipe.transform(
        this.warehouseDTO.establishDate,
        'yyyy-MM-ddTHH:mm'
      ),
      phoneNumber: this.warehouseDTO.phoneNumber,
      email: this.warehouseDTO.email,
      currentAddress: {
        id: this.warehouseDTO.address.id,
        cityId: this.warehouseDTO.address.district.city.id,
        districtId: this.warehouseDTO.address.district.id,
        wardId: this.warehouseDTO.address.ward.id,
        street: this.warehouseDTO.address.street,
      },
    });
  }

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
