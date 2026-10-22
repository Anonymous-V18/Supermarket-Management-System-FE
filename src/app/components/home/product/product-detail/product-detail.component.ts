import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductDTORequest } from '../../../../dtos/request/products/product.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { BrandDTOResponse } from '../../../../dtos/response/brands/brand.dto';
import { ProductCategoryDTOResponse } from '../../../../dtos/response/product-categories/product-category.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { SupplierDTOResponse } from '../../../../dtos/response/suppliers/supplier.dto';
import { UnitDTOResponse } from '../../../../dtos/response/units/unit.dto';
import { BrandService } from '../../../../services/brand.service';
import { ProductCategoryService } from '../../../../services/product-category.service';
import { ProductService } from '../../../../services/product.service';
import { SupplierService } from '../../../../services/supplier.service';
import { UnitService } from '../../../../services/unit.service';
import { RoleService } from '../../../../services/role.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  productUpdateForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    barcode: ['', [Validators.maxLength(50), Validators.pattern(/^[0-9A-Za-z-]*$/)]],
    description: ['', Validators.maxLength(255)],
    details: ['', Validators.maxLength(255)],
    warranty: [0, [Validators.min(0)]],
    vat: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    image: ['none-image'],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    minStock: [0, [Validators.required, Validators.min(0)]],
    productCategoryId: ['', Validators.required],
    supplierId: [''],
    unitId: ['', Validators.required],
    brandId: [''],
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  productId!: string;
  productDTO!: ProductDTOResponse;
  private activeRouter = inject(ActivatedRoute);
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
  private roleService = inject(RoleService);

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.productId = params['productId'];
      this.getDetail();
    });
  }

  onSubmit() {
    this.productService
      .update(this.productId, this.mappingDataToDTORequest())
      .subscribe({
        next: (response: ApiResponse<void>) => {
          this.toastrService.success(
            'Product updated successfully !',
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

  getDetail() {
    this.productService.getDetail(this.productId).subscribe({
      next: (response: ApiResponse<ProductDTOResponse>) => {
        this.productDTO = response.result;
      },
      complete: () => {
        this.mappingDataFromDTOResponse();
        this.getAllProductCategory();
        this.getAllSupplier();
        this.getAllUnit();
        this.getAllBrand();
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
    const value = this.productUpdateForm.value;
    return new ProductDTORequest(
      value.name ?? '',
      value.barcode || null,
      value.description || null,
      value.details || null,
      value.warranty ?? null,
      Number(value.vat) || 0,
      value.image || null,
      Number(value.salePrice) || 0,
      Number(value.minStock) || 0,
      value.productCategoryId ?? '',
      value.supplierId || null,
      value.unitId ?? '',
      value.brandId || null
    );
  }

  mappingDataFromDTOResponse() {
    this.productUpdateForm.patchValue({
      name: this.productDTO.name,
      description: this.productDTO.description,
      details: this.productDTO.details,
      warranty: this.productDTO.warranty,
      vat: this.productDTO.vat,
      image: this.productDTO.image ?? 'none-image',
      productCategoryId: this.productDTO.productCategory.id,
      supplierId: this.productDTO?.supplier?.id ?? '',
      unitId: this.productDTO.unit.id,
      brandId: this.productDTO.brand?.id ?? '',
      barcode: this.productDTO.barcode ?? '',
      salePrice: this.productDTO.salePrice ?? 0,
      minStock: this.productDTO.minStock ?? 0,
    });
  }

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
