import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-invoice-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css',
})
export class InvoiceDetailComponent {
  private formBuilder = inject(FormBuilder);
  invoiceUpdateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(0)]],
    totalPrice: ['', [Validators.required, Validators.min(0)]],
    invoiceCreateDate: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    customerId: ['', [Validators.required]],
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
        next: (response: ApiResponse<void>) => {
          this.toastrService.success(
            response.message,
            'Success !',
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
        this.invoiceDetailInsert()
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
        salePrice: [invoiceDetail.salePrice],
        subTotalPrice: [
          Number(invoiceDetail.quantity * invoiceDetail.salePrice),
        ],
        productName: [invoiceDetail.product.name],
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
      this.invoiceDetailUpdate().push(detailGroup);
    });
  }

  addInvoiceDetailInsertRequest() {
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
    this.invoiceDetailInsert().push(detailGroup);
  }

  removeInvoiceDetailInsertRequest(index: number) {
    var totalInvoiceDetailItem =
      this.invoiceDetailInsert().length + this.invoiceDetailUpdate().length;
    if (totalInvoiceDetailItem > 1) {
      this.invoiceDetailInsert().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last invoice detail",
        'Warning !',
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
        "Can't delete last invoice detail",
        'Warning !',
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
    var subTotal = item.get('quantity')?.value * item.get('salePrice')?.value;
    item
      .get('subTotalPrice')
      ?.setValue(subTotal.toString(), { emitEvent: false });
  }

  mappingDataToDTORequest(): InvoiceUpdateDTORequest {
    return new InvoiceUpdateDTORequest(
      this.invoiceUpdateForm.value.totalProduct,
      this.invoiceUpdateForm.value.totalPrice,
      this.invoiceUpdateForm.value.statusInvoiceId,
      new Date(
        this.invoiceUpdateForm.value.invoiceCreateDate ?? Date.now()
      ).toISOString(),
      this.invoiceUpdateForm.value.invoiceDetailUpdateRequests,
      this.invoiceUpdateForm.value.invoiceDetailInsertRequests,
      this.invoiceUpdateForm.value.customerId
    );
  }

  mappingDataFromDTOResponse() {
    this.invoiceUpdateForm.patchValue({
      totalProduct: this.invoiceDTO.totalProduct.toString(),
      totalPrice: this.invoiceDTO.totalPrice.toString(),
      invoiceCreateDate: this.dataPipe.transform(
        this.invoiceDTO.invoiceCreateDate,
        'yyyy-MM-ddTHH:mm:ss'
      ),
      customerId: this.invoiceDTO.customer.id,
      statusInvoiceId: this.invoiceDTO.statusInvoice.id,
    });
    this.addInvoiceDetailUpdateRequest();
  }
}
