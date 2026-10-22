import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InvoiceUpdateDTORequest } from '../../../../dtos/request/invoices/invoice-update.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../../../../dtos/response/customers/customer.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { CustomerService } from '../../../../services/customer.service';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { InvoiceDTOResponse } from './../../../../dtos/response/invoices/invoice.dto';
import { InvoiceService } from './../../../../services/invoice.service';

import { InvoiceDetailInsertDTORequest } from '../../../../dtos/request/invoice-details/invoice-detail-insert.dto';
import { InvoiceDetailUpdateDTORequest } from '../../../../dtos/request/invoice-details/invoice-detail-update.dto';
import { lineTotal } from '../../../../utils/money';
@Component({
  selector: 'app-invoice-detail',
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './invoice-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-detail.component.css',
})
export class InvoiceDetailComponent {
  private formBuilder = inject(FormBuilder);
  // totalProduct / totalPrice / invoiceCreateDate are display only; the server owns them
  invoiceUpdateForm = this.formBuilder.group({
    totalProduct: [''],
    totalPrice: [''],
    invoiceCreateDate: [''],
    statusInvoiceId: ['', [Validators.required]],
    customerId: [''],
    discount: [0, [Validators.min(0)]],
    paymentMethod: ['CASH' as 'CASH' | 'CARD' | 'TRANSFER'],
    amountPaid: [null as number | null, [Validators.min(0)]],
    invoiceDetailUpdateRequests: this.formBuilder.array([]),
    invoiceDetailInsertRequests: this.formBuilder.array([]),
  });
  private activeRouter = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  invoiceId!: string;
  invoiceDTO!: InvoiceDTOResponse;
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private statusInvoiceService = inject(StatusInvoiceService);
  private customerService = inject(CustomerService);
  productDTOs!: ProductDTOResponse[];
  statusInvoiceDTOs!: StatusInvoiceDTOResponse[];
  customerDTOs!: CustomerDTOResponse[];
  productCommonDetailDTOResponse!: ProductCommonDetailDTOResponse;

  private dataPipe = inject(DatePipe);

  constructor() {
    this.invoiceDetailUpdate().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
    this.invoiceDetailInsert().valueChanges.subscribe(() => {
      this.updateTotalProduct();
      this.updateTotalPrice();
    });
  }

  ngOnInit(): void {
    this.activeRouter.queryParams.subscribe((params: any) => {
      this.invoiceId = params['invoiceId'];
      this.getDetail();
    });
  }

  onSubmit() {
    this.invoiceService
      .update(this.invoiceId, this.mappingDataToDTORequest())
      .subscribe({
        next: (response: ApiResponse<InvoiceDTOResponse>) => {
          this.toastrService.success(
            response.message,
            'Thành công !',
            this.toastrConfig
          );
          this.router.navigate(['/home/invoice']);
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
    this.invoiceService.getDetail(this.invoiceId).subscribe({
      next: (response: ApiResponse<InvoiceDTOResponse>) => {
        this.invoiceDTO = response.result;
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
    var productId = this.invoiceDetailInsert()
      .at(index)
      ?.get('productId')?.value;
    var warehouseId = this.invoiceDTO.warehouse.id;
    this.productService.getCommonDetail(productId, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        this.productCommonDetailDTOResponse = response.result;
        const line = this.invoiceDetailInsert().at(index) as FormGroup;
        line.get('salePrice')?.setValue(this.productCommonDetailDTOResponse.salePrice, {
          emitEvent: false,
        });
        this.updateSubTotalPriceInDetail(line);
        this.updateTotalProduct();
        this.updateTotalPrice();
      },
      complete: () => {},
      error: (error: any) => {},
    });
  }

  getAllStatusInvoice() {
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) => {
        // Only the current status and the ones it may move to
        this.statusInvoiceDTOs = response.result.filter((status) =>
          this.allowedStatusCodes().includes(status.code)
        );
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

  invoiceDetailUpdate() {
    return this.invoiceUpdateForm.get(
      'invoiceDetailUpdateRequests'
    ) as FormArray;
  }

  invoiceDetailInsert() {
    return this.invoiceUpdateForm.get(
      'invoiceDetailInsertRequests'
    ) as FormArray;
  }

  addInvoiceDetailUpdateRequest() {
    this.invoiceDTO.invoiceDetails.forEach((invoiceDetail) => {
      var detailGroup = this.formBuilder.group({
        id: [invoiceDetail.id, [Validators.required]],
        quantity: [
          invoiceDetail.quantity,
          [Validators.required, Validators.min(1)],
        ],
        discountPercent: [
          invoiceDetail.discountPercent ?? 0,
          [Validators.min(0), Validators.max(100)],
        ],
        salePrice: [invoiceDetail.salePrice],
        subTotalPrice: [
          invoiceDetail.lineTotal ??
            lineTotal(invoiceDetail.salePrice, invoiceDetail.quantity, 0),
        ],
        productName: [`${invoiceDetail.product.code ?? ''} - ${invoiceDetail.product.name}`],
      });
      this.watchLine(detailGroup);
      this.invoiceDetailUpdate().push(detailGroup);
    });
  }

  addInvoiceDetailInsertRequest() {
    var detailGroup = this.formBuilder.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      salePrice: [0],
      subTotalPrice: [0],
    });
    this.watchLine(detailGroup);
    this.invoiceDetailInsert().push(detailGroup);
  }

  removeInvoiceDetailInsertRequest(index: number) {
    var totalInvoiceDetailItem =
      this.invoiceDetailInsert().length + this.invoiceDetailUpdate().length;
    if (totalInvoiceDetailItem > 1) {
      this.invoiceDetailInsert().removeAt(index);
    } else {
      this.toastrService.warning(
        'Hóa đơn phải có ít nhất một sản phẩm',
        'Cảnh báo !',
        this.toastrConfig
      );
    }
  }

  removeInvoiceDetailUpdateRequest(index: number) {
    var totalInvoiceDetailItem =
      this.invoiceDetailInsert().length + this.invoiceDetailUpdate().length;
    if (totalInvoiceDetailItem > 1) {
      this.invoiceDetailUpdate().removeAt(index);
    } else {
      this.toastrService.warning(
        'Hóa đơn phải có ít nhất một sản phẩm',
        'Cảnh báo !',
        this.toastrConfig
      );
    }
  }

  updateTotalProduct() {
    var total = this.invoiceDetailUpdate().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      this.calculateTotalProductInInvoiceDetailInsert()
    );
    this.invoiceUpdateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalProductInInvoiceDetailInsert(): number {
    return this.invoiceDetailInsert().controls.reduce(
      (sum, control) => sum + control.get('quantity')?.value || 0,
      0
    );
  }

  updateTotalPrice() {
    var total = this.invoiceDetailUpdate().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      this.calculateTotalPriceInInvoiceDetailInsert()
    );
    this.invoiceUpdateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  calculateTotalPriceInInvoiceDetailInsert(): number {
    return this.invoiceDetailInsert().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      0
    );
  }

  updateSubTotalPriceInDetail(item: FormGroup) {
    item
      .get('subTotalPrice')
      ?.setValue(
        lineTotal(
          item.value.salePrice,
          item.get('quantity')?.value,
          item.get('discountPercent')?.value
        ),
        { emitEvent: false }
      );
  }

  // Lines, customer and payment can only change while the invoice is pending
  isEditable(): boolean {
    return this.invoiceDTO?.statusInvoice.code === 'PENDING';
  }

  allowedStatusCodes(): string[] {
    switch (this.invoiceDTO?.statusInvoice.code) {
      case 'PENDING':
        return ['PENDING', 'COMPLETED', 'CANCELLED'];
      case 'COMPLETED':
        return ['COMPLETED', 'CANCELLED'];
      default:
        return ['CANCELLED'];
    }
  }

  // Preview of what the customer pays; the server recomputes on save
  total(): number {
    const subtotal = Number(this.invoiceUpdateForm.value.totalPrice) || 0;
    return Math.max(subtotal - (Number(this.invoiceUpdateForm.getRawValue().discount) || 0), 0);
  }

  private watchLine(line: FormGroup) {
    const refresh = () => {
      this.updateSubTotalPriceInDetail(line);
      this.updateTotalProduct();
      this.updateTotalPrice();
    };
    line.get('quantity')?.valueChanges.subscribe(refresh);
    line.get('discountPercent')?.valueChanges.subscribe(refresh);
  }

  mappingDataToDTORequest(): InvoiceUpdateDTORequest {
    const value = this.invoiceUpdateForm.getRawValue();
    return new InvoiceUpdateDTORequest(
      this.invoiceDetailUpdate().controls.map(
        (line) =>
          new InvoiceDetailUpdateDTORequest(
            line.value.id,
            Number(line.value.quantity),
            Number(line.value.discountPercent) || 0
          )
      ),
      this.invoiceDetailInsert().controls.map(
        (line) =>
          new InvoiceDetailInsertDTORequest(
            line.value.productId,
            Number(line.value.quantity),
            Number(line.value.discountPercent) || 0
          )
      ),
      value.statusInvoiceId || null,
      value.customerId || null,
      Number(value.discount) || 0,
      value.paymentMethod ?? 'CASH',
      value.amountPaid === null || value.amountPaid === undefined
        ? null
        : Number(value.amountPaid)
    );
  }

  mappingDataFromDTOResponse() {
    this.invoiceUpdateForm.patchValue({
      totalProduct: this.invoiceDTO.totalProduct.toString(),
      totalPrice: this.invoiceDTO.totalPrice.toString(),
      invoiceCreateDate: this.dataPipe.transform(
        this.invoiceDTO.invoiceCreateDate,
        'dd/MM/yyyy HH:mm'
      ),
      customerId: this.invoiceDTO.customer?.id ?? '',
      statusInvoiceId: this.invoiceDTO.statusInvoice.id,
      discount: this.invoiceDTO.discount ?? 0,
      paymentMethod: this.invoiceDTO.paymentMethod ?? 'CASH',
      amountPaid: this.invoiceDTO.amountPaid ?? null,
    });
    this.addInvoiceDetailUpdateRequest();
    if (!this.isEditable()) {
      ['customerId', 'discount', 'paymentMethod', 'amountPaid', 'invoiceDetailUpdateRequests'].forEach(
        (name) => this.invoiceUpdateForm.get(name)?.disable({ emitEvent: false })
      );
    }
  }
}
