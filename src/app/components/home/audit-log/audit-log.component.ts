import { DatePipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';
import { ApiResponse } from '../../../dtos/response/api-response/api-response.dto';
import { PageResponse } from '../../../dtos/response/page/page-response.dto';
import { AuditLogDTOResponse } from '../../../dtos/response/reports/report.dto';
import { AuditLogFilter, AuditLogService } from '../../../services/audit-log.service';
import { PagerComponent } from '../../shared/pager/pager.component';

// Admin only: who changed what, including refused attempts and sign-ins
@Component({
  selector: 'app-audit-log',
  imports: [DatePipe, KeyValuePipe, PagerComponent],
  templateUrl: './audit-log.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AuditLogComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  private toastrService = inject(ToastrService);
  private destroyRef = inject(DestroyRef);
  private keywordChanges = new Subject<string>();
  private readonly pageSize = 30;
  readonly actionLabels: Record<string, string> = {
    CREATE: 'Thêm',
    UPDATE: 'Sửa',
    DELETE: 'Xóa',
    LOGIN: 'Đăng nhập',
    LOGOUT: 'Đăng xuất',
  };
  filter: AuditLogFilter = { keyword: '', action: '', from: '', to: '' };
  logs: AuditLogDTOResponse[] = [];
  page = 0;
  totalPages = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.keywordChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((keyword) => {
        this.filter = { ...this.filter, keyword };
        this.load(0);
      });
    this.load(0);
  }

  onKeyword(event: Event) {
    this.keywordChanges.next((event.target as HTMLInputElement).value);
  }

  onFilter(field: 'action' | 'from' | 'to', event: Event) {
    this.filter = { ...this.filter, [field]: (event.target as HTMLInputElement).value };
    this.load(0);
  }

  load(page: number) {
    this.auditLogService.search(this.filter, page, this.pageSize).subscribe({
      next: (response: ApiResponse<PageResponse<AuditLogDTOResponse>>) => {
        this.logs = response.result.items;
        this.page = response.result.page;
        this.totalPages = response.result.totalPages;
        this.totalItems = response.result.totalItems;
      },
      error: (error: any) =>
        this.toastrService.error(error.error?.message ?? 'Không tải được nhật ký', 'Lỗi !', {
          timeOut: 3000,
          closeButton: true,
          progressBar: true,
        }),
    });
  }

  actionClass(action: string): string {
    switch (action) {
      case 'CREATE':
        return 'badge border border-success text-success';
      case 'DELETE':
        return 'badge border border-danger text-danger';
      case 'UPDATE':
        return 'badge border border-primary text-primary';
      default:
        return 'badge border border-secondary text-secondary';
    }
  }
}
