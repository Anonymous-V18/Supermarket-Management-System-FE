import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockOutInsertDTORequest } from '../../../../dtos/request/stockouts/stockout-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../../../../dtos/response/customers/customer.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { CustomerService } from '../../../../services/customer.service';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { StockoutService } from '../../../../services/stockout.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { ProductCommonDetailDTOResponse } from './../../../../dtos/response/products/product-common.dto';

@Component({
  selector: 'app-stockout-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './stockout-create.component.html',
  styleUrl: './stockout-create.component.css',
})
export class StockoutCreateComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  stockOutCreateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(0)]],
    totalPrice: ['', [Validators.required, Validators.min(0)]],
    stockOutDate: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    customerId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    stockOutDetailInsertRequests: this.formBuilder.array(
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
  private stockoutService: StockoutService = inject(StockoutService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private customerService = inject(CustomerService);
  private statusInvoiceService = inject(StatusInvoiceService);
  productDTOs!: ProductDTOResponse[];
  warehouseDTOs!: WarehouseDTResponse[];
  customerDTOs!: CustomerDTOResponse[];
  statusInvoiceDTOs!: StatusInvoiceDTOResponse[];
  productCommonDetailDTOResponse!: ProductCommonDetailDTOResponse;

  ngOnInit(): void {
    this.getAllCustomer();
    this.getAllWarehouse();
    this.getAllStatusInvoice();
    this.getAllProduct();
  }

  onSubmit() {
    this.stockoutService.insert(this.mappingDataToDTORequest()).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(
          response.message,
          'Success !',
          this.toastrConfig
        );
        this.router.navigate(['/home/stockout']);
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

  getAllCustomer() {
    this.customerService.showAllNoParam().subscribe({
      next: (response: ApiResponse<CustomerDTOResponse[]>) => {
        this.customerDTOs = response.result;
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

  getProductCommonDetail(index: number) {
    var productId = this.stockOutDetails().at(index)?.get('productId')?.value;
    var warehouseId = this.stockOutCreateForm.get('warehouseId')?.value ?? '';
    this.productService.getCommonDetail(productId, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        this.productCommonDetailDTOResponse = response.result;
        this.stockOutDetails()
          .at(index)
          .get('salePrice')
          ?.setValue(this.productCommonDetailDTOResponse.salePrice, {
            emitEvent: false,
          });
      },
      complete: () => {},
      error: (error: any) => {},
    });
  }

  stockOutDetails() {
    return this.stockOutCreateForm.get(
      'stockOutDetailInsertRequests'
    ) as FormArray;
  }

  addStockOutDetail() {
    var detailGroup = this.formBuilder.group({
      productId: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      subTotalPrice: [0, [Validators.required, Validators.min(0)]],
    });
    detailGroup.get('quantity')?.valueChanges.subscribe({
      next: () => {
        this.updateSubTotalPriceInDetail(detailGroup);
        this.updateTotalProduct();
        this.updateTotalPrice();
      },
      complete: () => {},
      error: (error: any) => {},
    });

    this.stockOutDetails().push(detailGroup);
  }

  removeStockOutDetail(index: number) {
    if (this.stockOutDetails().length > 1) {
      this.stockOutDetails().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock out detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  updateTotalProduct() {
    var total = this.stockOutDetails().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      0
    );
    this.stockOutCreateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  updateTotalPrice() {
    var total = this.stockOutDetails().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      0
    );
    this.stockOutCreateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  updateSubTotalPriceInDetail(item: FormGroup) {
    var subTotal = item.get('quantity')?.value * item.get('salePrice')?.value;
    item
      .get('subTotalPrice')
      ?.setValue(subTotal.toString(), { emitEvent: false });
  }

  mappingDataToDTORequest(): StockOutInsertDTORequest {
    return new StockOutInsertDTORequest(
      this.stockOutCreateForm.value.totalProduct,
      this.stockOutCreateForm.value.totalPrice,
      this.stockOutCreateForm.value.reason,
      new Date(
        this.stockOutCreateForm.value.stockOutDate ?? Date.now()
      ).toISOString(),
      this.stockOutCreateForm.value.statusInvoiceId,
      this.stockOutCreateForm.value.stockOutDetailInsertRequests,
      this.stockOutCreateForm.value.customerId,
      this.stockOutCreateForm.value.warehouseId
    );
  }
}
