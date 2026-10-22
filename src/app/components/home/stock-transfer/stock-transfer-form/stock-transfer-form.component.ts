import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockTransferDTORequest } from '../../../../dtos/request/operations/operations.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { StockTransferDTOResponse } from '../../../../dtos/response/operations/operations.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { ProductService } from '../../../../services/product.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { StockTransferService } from '../../../../services/stock-transfer.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { allowedStatusCodes, statusBadgeClass } from '../../../../utils/document-status';

// PENDING = goods left the source (in transit), COMPLETED = received at the destination, CANCELLED undoes both
@Component({
  selector: 'app-stock-transfer-form',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './stock-transfer-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StockTransferFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };
  private stockTransferService = inject(StockTransferService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private statusInvoiceService = inject(StatusInvoiceService);
  readonly statusBadgeClass = statusBadgeClass;

  form = this.formBuilder.group({
    fromWarehouseId: ['', [Validators.required]],
    toWarehouseId: ['', [Validators.required]],
    note: ['', [Validators.maxLength(255)]],
    statusInvoiceId: [''],
    lines: this.formBuilder.array<FormGroup>([], [Validators.required]),
  });
  stockTransfer?: StockTransferDTOResponse;
  warehouses: WarehouseDTResponse[] = [];
  products: ProductDTOResponse[] = [];
  statusOptions: StatusInvoiceDTOResponse[] = [];
  private allStatuses: StatusInvoiceDTOResponse[] = [];

  ngOnInit(): void {
    this.warehouseService.showAllNoParam().subscribe({
      next: (response: ApiResponse<WarehouseDTResponse[]>) => (this.warehouses = response.result),
    });
    this.productService.showAllNoParam().subscribe({
      next: (response: ApiResponse<ProductDTOResponse[]>) => (this.products = response.result),
    });
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) => {
        this.allStatuses = response.result;
        this.refreshStatusOptions();
      },
    });
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.load(id);
    }
  }

  get editable(): boolean {
    return !this.stockTransfer || this.stockTransfer.statusInvoice.code === 'PENDING';
  }

  statusLabel(code: string, name: string): string {
    return code === 'PENDING' ? 'Đang vận chuyển' : code === 'COMPLETED' ? 'Đã nhận hàng' : name;
  }

  lines(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }

  addLine(productId = '', quantity = 1) {
    const line = this.formBuilder.group({
      productId: [productId, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      availableQuantity: [null as number | null],
    });
    this.lines().push(line);
    if (productId) this.refreshAvailable(line);
  }

  removeLine(index: number) {
    this.lines().removeAt(index);
  }

  // Changing the source warehouse changes what is available for every line
  onFromWarehouseChange() {
    this.lines().controls.forEach((line) => this.refreshAvailable(line));
  }

  refreshAvailable(line: FormGroup) {
    const fromWarehouseId = this.form.getRawValue().fromWarehouseId ?? '';
    const productId = line.value.productId;
    if (!fromWarehouseId || !productId) return;
    this.productService.getCommonDetail(productId, fromWarehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) =>
        line.patchValue({ availableQuantity: response.result.availableQuantity ?? 0 }, { emitEvent: false }),
    });
  }

  totalQuantity(): number {
    return this.lines().controls.reduce((sum, line) => sum + (Number(line.getRawValue().quantity) || 0), 0);
  }

  onSubmit() {
    const value = this.form.getRawValue();
    if (value.fromWarehouseId === value.toWarehouseId) {
      this.toastrService.warning('Kho nhận phải khác kho chuyển', 'Cảnh báo !', this.toastrConfig);
      return;
    }
    const request: StockTransferDTORequest = {
      toWarehouseId: value.toWarehouseId ?? '',
      note: value.note?.trim() || null,
      statusInvoiceId: value.statusInvoiceId || null,
      lines: this.lines().controls.map((line) => ({
        productId: line.getRawValue().productId,
        quantity: Number(line.getRawValue().quantity) || 0,
      })),
    };
    const call = this.stockTransfer
      ? this.stockTransferService.update(this.stockTransfer.id, request)
      : this.stockTransferService.insert({ ...request, fromWarehouseId: value.fromWarehouseId ?? '' });
    call.subscribe({
      next: (response: ApiResponse<StockTransferDTOResponse>) => {
        this.toastrService.success(`${response.result.code} - ${response.message}`, 'Thành công !', this.toastrConfig);
        this.router.navigate(['/home/stock-transfer']);
      },
      error: (error: any) => this.showError(error),
    });
  }

  private load(id: string) {
    this.stockTransferService.getDetail(id).subscribe({
      next: (response: ApiResponse<StockTransferDTOResponse>) => {
        const transfer = response.result;
        this.stockTransfer = transfer;
        this.form.patchValue({
          fromWarehouseId: transfer.fromWarehouse.id,
          toWarehouseId: transfer.toWarehouse.id,
          note: transfer.note ?? '',
          statusInvoiceId: transfer.statusInvoice.id,
        });
        this.form.controls.fromWarehouseId.disable();
        transfer.stockTransferDetails.forEach((detail) => this.addLine(detail.product.id, detail.quantity));
        if (!this.editable) {
          this.form.controls.toWarehouseId.disable();
          this.form.controls.note.disable();
          this.lines().disable();
        }
        this.refreshStatusOptions();
      },
      error: (error: any) => this.showError(error),
    });
  }

  private refreshStatusOptions() {
    if (!this.stockTransfer) {
      // Empty option = in transit; a new transfer can't start cancelled
      this.statusOptions = this.allStatuses.filter((s) => s.code === 'COMPLETED');
      return;
    }
    const allowed = allowedStatusCodes(this.stockTransfer.statusInvoice.code);
    this.statusOptions = this.allStatuses.filter((s) => allowed.includes(s.code));
  }

  private showError(error: any) {
    this.toastrService.error(error.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig);
  }
}
