import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupplierInsertDTORequest } from '../../../../dtos/request/suppliers/supplier-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
import { WardDTOResponse } from '../../../../dtos/response/wards/ward.dto';
import { CityService } from '../../../../services/city.service';
import { DistrictService } from '../../../../services/district.service';
import { SupplierService } from '../../../../services/supplier.service';
import { WardService } from '../../../../services/ward.service';

@Component({
  selector: 'app-supplier-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './supplier-create.component.html',
  styleUrl: './supplier-create.component.css',
})
export class SupplierCreateComponent {
  private formBuilder = inject(FormBuilder);
  supplierCreateForm = this.formBuilder.group({
    name: ['', Validators.required],
    moreInfo: ['', Validators.required],
    contactDate: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    email: ['', [Validators.required, Validators.email]],
    newAddress: this.formBuilder.group({
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
  private router: Router = inject(Router);
  private supplierService = inject(SupplierService);
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
    this.supplierService.insert(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          response.message,
          'Success !',
          this.toastrConfig
        );
        this.router.navigate(['/home/supplier']);
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
    return this.supplierCreateForm.get('newAddress') as FormGroup;
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
      this.supplierCreateForm.get('newAddress.cityId')?.value ?? '';
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
      this.supplierCreateForm.get('newAddress.districtId')?.value ?? '';
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

  mappingDataToDTORequest(): SupplierInsertDTORequest {
    return new SupplierInsertDTORequest(
      this.supplierCreateForm.value.name,
      this.supplierCreateForm.value.moreInfo,
      new Date(
        this.supplierCreateForm.value.contactDate ?? Date.now()
      ).toISOString(),
      this.supplierCreateForm.value.phoneNumber,
      this.supplierCreateForm.value.email,
      this.supplierCreateForm.value.newAddress
    );
  }
}
