import { DatePipe } from '@angular/common';
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
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { RoleService } from '../../../../services/role.service';
import { WarehouseService } from '../../../../services/warehouse.service';
import { PagerComponent } from '../../../shared/pager/pager.component';

@Component({
  selector: 'app-warehouse-show',
  imports: [DatePipe, PagerComponent, RouterLink],
  templateUrl: './warehouse-show.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './warehouse-show.component.css',
})
export class WarehouseShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private warehouseService = inject(WarehouseService);
  private roleService = inject(RoleService);
  private destroyRef = inject(DestroyRef);
  private keywordChanges = new Subject<string>();
  private readonly pageSize = 20;
  warehouseDTOs: WarehouseDTResponse[] = [];
  keyword = '';
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

  load(page: number) {
    this.warehouseService.search(this.keyword, page, this.pageSize).subscribe({
      next: (response: ApiResponse<PageResponse<WarehouseDTResponse>>) => {
        this.warehouseDTOs = response.result.items;
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

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
