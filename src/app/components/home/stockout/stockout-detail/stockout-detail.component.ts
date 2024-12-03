import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockOutUpdateDTORequest } from '../../../../dtos/request/stockouts/stockout-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../../../../dtos/response/customers/customer.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { StockoutDTOResponse } from '../../../../dtos/response/stockouts/stockout.dto';
import { CustomerService } from '../../../../services/customer.service';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { StockoutService } from '../../../../services/stockout.service';

@Component({
  selector: 'app-stockout-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './stockout-detail.component.html',
  styleUrl: './stockout-detail.component.css',
})
export class StockoutDetailComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  stockOutUpdateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(0)]],
    totalPrice: ['', [Validators.required, Validators.min(0)]],
    stockOutDate: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    customerId: ['', [Validators.required]],
    stockOutDetailUpdateRequests: this.formBuilder.array([]),
    stockOutDetailInsertRequests: this.formBuilder.array([]),
  });
  private activeRouter = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  stockOutId!: string;
  stockOutDTO!: StockoutDTOResponse;
  private stockoutService = inject(StockoutService);
  private productService = inject(ProductService);
  private statusInvoiceService = inject(StatusInvoiceService);
  private customerService = inject(CustomerService);
  productDTOs!: ProductDTOResponse[];
  statusInvoiceDTOs!: StatusInvoiceDTOResponse[];
  customerDTOs!: CustomerDTOResponse[];
  productCommonDetailDTOResponse!: ProductCommonDetailDTOResponse;

  private dataPipe = inject(DatePipe);

  constructor() {
    this.stockOutDetailUpdate().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
    this.stockOutDetailInsert().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.stockOutId = params['stockOutId'];
      this.getDetail();
    });
  }

  onSubmit() {
    this.stockoutService
      .update(this.stockOutId, this.mappingDataToDTORequest())
      .subscribe({
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

  getDetail(): void {
    this.stockoutService.getDetail(this.stockOutId).subscribe({
      next: (response: ApiResponse<StockoutDTOResponse>) => {
        this.stockOutDTO = response.result;
      },
      complete: () => {
        this.mappingDataFromDTOResponse();
        this.getAllStatusInvoice();
        this.getAllProduct();
        this.getAllCustomer();
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

  getProductCommonDetail(index: number) {
    var productId = this.stockOutDetailInsert()
      .at(index)
      ?.get('productId')?.value;
    var warehouseId = this.stockOutDTO.warehouse.id;
    this.productService.getCommonDetail(productId, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        this.productCommonDetailDTOResponse = response.result;
        this.stockOutDetailInsert()
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

  stockOutDetailUpdate() {
    return this.stockOutUpdateForm.get(
      'stockOutDetailUpdateRequests'
    ) as FormArray;
  }

  stockOutDetailInsert() {
    return this.stockOutUpdateForm.get(
      'stockOutDetailInsertRequests'
    ) as FormArray;
  }

  addStockOutDetailUpdateRequest() {
    this.stockOutDTO.stockOutDetails.forEach((stockOutDetail) => {
      var detailGroup = this.formBuilder.group({
        id: [stockOutDetail.id, [Validators.required]],
        quantity: [
          stockOutDetail.quantity,
          [Validators.required, Validators.min(1)],
        ],
        salePrice: [
          stockOutDetail.salePrice,
          [Validators.required, Validators.min(1)],
        ],
        subTotalPrice: [stockOutDetail.quantity * stockOutDetail.salePrice],
        productName: [stockOutDetail.product.name],
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
      this.stockOutDetailUpdate().push(detailGroup);
    });
  }

  addStockOutDetailInsertRequest() {
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
    this.stockOutDetailInsert().push(detailGroup);
  }

  removeStockOutDetailInsertRequest(index: number) {
    var totalStockOutDetailItem =
      this.stockOutDetailInsert().length + this.stockOutDetailUpdate().length;
    if (totalStockOutDetailItem > 1) {
      this.stockOutDetailInsert().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock in detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  removeStockOutDetailUpdateRequest(index: number) {
    var totalStockOutDetailItem =
      this.stockOutDetailInsert().length + this.stockOutDetailUpdate().length;
    if (totalStockOutDetailItem > 1) {
      this.stockOutDetailUpdate().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock in detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  updateTotalProduct() {
    var total = this.stockOutDetailUpdate().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      this.calculateTotalProductInStockOutDetailInsert()
    );
    this.stockOutUpdateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalProductInStockOutDetailInsert(): number {
    return this.stockOutDetailInsert().controls.reduce(
      (sum, control) => sum + control.get('quantity')?.value || 0,
      0
    );
  }

  updateTotalPrice() {
    var total = this.stockOutDetailUpdate().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      this.calculateTotalPriceInStockOutDetailInsert()
    );
    this.stockOutUpdateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalPriceInStockOutDetailInsert(): number {
    return this.stockOutDetailInsert().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      0
    );
  }

  updateSubTotalPriceInDetail(item: FormGroup) {
    var subTotal = item.get('quantity')?.value * item.get('salePrice')?.value;
    item
      .get('subTotalPrice')
      ?.setValue(subTotal.toString(), { emitEvent: false });
  }

  mappingDataToDTORequest(): StockOutUpdateDTORequest {
    return new StockOutUpdateDTORequest(
      this.stockOutUpdateForm.value.totalProduct,
      this.stockOutUpdateForm.value.totalPrice,
      this.stockOutUpdateForm.value.reason,
      new Date(
        this.stockOutUpdateForm.value.stockOutDate ?? Date.now()
      ).toISOString(),
      this.stockOutUpdateForm.value.statusInvoiceId,
      this.stockOutUpdateForm.value.stockOutDetailUpdateRequests,
      this.stockOutUpdateForm.value.stockOutDetailInsertRequests,
      this.stockOutUpdateForm.value.customerId
    );
  }

  mappingDataFromDTOResponse() {
    this.stockOutUpdateForm.patchValue({
      totalProduct: this.stockOutDTO.totalProduct.toString(),
      totalPrice: this.stockOutDTO.totalPrice.toString(),
      stockOutDate: this.dataPipe.transform(
        this.stockOutDTO.stockOutDate,
        'yyyy-MM-ddTHH:mm:ss'
      ),
      statusInvoiceId: this.stockOutDTO.statusInvoice.id,
      reason: this.stockOutDTO.reason,
      customerId: this.stockOutDTO.customer.id,
    });
    this.addStockOutDetailUpdateRequest();
  }
}
