import { DecimalPipe } from '@angular/common';
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
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { RoleService } from '../../../../services/role.service';
import { ProductService } from '../../../../services/product.service';
import { PagerComponent } from '../../../shared/pager/pager.component';

@Component({
  selector: 'app-product-show',
  imports: [DecimalPipe, PagerComponent, RouterLink],
  templateUrl: './product-show.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-show.component.css',
})
export class ProductShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private productService = inject(ProductService);
  private roleService = inject(RoleService);
  private destroyRef = inject(DestroyRef);
  private keywordChanges = new Subject<string>();
  private readonly pageSize = 20;
  productDTOs: ProductDTOResponse[] = [];
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
    this.productService.search(this.keyword, page, this.pageSize).subscribe({
      next: (response: ApiResponse<PageResponse<ProductDTOResponse>>) => {
        this.productDTOs = response.result.items;
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
    return this.roleService.hasRole(['ADMIN', 'STOREKEEPER']);
  }

  // Soft delete on the server; completed documents must be cancelled instead
  delete(item: ProductDTOResponse) {
    if (!confirm('Xóa sản phẩm này? Dữ liệu vẫn được lưu lại để tra cứu lịch sử.')) return;
    this.productService.delete([item.id]).subscribe({
      next: (response: ApiResponse<void>) => {
        this.toastrService.success(response.message, 'Thành công !', this.toastrConfig);
        this.load(this.page);
      },
      error: (error: any) => {
        this.toastrService.error(error.error.message, 'Lỗi !', this.toastrConfig);
      },
    });
  }

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
