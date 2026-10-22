import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StockTakeDTORequest } from '../../../../dtos/request/operations/operations.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { StockTakeDTOResponse } from '../../../../dtos/response/operations/operations.dto';
import { ProductCommonDetailDTOResponse } from '../../../../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { InventoryRowDTOResponse } from '../../../../dtos/response/reports/report.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { ProductService } from '../../../../services/product.service';
import { ReportService } from '../../../../services/report.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { StockTakeService } from '../../../../services/stock-take.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { statusBadgeClass } from '../../../../utils/document-status';

// Count sheet: "Đang kiểm" keeps counts without touching stock; "Cân bằng kho" sets stock to the counts (final)
@Component({
  selector: 'app-stock-take-form',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './stock-take-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StockTakeFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };
  private stockTakeService = inject(StockTakeService);
  private reportService = inject(ReportService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private statusInvoiceService = inject(StatusInvoiceService);
  readonly statusBadgeClass = statusBadgeClass;

  form = this.formBuilder.group({
    warehouseId: ['', [Validators.required]],
    note: ['', [Validators.maxLength(255)]],
    statusInvoiceId: [''],
    lines: this.formBuilder.array<FormGroup>([]),
  });
  stockTake?: StockTakeDTOResponse;
  warehouses: WarehouseDTResponse[] = [];
  products: ProductDTOResponse[] = [];
  statusOptions: StatusInvoiceDTOResponse[] = [];
  productToAdd = '';

  ngOnInit(): void {
    this.warehouseService.showAllNoParam().subscribe({
      next: (response: ApiResponse<WarehouseDTResponse[]>) => (this.warehouses = response.result),
    });
    this.productService.showAllNoParam().subscribe({
      next: (response: ApiResponse<ProductDTOResponse[]>) => (this.products = response.result),
    });
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) =>
        (this.statusOptions = response.result.filter((s) => s.code !== 'PENDING')),
    });
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.load(id);
    }
  }

  get editable(): boolean {
    return !this.stockTake || this.stockTake.statusInvoice.code === 'PENDING';
  }

  lines(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }

  // Prefills one line per product the warehouse holds, counted = on record
  loadWarehouseStock() {
    const warehouseId = this.form.getRawValue().warehouseId ?? '';
    if (!warehouseId) return;
    if (this.lines().length && !confirm('Thay danh sách hiện tại bằng toàn bộ tồn kho của kho này?')) return;
    this.reportService.inventory(warehouseId).subscribe({
      next: (response: ApiResponse<InventoryRowDTOResponse[]>) => {
        this.lines().clear();
        response.result.forEach((row) =>
          this.addLine(row.productId, row.productName, row.productCode, row.quantity, row.quantity)
        );
        if (!response.result.length) {
          this.toastrService.info('Kho chưa có hàng, hãy thêm sản phẩm thủ công', 'Thông báo', this.toastrConfig);
        }
      },
      error: (error: any) => this.showError(error),
    });
  }

  onProductToAdd(event: Event) {
    this.productToAdd = (event.target as HTMLSelectElement).value;
  }

  addProduct() {
    const warehouseId = this.form.getRawValue().warehouseId ?? '';
    if (!this.productToAdd || !warehouseId) return;
    if (this.lines().controls.some((line) => line.value.productId === this.productToAdd)) {
      this.toastrService.warning('Sản phẩm đã có trong phiếu', 'Cảnh báo !', this.toastrConfig);
      return;
    }
    this.productService.getCommonDetail(this.productToAdd, warehouseId).subscribe({
      next: (response: ApiResponse<ProductCommonDetailDTOResponse>) => {
        const product = response.result;
        const onRecord = product.availableQuantity ?? 0;
        this.addLine(product.id, product.name, product.code, onRecord, onRecord);
      },
      error: (error: any) => this.showError(error),
    });
  }

  removeLine(index: number) {
    this.lines().removeAt(index);
  }

  difference(line: FormGroup): number {
    return (Number(line.getRawValue().countedQuantity) || 0) - (Number(line.value.systemQuantity) || 0);
  }

  totalDifference(): number {
    return this.lines().controls.reduce((sum, line) => sum + this.difference(line), 0);
  }

  onSubmit() {
    if (!this.lines().length) {
      this.toastrService.warning('Phiếu kiểm kê phải có ít nhất một sản phẩm', 'Cảnh báo !', this.toastrConfig);
      return;
    }
    const value = this.form.getRawValue();
    const completing = this.statusOptions.find((s) => s.id === value.statusInvoiceId)?.code === 'COMPLETED';
    if (completing && !confirm('Cân bằng kho sẽ đặt tồn kho bằng số lượng đếm được và không thể sửa lại. Tiếp tục?')) {
      return;
    }
    const request: StockTakeDTORequest = {
      note: value.note?.trim() || null,
      statusInvoiceId: value.statusInvoiceId || null,
      lines: this.lines().controls.map((line) => ({
        productId: line.value.productId,
        countedQuantity: Number(line.getRawValue().countedQuantity) || 0,
      })),
    };
    const call = this.stockTake
      ? this.stockTakeService.update(this.stockTake.id, request)
      : this.stockTakeService.insert({ ...request, warehouseId: value.warehouseId ?? '' });
    call.subscribe({
      next: (response: ApiResponse<StockTakeDTOResponse>) => {
        this.toastrService.success(`${response.result.code} - ${response.message}`, 'Thành công !', this.toastrConfig);
        this.router.navigate(['/home/stock-take']);
      },
      error: (error: any) => this.showError(error),
    });
  }

  private load(id: string) {
    this.stockTakeService.getDetail(id).subscribe({
      next: (response: ApiResponse<StockTakeDTOResponse>) => {
        const stockTake = response.result;
        this.stockTake = stockTake;
        this.form.patchValue({ warehouseId: stockTake.warehouse.id, note: stockTake.note ?? '' });
        this.form.controls.warehouseId.disable();
        [...stockTake.stockTakeDetails]
          .sort((a, b) => a.product.name.localeCompare(b.product.name))
          .forEach((detail) =>
            this.addLine(detail.product.id, detail.product.name, detail.product.code, detail.systemQuantity, detail.countedQuantity)
          );
        if (!this.editable) {
          this.form.controls.note.disable();
          this.form.controls.statusInvoiceId.disable();
          this.lines().disable();
        }
      },
      error: (error: any) => this.showError(error),
    });
  }

  private addLine(productId: string, name: string, code: string | undefined, systemQuantity: number, counted: number) {
    this.lines().push(
      this.formBuilder.group({
        productId: [productId],
        productName: [name],
        productCode: [code ?? ''],
        systemQuantity: [systemQuantity],
        countedQuantity: [counted, [Validators.required, Validators.min(0)]],
      })
    );
  }

  private showError(error: any) {
    this.toastrService.error(error.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig);
  }
}
