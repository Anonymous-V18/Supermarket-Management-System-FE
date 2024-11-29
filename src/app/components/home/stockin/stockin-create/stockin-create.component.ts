import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockInInsertDTORequest } from '../../../../dtos/request/stockins/stockin-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { SupplierDTOResponse } from '../../../../dtos/response/suppliers/supplier.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { ProductService } from '../../../../services/product.service';
import { StockinService } from '../../../../services/stockin.service';
import { SupplierService } from '../../../../services/supplier.service';
import { StatusInvoiceService } from './../../../../services/status-invoice.service';
import { WarehouseService } from './../../../../services/warehouse.service';

@Component({
  selector: 'app-stockin-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './stockin-create.component.html',
  styleUrl: './stockin-create.component.css',
})
export class StockinCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  stockInCreateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(1)]],
    totalPrice: ['', [Validators.required, Validators.min(1)]],
    stockInDate: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    stockInDetailInsertRequests: this.formBuilder.array(
      [],
      [Validators.required]
    ),
  });
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private router: Router = inject(Router);
  private stockinService: StockinService = inject(StockinService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private supplierService = inject(SupplierService);
  private statusInvoiceService = inject(StatusInvoiceService);
  productDTOs!: ProductDTOResponse[];
  warehouseDTOs!: WarehouseDTResponse[];
  supplierDTOs!: SupplierDTOResponse[];
  statusInvoiceDTOs!: StatusInvoiceDTOResponse[];

  constructor() {
    this.stockInDetails().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.getAllSupplier();
    this.getAllWarehouse();
    this.getAllStatusInvoice();
    this.getAllProduct();
  }

  onSubmit() {
    this.stockinService.insert(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          response.message,
          'Success !',
          this.toastrConfig
        );
        this.router.navigate(['/home/stockin']);
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

  stockInDetails() {
    return this.stockInCreateForm.get(
      'stockInDetailInsertRequests'
    ) as FormArray;
  }

  addStockInDetail() {
    var detailGroup = this.formBuilder.group({
      productId: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      inputPrice: [0, [Validators.required, Validators.min(1)]],
      salePrice: ['', [Validators.required, Validators.min(1)]],
    });
    this.stockInDetails().push(detailGroup);
  }

  removeStockInDetail(index: number) {
    if (this.stockInDetails().length > 1) {
      this.stockInDetails().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock in detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  getAllStatusInvoice() {
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) => {
        this.statusInvoiceDTOs = response.result;
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

  getAllProduct() {
    this.productService.showAllNoParam().subscribe({
      next: (response: ApiResponse<ProductDTOResponse[]>) => {
        this.productDTOs = response.result;
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

  getAllWarehouse() {
    this.warehouseService.showAllNoParam().subscribe({
      next: (response: ApiResponse<WarehouseDTResponse[]>) => {
        this.warehouseDTOs = response.result;
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

  updateTotalProduct() {
    var total = this.stockInDetails().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      0
    );
    this.stockInCreateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  updateTotalPrice() {
    var total = this.stockInDetails().controls.reduce(
      (sum, control) =>
        sum +
        (control.get('quantity')?.value || 0) *
          (control.get('inputPrice')?.value || 0),
      0
    );
    this.stockInCreateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  mappingDataToDTORequest(): StockInInsertDTORequest {
    return new StockInInsertDTORequest(
      this.stockInCreateForm.value.totalProduct,
      this.stockInCreateForm.value.totalPrice,
      new Date(
        this.stockInCreateForm.value.stockInDate ?? Date.now()
      ).toISOString(),
      this.stockInCreateForm.value.statusInvoiceId,
      this.stockInCreateForm.value.stockInDetailInsertRequests,
      this.stockInCreateForm.value.supplierId,
      this.stockInCreateForm.value.warehouseId
    );
  }
}
