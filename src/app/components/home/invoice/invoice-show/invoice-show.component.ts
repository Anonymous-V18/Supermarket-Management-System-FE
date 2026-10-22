import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { PageResponse } from '../../../../dtos/response/page/page-response.dto';
import { InvoiceDTOResponse } from '../../../../dtos/response/invoices/invoice.dto';
import { RoleService } from '../../../../services/role.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { PagerComponent } from '../../../shared/pager/pager.component';

@Component({
  selector: 'app-invoice-show',
  imports: [DatePipe, DecimalPipe, PagerComponent, RouterLink],
  templateUrl: './invoice-show.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice-show.component.css',
})
export class InvoiceShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private invoiceService = inject(InvoiceService);
  private roleService = inject(RoleService);
  private destroyRef = inject(DestroyRef);
  private keywordChanges = new Subject<string>();
  private readonly pageSize = 20;
  invoiceDTOs: InvoiceDTOResponse[] = [];
  keyword = '';
  status = '';
  page = 0;
  totalPages = 0;
  totalItems = 0;

  ngOnInit(): void {
    // Search as the user types, without a request per keystroke
    this.keywordChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((keyword) => {
        this.keyword = keyword;
        this.load(0);
      });
    this.load(0);
  }

  onKeyword(event: Event) {
    this.keywordChanges.next((event.target as HTMLInputElement).value);
  }

  onStatus(event: Event) {
    this.status = (event.target as HTMLSelectElement).value;
    this.load(0);
  }

  load(page: number) {
    this.invoiceService.search(this.keyword, page, this.pageSize, this.status).subscribe({
      next: (response: ApiResponse<PageResponse<InvoiceDTOResponse>>) => {
        this.invoiceDTOs = response.result.items;
        this.page = response.result.page;
        this.totalPages = response.result.totalPages;
        this.totalItems = response.result.totalItems;
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

  canDelete(): boolean {
    return this.roleService.hasRole(['ADMIN', 'SALESMAN']);
  }

  // Soft delete on the server; completed documents must be cancelled instead
  delete(item: InvoiceDTOResponse) {
    if (!confirm('Xóa hóa đơn này? Dữ liệu vẫn được lưu lại để tra cứu lịch sử.')) return;
    this.invoiceService.delete([item.id]).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(response.message, 'Thành công !', this.toastrConfig);
        this.load(this.page);
      },
      error: (error: any) => {
        this.toastrService.error(error.error.message, 'Lỗi !', this.toastrConfig);
      },
    });
  }
}
