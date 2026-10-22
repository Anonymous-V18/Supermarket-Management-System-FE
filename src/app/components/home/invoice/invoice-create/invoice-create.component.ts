import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InvoiceDetailInsertDTORequest } from '../../../../dtos/request/invoice-details/invoice-detail-insert.dto';
import { InvoiceInsertDTORequest } from '../../../../dtos/request/invoices/invoice-insert.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { CustomerDTOResponse } from '../../../../dtos/response/customers/customer.dto';
import { InvoiceDTOResponse } from '../../../../dtos/response/invoices/invoice.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { CustomerService } from '../../../../services/customer.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { lineTotal } from '../../../../utils/money';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DecimalPipe],
  templateUrl: './invoice-create.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-create.component.css',
})
export class InvoiceCreateComponent {
  private formBuilder = inject(FormBuilder);
  // Prices, totals and the invoice date are set by the server; this form only says what was sold
  invoiceCreateForm = this.formBuilder.group({
    warehouseId: ['', [Validators.required]],
    customerId: [''],
    statusInvoiceId: [''],
    discount: [0, [Validators.min(0)]],
    paymentMethod: ['CASH' as 'CASH' | 'CARD' | 'TRANSFER'],
    amountPaid: [null as number | null, [Validators.min(0)]],
    barcode: [''],
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

  ngOnInit(): void {
    this.getAllCustomer();
    this.getAllWarehouse();
    this.getAllStatusInvoice();
    this.getAllProduct();
  }

  onSubmit() {
    const value = this.invoiceCreateForm.getRawValue();
    const invoiceInsertDTORequest = new InvoiceInsertDTORequest(
      value.warehouseId ?? '',
      this.invoiceDetails().controls.map(
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
    this.invoiceService.insert(invoiceInsertDTORequest).subscribe({
      next: (response: ApiResponse<InvoiceDTOResponse>) => {
        this.toastrService.success(
          `${response.result?.code ?? ''} - ${response.message}`,
          'Thành công !',
          this.toastrConfig
        );
        this.router.navigate(['/home/invoice']);
      },
      complete: () => {},
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Lỗi !',
          this.toastrConfig
        );
      },
    });
  }

  getAllStatusInvoice() {
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) => {
        // "Chờ xử lý" is the empty default option; a new invoice can't start cancelled
        this.statusInvoiceDTOs = response.result.filter(
          (status) => status.code === 'COMPLETED'
        );
      },
      complete: () => {},
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Lỗi !',
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
          'Lỗi !',
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
          'Lỗi !',
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
          'Lỗi !',
          this.toastrConfig
        );
      },
    });
  }

  getProductCommonDetail(index: number) {
    const line = this.invoiceDetails().at(index) as FormGroup;
    const productId = line.get('productId')?.value;
    const warehouseId = this.invoiceCreateForm.get('warehouseId')?.value ?? '';
    this.productService.getCommonDetail(productId, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        this.applyProductDetail(line, response.result);
      },
      complete: () => {},
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Lỗi !',
          this.toastrConfig
        );
      },
    });
  }

  // Scanner types the barcode and presses Enter: add the product, or one more of it
  scanBarcode(event: Event) {
    event.preventDefault();
    const barcode = (this.invoiceCreateForm.get('barcode')?.value ?? '').trim();
    const warehouseId = this.invoiceCreateForm.get('warehouseId')?.value ?? '';
    if (!barcode || !warehouseId) return;
    this.productService.getByBarcode(barcode, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        const product = response.result;
        const existing = this.invoiceDetails().controls.find(
          (line) => line.value.productId === product.id
        ) as FormGroup | undefined;
        if (existing) {
          existing.get('quantity')?.setValue(Number(existing.value.quantity) + 1);
        } else {
          const line = this.addInvoiceDetail();
          line.get('productId')?.setValue(product.id, { emitEvent: false });
          this.applyProductDetail(line, product);
        }
        this.invoiceCreateForm.get('barcode')?.setValue('');
      },
      complete: () => {},
      error: (error: any) => {
        this.toastrService.error(
          error.error.message,
          'Lỗi !',
          this.toastrConfig
        );
      },
    });
  }

  invoiceDetails() {
    return this.invoiceCreateForm.get(
      'invoiceDetailInsertRequests'
    ) as FormArray;
  }

  addInvoiceDetail(): FormGroup {
    const detailGroup = this.formBuilder.group({
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      // Display only: filled from the product, recomputed by the server
      salePrice: [0],
      availableQuantity: [null as number | null],
      subTotalPrice: [0],
    });
    detailGroup.get('quantity')?.valueChanges.subscribe(() =>
      this.updateSubTotalPriceInDetail(detailGroup)
    );
    detailGroup.get('discountPercent')?.valueChanges.subscribe(() =>
      this.updateSubTotalPriceInDetail(detailGroup)
    );
    this.invoiceDetails().push(detailGroup);
    return detailGroup;
  }

  removeInvoiceDetail(index: number) {
    if (this.invoiceDetails().length > 1) {
      this.invoiceDetails().removeAt(index);
    } else {
      this.toastrService.warning(
        'Hóa đơn phải có ít nhất một sản phẩm',
        'Cảnh báo !',
        this.toastrConfig
      );
    }
  }

  totalProduct(): number {
    return this.invoiceDetails().controls.reduce(
      (sum, line) => sum + (Number(line.value.quantity) || 0),
      0
    );
  }

  subtotal(): number {
    return this.invoiceDetails().controls.reduce(
      (sum, line) => sum + (Number(line.value.subTotalPrice) || 0),
      0
    );
  }

  total(): number {
    const discount = Number(this.invoiceCreateForm.value.discount) || 0;
    return Math.max(this.subtotal() - discount, 0);
  }

  // Null while there is nothing to give back yet
  change(): number | null {
    const paid = this.invoiceCreateForm.value.amountPaid;
    if (paid === null || paid === undefined || Number(paid) < this.total()) {
      return null;
    }
    return Number(paid) - this.total();
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

  private applyProductDetail(
    line: FormGroup,
    product: ProductCommonDetailDTOResponse
  ) {
    line.patchValue(
      {
        salePrice: product.salePrice,
        availableQuantity: product.availableQuantity ?? 0,
      },
      { emitEvent: false }
    );
    this.updateSubTotalPriceInDetail(line);
  }
}
