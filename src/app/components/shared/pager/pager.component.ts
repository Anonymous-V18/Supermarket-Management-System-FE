import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

// Previous / next paging under a list table
@Component({
  selector: 'app-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalItems() > 0) {
    <nav
      class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3"
      aria-label="Phân trang"
    >
      <span class="small text-secondary">
        Trang {{ page() + 1 }} / {{ totalPages() }} · {{ totalItems() }} bản ghi
      </span>
      <div class="btn-group">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          [disabled]="page() === 0"
          (click)="pageChange.emit(page() - 1)"
        >
          <i class="bi bi-chevron-left"></i> Trước
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          [disabled]="page() + 1 >= totalPages()"
          (click)="pageChange.emit(page() + 1)"
        >
          Sau <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </nav>
    }
  `,
})
export class PagerComponent {
  readonly page = input(0);
  readonly totalPages = input(0);
  readonly totalItems = input(0);
  readonly pageChange = output<number>();
}
