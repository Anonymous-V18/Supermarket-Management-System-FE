import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductDTORequest } from '../../../../dtos/request/products/product.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { BrandDTOResponse } from '../../../../dtos/response/brands/brand.dto';
import { ProductCategoryDTOResponse } from '../../../../dtos/response/product-categories/product-category.dto';
import { SupplierDTOResponse } from '../../../../dtos/response/suppliers/supplier.dto';
import { UnitDTOResponse } from '../../../../dtos/response/units/unit.dto';
import { BrandService } from '../../../../services/brand.service';
import { ProductCategoryService } from '../../../../services/product-category.service';
import { ProductService } from '../../../../services/product.service';
import { SupplierService } from '../../../../services/supplier.service';
import { UnitService } from '../../../../services/unit.service';

@Component({
  selector: 'app-product-create',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  productCreateForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    details: ['', Validators.required],
    warranty: [0, [Validators.required, Validators.min(0)]],
    vat: [0, [Validators.required, Validators.min(0)]],
    image: ['none-image'],
    productCategoryId: ['', Validators.required],
    supplierId: ['', Validators.required],
    unitId: ['', Validators.required],
    brandId: ['', Validators.required],
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private router: Router = inject(Router);
  private productService = inject(ProductService);
  private productCategoryService = inject(ProductCategoryService);
  private supplierService = inject(SupplierService);
  private unitService = inject(UnitService);
  private brandService = inject(BrandService);
  productCategoryDTOs!: ProductCategoryDTOResponse[];
  supplierDTOs!: SupplierDTOResponse[];
  unitDTOs!: UnitDTOResponse[];
  brandDTOs!: BrandDTOResponse[];

  ngOnInit(): void {
    this.getAllProductCategory();
    this.getAllSupplier();
    this.getAllUnit();
    this.getAllBrand();
  }

  onSubmit() {
    this.productService.insert(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          'Product created successfully !',
          'Success !',
          this.toastrConfig
        );
        this.router.navigate(['/home/product']);
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

  getAllProductCategory() {
    this.productCategoryService.showAllNoParam().subscribe({
      next: (response: ApiResponse<ProductCategoryDTOResponse[]>) => {
        this.productCategoryDTOs = response.result;
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

  getAllSupplier() {
    this.supplierService.showAllNoParam().subscribe({
      next: (response: ApiResponse<SupplierDTOResponse[]>) => {
        this.supplierDTOs = response.result;
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

  getAllUnit() {
    this.unitService.showAllNoParam().subscribe({
      next: (response: ApiResponse<UnitDTOResponse[]>) => {
        this.unitDTOs = response.result;
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

  getAllBrand() {
    this.brandService.showAllNoParam().subscribe({
      next: (response: ApiResponse<BrandDTOResponse[]>) => {
        this.brandDTOs = response.result;
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

  mappingDataToDTORequest(): ProductDTORequest {
    return new ProductDTORequest(
      this.productCreateForm.value.name,
      this.productCreateForm.value.description,
      this.productCreateForm.value.details,
      this.productCreateForm.value.warranty,
      this.productCreateForm.value.vat,
      this.productCreateForm.value.image,
      this.productCreateForm.value.productCategoryId,
      this.productCreateForm.value.supplierId,
      this.productCreateForm.value.unitId,
      this.productCreateForm.value.brandId
    );
  }
}
