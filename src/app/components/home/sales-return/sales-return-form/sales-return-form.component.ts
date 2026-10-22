import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SalesReturnDTORequest } from '../../../../dtos/request/operations/operations.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { InvoiceDTOResponse } from '../../../../dtos/response/invoices/invoice.dto';
import {
  ReturnableLineDTOResponse,
  SalesReturnDTOResponse,
} from '../../../../dtos/response/operations/operations.dto';
import { PageResponse } from '../../../../dtos/response/page/page-response.dto';
import { StatusInvoiceDTOResponse } from '../../../../dtos/response/status-invoice/status-invoice.dto';
import { InvoiceService } from '../../../../services/invoice.service';
import { SalesReturnService } from '../../../../services/sales-return.service';
import { StatusInvoiceService } from '../../../../services/status-invoice.service';
import { allowedStatusCodes, statusBadgeClass } from '../../../../utils/document-status';

// Create a return from a completed invoice (/create?invoiceId=...) or open one (/detail?id=...).
// Lines can be edited while the return is pending; afterwards only its status changes.
@Component({
  selector: 'app-sales-return-form',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './sales-return-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SalesReturnFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };
  private salesReturnService = inject(SalesReturnService);
  private invoiceService = inject(InvoiceService);
  private statusInvoiceService = inject(StatusInvoiceService);
  readonly statusBadgeClass = statusBadgeClass;

  form = this.formBuilder.group({
    reason: ['', [Validators.required, Validators.maxLength(255)]],
    refundMethod: [''],
    statusInvoiceId: [''],
    lines: this.formBuilder.array<FormGroup>([]),
  });
  salesReturn?: SalesReturnDTOResponse;
  invoice?: InvoiceDTOResponse;
  invoiceKeyword = '';
  invoiceResults: InvoiceDTOResponse[] = [];
  statusOptions: StatusInvoiceDTOResponse[] = [];
  private allStatuses: StatusInvoiceDTOResponse[] = [];

  ngOnInit(): void {
    this.statusInvoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StatusInvoiceDTOResponse[]>) => {
        this.allStatuses = response.result;
        this.refreshStatusOptions();
      },
    });
    const id = this.route.snapshot.queryParamMap.get('id');
    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');
    if (id) {
      this.loadReturn(id);
    } else if (invoiceId) {
      this.selectInvoice(invoiceId);
    }
  }

  get isNew(): boolean {
    return !this.salesReturn;
  }

  get editable(): boolean {
    return this.isNew || this.salesReturn?.statusInvoice.code === 'PENDING';
  }

  lines(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }

  // Completed invoices only: returns are made against goods the customer paid for
  searchInvoices() {
    this.invoiceService.search(this.invoiceKeyword, 0, 10, 'COMPLETED').subscribe({
      next: (response: ApiResponse<PageResponse<InvoiceDTOResponse>>) => {
        this.invoiceResults = response.result.items;
        if (this.invoiceResults.length === 0) {
          this.toastrService.info('Không tìm thấy hóa đơn đã hoàn thành phù hợp', 'Thông báo', this.toastrConfig);
        }
      },
      error: (error: any) => this.showError(error),
    });
  }

  onInvoiceKeyword(event: Event) {
    this.invoiceKeyword = (event.target as HTMLInputElement).value;
  }

  selectInvoice(invoiceId: string) {
    this.invoiceResults = [];
    this.invoiceService.getDetail(invoiceId).subscribe({
      next: (response: ApiResponse<InvoiceDTOResponse>) => {
        this.invoice = response.result;
        this.loadReturnableLines(invoiceId, new Map());
      },
      error: (error: any) => this.showError(error),
    });
  }

  refundPreview(): number {
    return this.lines().controls.reduce(
      (sum, line) => sum + (Number(line.value.quantity) || 0) * (Number(line.value.unitRefund) || 0),
      0
    );
  }

  onSubmit() {
    const lines = this.lines()
      .controls.map((line) => ({ productId: line.value.productId, quantity: Number(line.value.quantity) || 0 }))
      .filter((line) => line.quantity > 0);
    if (this.editable && lines.length === 0) {
      this.toastrService.warning('Nhập số lượng trả cho ít nhất một sản phẩm', 'Cảnh báo !', this.toastrConfig);
      return;
    }
    const value = this.form.getRawValue();
    const request: SalesReturnDTORequest = {
      reason: (value.reason ?? '').trim(),
      statusInvoiceId: value.statusInvoiceId || null,
      refundMethod: (value.refundMethod || null) as SalesReturnDTORequest['refundMethod'],
      lines: this.editable ? lines : this.currentLines(),
    };
    const call = this.salesReturn
      ? this.salesReturnService.update(this.salesReturn.id, request)
      : this.salesReturnService.insert({ ...request, invoiceId: this.invoice?.id });
    call.subscribe({
      next: (response: ApiResponse<SalesReturnDTOResponse>) => {
        this.toastrService.success(`${response.result.code} - ${response.message}`, 'Thành công !', this.toastrConfig);
        this.router.navigate(['/home/sales-return']);
      },
      error: (error: any) => this.showError(error),
    });
  }

  private loadReturn(id: string) {
    this.salesReturnService.getDetail(id).subscribe({
      next: (response: ApiResponse<SalesReturnDTOResponse>) => {
        const salesReturn = response.result;
        this.salesReturn = salesReturn;
        this.form.patchValue({
          reason: salesReturn.reason,
          refundMethod: salesReturn.refundMethod,
          statusInvoiceId: salesReturn.statusInvoice.id,
        });
        this.refreshStatusOptions();
        const current = new Map(salesReturn.salesReturnDetails.map((d) => [d.product.id, d.quantity]));
        if (this.editable) {
          this.loadReturnableLines(salesReturn.invoiceId, current);
        } else {
          this.form.controls.reason.disable();
          this.form.controls.refundMethod.disable();
          salesReturn.salesReturnDetails.forEach((detail) =>
            this.lines().push(
              this.formBuilder.group({
                productId: [detail.product.id],
                productCode: [detail.product.code],
                productName: [detail.product.name],
                soldQuantity: [null],
                maxQuantity: [detail.quantity],
                unitRefund: [detail.unitRefund],
                quantity: [{ value: detail.quantity, disabled: true }],
              })
            )
          );
        }
      },
      error: (error: any) => this.showError(error),
    });
  }

  // The server counts this return as already returned, so its own quantities are added back to the limit
  private loadReturnableLines(invoiceId: string, current: Map<string, number>) {
    this.salesReturnService.returnableLines(invoiceId).subscribe({
      next: (response: ApiResponse<ReturnableLineDTOResponse[]>) => {
        this.lines().clear();
        response.result.forEach((line) => {
          const own = current.get(line.productId) ?? 0;
          const max = line.returnableQuantity + own;
          this.lines().push(
            this.formBuilder.group({
              productId: [line.productId],
              productCode: [line.productCode],
              productName: [line.productName],
              soldQuantity: [line.soldQuantity],
              maxQuantity: [max],
              unitRefund: [line.unitRefund],
              quantity: [{ value: own, disabled: max === 0 }, [Validators.min(0), Validators.max(max)]],
            })
          );
        });
      },
      error: (error: any) => this.showError(error),
    });
  }

  private currentLines() {
    return (this.salesReturn?.salesReturnDetails ?? []).map((d) => ({ productId: d.product.id, quantity: d.quantity }));
  }

  private refreshStatusOptions() {
    if (!this.salesReturn) {
      // "Chờ xử lý" is the empty default; a new return can't start cancelled
      this.statusOptions = this.allStatuses.filter((s) => s.code === 'COMPLETED');
      return;
    }
    const allowed = allowedStatusCodes(this.salesReturn.statusInvoice.code);
    this.statusOptions = this.allStatuses.filter((s) => allowed.includes(s.code));
  }

  private showError(error: any) {
    this.toastrService.error(error.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig);
  }
}
