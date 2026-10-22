import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { StockTakeDTOResponse } from '../../../../dtos/response/operations/operations.dto';
import { PageResponse } from '../../../../dtos/response/page/page-response.dto';
import { RoleService } from '../../../../services/role.service';
import { StockTakeService } from '../../../../services/stock-take.service';
import { statusBadgeClass } from '../../../../utils/document-status';
import { PagerComponent } from '../../../shared/pager/pager.component';

@Component({
  selector: 'app-stock-take-show',
  imports: [DatePipe, DecimalPipe, PagerComponent, RouterLink],
  templateUrl: './stock-take-show.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StockTakeShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };
  private service = inject(StockTakeService);
  private roleService = inject(RoleService);
  private destroyRef = inject(DestroyRef);
  private keywordChanges = new Subject<string>();
  private readonly pageSize = 20;
  readonly statusBadgeClass = statusBadgeClass;
  items: StockTakeDTOResponse[] = [];
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
    this.service.search(this.keyword, page, this.pageSize, this.status).subscribe({
      next: (response: ApiResponse<PageResponse<StockTakeDTOResponse>>) => {
        this.items = response.result.items;
        this.page = response.result.page;
        this.totalPages = response.result.totalPages;
        this.totalItems = response.result.totalItems;
      },
      error: (error: any) => {
        this.toastrService.error(error.error?.message, 'Lỗi !', this.toastrConfig);
      },
    });
  }

  canWrite(): boolean {
    return this.roleService.hasRole(['ADMIN', 'STOREKEEPER']);
  }

  statusName(code: string, name: string): string {
    return code === 'PENDING' ? 'Đang kiểm' : code === 'COMPLETED' ? 'Đã cân bằng kho' : name;
  }

  // Soft delete on the server; completed documents must be cancelled instead
  delete(item: StockTakeDTOResponse) {
    if (!confirm('Xóa phiếu kiểm kê này? Phiếu chưa hoàn thành nên tồn kho không đổi.')) return;
    this.service.delete([item.id]).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(response.message, 'Thành công !', this.toastrConfig);
        this.load(this.page);
      },
      error: (error: any) => {
        this.toastrService.error(error.error?.message, 'Lỗi !', this.toastrConfig);
      },
    });
  }
}
