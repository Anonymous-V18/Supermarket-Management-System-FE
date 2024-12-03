import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockInUpdateDTORequest } from '../../../../dtos/request/stockins/stockin-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { StockinDTOResponse } from '../../../../dtos/response/stockins/stockin.dto';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { StockinService } from './../../../../services/stockin.service';

@Component({
  selector: 'app-stockin-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './stockin-detail.component.html',
  styleUrl: './stockin-detail.component.css',
})
export class StockinDetailComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  stockInUpdateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(0)]],
    totalPrice: ['', [Validators.required, Validators.min(0)]],
    stockInDate: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    stockInDetailUpdateRequests: this.formBuilder.array([]),
    stockInDetailInsertRequests: this.formBuilder.array([]),
  });
  private activeRouter = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  stockInId!: string;
  stockInDTO!: StockinDTOResponse;
  private stockinService = inject(StockinService);
  private productService = inject(ProductService);
  private statusInvoiceService = inject(StatusInvoiceService);
  productDTOs!: ProductDTOResponse[];
  statusInvoiceDTOs!: StatusInvoiceDTOResponse[];
  private dataPipe = inject(DatePipe);

  constructor() {
    this.stockInDetailUpdate().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
    this.stockInDetailInsert().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.stockInId = params['stockInId'];
      this.getDetail();
    });
  }

  onSubmit() {
    this.stockinService
      .update(this.stockInId, this.mappingDataToDTORequest())
      .subscribe({
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

  getDetail(): void {
    this.stockinService.getDetail(this.stockInId).subscribe({
      next: (response: ApiResponse<StockinDTOResponse>) => {
        this.stockInDTO = response.result;
      },
      complete: () => {
        this.mappingDataFromDTOResponse();
        this.getAllStatusInvoice();
        this.getAllProduct();
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

  stockInDetailUpdate() {
    return this.stockInUpdateForm.get(
      'stockInDetailUpdateRequests'
    ) as FormArray;
  }

  stockInDetailInsert() {
    return this.stockInUpdateForm.get(
      'stockInDetailInsertRequests'
    ) as FormArray;
  }

  addStockInDetailUpdateRequest() {
    this.stockInDTO.stockInDetails.forEach((stockInDetail) => {
      var detailGroup = this.formBuilder.group({
        id: [stockInDetail.id, [Validators.required]],
        quantity: [
          stockInDetail.quantity,
          [Validators.required, Validators.min(1)],
        ],
        inputPrice: [
          stockInDetail.inputPrice,
          [Validators.required, Validators.min(1)],
        ],
        salePrice: [
          stockInDetail.salePrice,
          [Validators.required, Validators.min(1)],
        ],
        productName: [stockInDetail.product.name],
      });
      this.stockInDetailUpdate().push(detailGroup);
    });
  }

  addStockInDetailInsertRequest() {
    var detailGroup = this.formBuilder.group({
      productId: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      inputPrice: [0, [Validators.required, Validators.min(1)]],
      salePrice: ['', [Validators.required, Validators.min(1)]],
    });
    this.stockInDetailInsert().push(detailGroup);
  }

  removeStockInDetailInsertRequest(index: number) {
    var totalStockInDetailItem =
      this.stockInDetailInsert().length + this.stockInDetailUpdate().length;
    if (totalStockInDetailItem > 1) {
      this.stockInDetailInsert().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock in detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  removeStockInDetailUpdateRequest(index: number) {
    var totalStockInDetailItem =
      this.stockInDetailInsert().length + this.stockInDetailUpdate().length;
    if (totalStockInDetailItem > 1) {
      this.stockInDetailUpdate().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last stock in detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  updateTotalProduct() {
    var total = this.stockInDetailUpdate().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      this.calculateTotalProductInStockInDetailInsert()
    );
    this.stockInUpdateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalProductInStockInDetailInsert(): number {
    return this.stockInDetailInsert().controls.reduce(
      (sum, control) => sum + control.get('quantity')?.value || 0,
      0
    );
  }

  updateTotalPrice() {
    var total = this.stockInDetailUpdate().controls.reduce(
      (sum, control) =>
        sum +
        (control.get('quantity')?.value || 0) *
          (control.get('inputPrice')?.value || 0),
      this.calculateTotalPriceInStockInDetailInsert()
    );
    this.stockInUpdateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalPriceInStockInDetailInsert(): number {
    return this.stockInDetailInsert().controls.reduce(
      (sum, control) =>
        sum +
        (control.get('quantity')?.value || 0) *
          (control.get('inputPrice')?.value || 0),
      0
    );
  }

  mappingDataToDTORequest(): StockInUpdateDTORequest {
    return new StockInUpdateDTORequest(
      this.stockInUpdateForm.value.totalProduct,
      this.stockInUpdateForm.value.totalPrice,
      new Date(
        this.stockInUpdateForm.value.stockInDate ?? Date.now()
      ).toISOString(),
      this.stockInUpdateForm.value.statusInvoiceId,
      this.stockInUpdateForm.value.stockInDetailUpdateRequests,
      this.stockInUpdateForm.value.stockInDetailInsertRequests
    );
  }

  mappingDataFromDTOResponse() {
    this.stockInUpdateForm.patchValue({
      totalProduct: this.stockInDTO.totalProduct.toString(),
      totalPrice: this.stockInDTO.totalPrice.toString(),
      stockInDate: this.dataPipe.transform(
        this.stockInDTO.stockInDate,
        'yyyy-MM-ddTHH:mm:ss'
      ),
      statusInvoiceId: this.stockInDTO.statusInvoice.id,
    });
    this.addStockInDetailUpdateRequest();
  }
}
