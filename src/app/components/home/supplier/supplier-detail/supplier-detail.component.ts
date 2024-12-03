import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupplierUpdateDTORequest } from '../../../../dtos/request/suppliers/supplier-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CityDTOResponse } from '../../../../dtos/response/cities/city.dto';
import { DistrictDTOResponse } from '../../../../dtos/response/districts/district.dto';
import { WardDTOResponse } from '../../../../dtos/response/wards/ward.dto';
import { CityService } from '../../../../services/city.service';
import { DistrictService } from '../../../../services/district.service';
import { SupplierService } from '../../../../services/supplier.service';
import { WardService } from '../../../../services/ward.service';
import { SupplierDTOResponse } from './../../../../dtos/response/suppliers/supplier.dto';

@Component({
  selector: 'app-supplier-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.css',
})
export class SupplierDetailComponent {
  private formBuilder = inject(FormBuilder);
  supplierUpdateForm = this.formBuilder.group({
    name: ['', Validators.required],
    moreInfo: ['', Validators.required],
    contactDate: ['', Validators.required],
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
  supplierId!: string;
  supplierDTO!: SupplierDTOResponse;
  private activeRouter = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private supplierService = inject(SupplierService);
  private cityService = inject(CityService);
  private districtService = inject(DistrictService);
  private wardService = inject(WardService);
  cityDTOs!: CityDTOResponse[];
  districtDTOs!: DistrictDTOResponse[];
  wardDTOs!: WardDTOResponse[];
  private datePipe = inject(DatePipe);

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.supplierId = params['supplierId'];
      this.getDetail();
    });
  }

  onSubmit() {
    console.log(this.supplierUpdateForm.value);
    this.supplierService
      .update(this.supplierId, this.mappingDataToDTORequest())
      .subscribe({
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

  getDetail() {
    this.supplierService.getDetail(this.supplierId).subscribe({
      next: (response: ApiResponse<SupplierDTOResponse>) => {
        this.supplierDTO = response.result;
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
    return this.supplierUpdateForm.get('currentAddress') as FormGroup;
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
      this.supplierUpdateForm.get('currentAddress.cityId')?.value ?? '';
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
      this.supplierUpdateForm.get('currentAddress.districtId')?.value ?? '';
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

  mappingDataToDTORequest(): SupplierUpdateDTORequest {
    return new SupplierUpdateDTORequest(
      this.supplierUpdateForm.value.name,
      this.supplierUpdateForm.value.moreInfo,
      new Date(
        this.supplierUpdateForm.value.contactDate ?? Date.now()
      ).toISOString(),
      this.supplierUpdateForm.value.phoneNumber,
      this.supplierUpdateForm.value.email,
      this.supplierUpdateForm.value.currentAddress
    );
  }

  mappingDataFormDTOResponse() {
    this.supplierUpdateForm.patchValue({
      name: this.supplierDTO.name,
      moreInfo: this.supplierDTO.moreInfo,
      contactDate: this.datePipe.transform(
        this.supplierDTO.contactDate,
        'yyyy-MM-ddTHH:mm'
      ),
      phoneNumber: this.supplierDTO.phoneNumber,
      email: this.supplierDTO.email,
      currentAddress: {
        id: this.supplierDTO.address.id,
        cityId: this.supplierDTO.address.district.city.id,
        districtId: this.supplierDTO.address.district.id,
        wardId: this.supplierDTO.address.ward.id,
        street: this.supplierDTO.address.street,
      },
    });
  }
}
