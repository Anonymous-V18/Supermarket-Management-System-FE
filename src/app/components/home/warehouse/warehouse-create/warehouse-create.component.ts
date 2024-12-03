import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { WarehouseInsertDTORequest } from '../../../../dtos/request/warehouses/warehouse-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
import { WardDTOResponse } from '../../../../dtos/response/wards/ward.dto';
import { DistrictService } from '../../../../services/district.service';
import { WardService } from '../../../../services/ward.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { CityService } from './../../../../services/city.service';

@Component({
  selector: 'app-warehouse-create',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './warehouse-create.component.html',
  styleUrl: './warehouse-create.component.css',
})
export class WarehouseCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  warehouseCreateForm = this.formBuilder.group({
    name: ['', Validators.required],
    moreInfo: ['', Validators.required],
    establishDate: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    newAddress: this.formBuilder.group({
      cityId: ['', Validators.required],
      districtId: ['', Validators.required],
      wardId: ['', Validators.required],
      street: ['', Validators.required, Validators.minLength(5)],
    }),
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private router: Router = inject(Router);
  private warehouseService = inject(WarehouseService);
  private cityService = inject(CityService);
  private districtService = inject(DistrictService);
  private wardService = inject(WardService);
  cityDTOs!: CityDTOResponse[];
  districtDTOs!: DistrictDTOResponse[];
  wardDTOs!: WardDTOResponse[];

  ngOnInit(): void {
    this.getAllCity();
  }

  onSubmit() {
    this.warehouseService.insert(this.mappingDataToDTORequest()).subscribe({
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

  getNewAddress() {
    return this.warehouseCreateForm.get('newAddress') as FormGroup;
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
      this.warehouseCreateForm.get('newAddress.cityId')?.value ?? '';
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
      this.warehouseCreateForm.get('newAddress.districtId')?.value ?? '';
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

  mappingDataToDTORequest(): WarehouseInsertDTORequest {
    return new WarehouseInsertDTORequest(
      this.warehouseCreateForm.value.name,
      this.warehouseCreateForm.value.moreInfo,
      new Date(
        this.warehouseCreateForm.value.establishDate ?? Date.now()
      ).toISOString(),
      this.warehouseCreateForm.value.phoneNumber,
      this.warehouseCreateForm.value.email,
      this.warehouseCreateForm.value.newAddress
    );
  }
}
