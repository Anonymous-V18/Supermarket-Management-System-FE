import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InvoiceInsertDTORequest } from '../../../../dtos/request/invoices/invoice-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../../../../dtos/response/customers/customer.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { WarehouseService } from '../../../../services/warehouse.service';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.css',
})
export class InvoiceCreateComponent {
  private formBuilder = inject(FormBuilder);
  invoiceCreateForm = this.formBuilder.group({
    totalProduct: ['', [Validators.required, Validators.min(0)]],
    totalPrice: ['', [Validators.required, Validators.min(0)]],
    invoiceCreateDate: ['', [Validators.required]],
    statusInvoiceId: ['', [Validators.required]],
    customerId: ['', [Validators.required]],
    warehouseId: ['', [Validators.required]],
    invoiceDetailInsertRequests: this.formBuilder.array(
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
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
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
    var invoiceInsertDTORequest: InvoiceInsertDTORequest =
      new InvoiceInsertDTORequest(
        this.invoiceCreateForm.value.totalProduct,
        this.invoiceCreateForm.value.totalPrice,
        this.invoiceCreateForm.value.statusInvoiceId,
        new Date(
          this.invoiceCreateForm.value.invoiceCreateDate ?? Date.now()
        ).toISOString(),
        this.invoiceCreateForm.value.invoiceDetailInsertRequests,
        this.invoiceCreateForm.value.customerId,
        this.invoiceCreateForm.value.warehouseId
      );
    this.invoiceService.insert(invoiceInsertDTORequest).subscribe({
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
    var productId = this.invoiceDetails().at(index)?.get('productId')?.value;
    var warehouseId = this.invoiceCreateForm.get('warehouseId')?.value ?? '';
    this.productService.getCommonDetail(productId, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        this.productCommonDetailDTOResponse = response.result;
        this.invoiceDetails()
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

  invoiceDetails() {
    return this.invoiceCreateForm.get(
      'invoiceDetailInsertRequests'
    ) as FormArray;
  }

  addInvoiceDetail() {
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

    this.invoiceDetails().push(detailGroup);
  }

  removeInvoiceDetail(index: number) {
    if (this.invoiceDetails().length > 1) {
      this.invoiceDetails().removeAt(index);
    } else {
      this.toastrService.warning(
        "Can't delete last invoice detail",
        'Warning !',
        this.toastrConfig
      );
    }
  }

  updateTotalProduct() {
    var total = this.invoiceDetails().controls.reduce(
      (sum, control) => sum + (control.get('quantity')?.value || 0),
      0
    );
    this.invoiceCreateForm.get('totalProduct')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  updateTotalPrice() {
    var total = this.invoiceDetails().controls.reduce(
      (sum, control) =>
        sum + (Number(control.get('subTotalPrice')?.value) || 0),
      0
    );
    this.invoiceCreateForm.get('totalPrice')?.setValue(total.toString(), {
      emitEvent: false,
    });
  }

  updateSubTotalPriceInDetail(item: FormGroup) {
    var subTotal = item.get('quantity')?.value * item.get('salePrice')?.value;
    item
      .get('subTotalPrice')
      ?.setValue(subTotal.toString(), { emitEvent: false });
  }
}
