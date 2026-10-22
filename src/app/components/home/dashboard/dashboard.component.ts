import { DatePipe, DecimalPipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, concatMap, debounceTime, EMPTY, Subject, tap } from 'rxjs';
import { ShiftChecklistDTORequest } from '../../../dtos/request/dashboard/shift-checklist.dto';
import { DashboardSummaryDTOResponse } from '../../../dtos/response/dashboard/dashboard-summary.dto';
import {
  ChecklistItemDTOResponse,
  ShiftChecklistDTOResponse,
} from '../../../dtos/response/dashboard/shift-checklist.dto';
import { DashboardService } from '../../../services/dashboard.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { RoleService } from '../../../services/role.service';

interface QuickAction {
  label: string;
  hint: string;
  icon: string;
  link: string[];
  roles: string[];
  primary?: boolean;
  shortcut?: string;
}

interface Shift {
  code: string;
  name: string;
  start: number; // hour, inclusive
  end: number; // hour, exclusive
}

type SyncState = 'idle' | 'loading' | 'saving' | 'saved' | 'offline';

const SUMMARY_REFRESH_MS = 2 * 60 * 1000;

// Shift times are the store's convention — adjust here if they change.
const SHIFTS: Shift[] = [
  { code: 'MORNING', name: 'Ca sáng', start: 6, end: 14 },
  { code: 'AFTERNOON', name: 'Ca chiều', start: 14, end: 22 },
  { code: 'NIGHT', name: 'Ca đêm', start: 22, end: 6 },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  STOREKEEPER: 'Thủ kho',
  SALESMAN: 'Nhân viên bán hàng',
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Tạo hóa đơn bán hàng',
    hint: 'Bắt đầu thanh toán cho khách',
    icon: 'bi-cart-plus',
    link: ['/home/invoice/create'],
    roles: ['ADMIN', 'SALESMAN'],
    primary: true,
    shortcut: 'F2',
  },
  {
    label: 'Tạo phiếu nhập kho',
    hint: 'Ghi nhận hàng nhập từ nhà cung cấp',
    icon: 'bi-box-arrow-in-down',
    link: ['/home/stockin/create'],
    roles: ['STOREKEEPER'],
    primary: true,
  },
  {
    label: 'Hóa đơn bán hàng',
    hint: 'Xem, cập nhật trạng thái hóa đơn',
    icon: 'bi-receipt',
    link: ['/home/invoice'],
    roles: ['ADMIN', 'SALESMAN'],
  },
  {
    label: 'Tra cứu sản phẩm',
    hint: 'Đơn vị tính, loại, hãng',
    icon: 'bi-search',
    link: ['/home/product'],
    roles: ['ADMIN', 'STOREKEEPER', 'SALESMAN'],
  },
  {
    label: 'Kho hàng',
    hint: 'Danh sách kho',
    icon: 'bi-shop',
    link: ['/home/warehouse'],
    roles: ['ADMIN', 'STOREKEEPER', 'SALESMAN'],
  },
  {
    label: 'Nhập kho',
    hint: 'Phiếu nhập kho',
    icon: 'bi-box-arrow-in-down',
    link: ['/home/stockin'],
    roles: ['ADMIN', 'STOREKEEPER'],
  },
  {
    label: 'Xuất kho',
    hint: 'Phiếu xuất kho',
    icon: 'bi-box-arrow-up',
    link: ['/home/stockout'],
    roles: ['ADMIN', 'STOREKEEPER'],
  },
  {
    label: 'Nhà cung cấp',
    hint: 'Thông tin liên hệ',
    icon: 'bi-truck',
    link: ['/home/supplier'],
    roles: ['ADMIN', 'STOREKEEPER'],
  },
  {
    label: 'Nhân sự',
    hint: 'Quản lý nhân viên',
    icon: 'bi-people',
    link: ['/home/employee'],
    roles: ['ADMIN'],
  },
  {
    label: 'Đổi mật khẩu',
    hint: 'Bảo mật tài khoản',
    icon: 'bi-key',
    link: ['/home/account/change-password'],
    roles: [],
  },
];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private localStorageService = inject(LocalStorageService);
  private roleService = inject(RoleService);

  readonly name = this.localStorageService.get('name') ?? '';
  readonly username = this.localStorageService.get('username') ?? '';
  readonly roleLabels = (this.localStorageService.get('roles') ?? '')
    .split(',')
    .filter(Boolean)
    .map((code) => ROLE_LABELS[code] ?? code);

  readonly now = signal(new Date());
  readonly shift = computed(() => this.shiftOf(this.now()));
  readonly greeting = computed(() => {
    const hour = this.now().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  });

  readonly actions = QUICK_ACTIONS.filter(
    (action) =>
      action.roles.length === 0 || this.roleService.hasRole(action.roles)
  );
  readonly primaryActions = this.actions.filter((action) => action.primary);
  readonly otherActions = this.actions.filter((action) => !action.primary);

  // Tasks come from the backend (checklist_item table), already in display order.
  readonly items = signal<ChecklistItemDTOResponse[]>([]);
  readonly startItems = computed(() =>
    this.items().filter((item) => item.groupCode === 'START')
  );
  readonly endItems = computed(() =>
    this.items().filter((item) => item.groupCode === 'END')
  );
  readonly checked = signal<Set<string>>(new Set());
  readonly notes = signal('');
  readonly syncState = signal<SyncState>('idle');
  readonly progress = computed(() => {
    const items = this.items();
    if (!items.length) return 0;
    const checked = this.checked();
    const done = items.filter((item) => checked.has(item.code)).length;
    return Math.round((done / items.length) * 100);
  });

  // Storekeepers don't sell, so they get no sales figures.
  readonly showSales = this.roleService.hasRole(['ADMIN', 'SALESMAN']);
  readonly summary = signal<DashboardSummaryDTOResponse | null>(null);

  private dashboardService = inject(DashboardService);
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private saveQueue = new Subject<ShiftChecklistDTORequest>();
  // Set when the user edits before the server copy arrives, so it isn't overwritten.
  private editedSinceLoad = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Each save sends the whole checklist, so saves run in order and the last one wins.
    this.saveQueue
      .pipe(
        debounceTime(400),
        tap(() => this.syncState.set('saving')),
        concatMap((request) =>
          this.dashboardService
            .saveShiftChecklist(request)
            .pipe(
              tap(() => this.syncState.set('saved')),
              catchError((error: any) => {
                this.syncState.set('offline');
                this.toastrService.error(
                  error?.error?.message ?? 'Không thể lưu danh sách công việc lên hệ thống.',
                  'Lỗi !',
                  this.toastrConfig
                );
                return EMPTY;
              })
            )
        ),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe();

    // Browser only: a running interval would keep SSR from settling.
    afterNextRender(() => {
      this.loadChecklist();
      this.loadSummary();
      const timer = setInterval(() => {
        const previousShift = this.shift().code;
        this.now.set(new Date());
        if (this.shift().code !== previousShift) {
          this.summary.set(null);
          this.loadChecklist();
          this.loadSummary();
        }
      }, 1000);
      const summaryTimer = setInterval(
        () => this.loadSummary(),
        SUMMARY_REFRESH_MS
      );
      destroyRef.onDestroy(() => {
        clearInterval(timer);
        clearInterval(summaryTimer);
      });
    });
  }

  toggle(code: string): void {
    const next = new Set(this.checked());
    next.has(code) ? next.delete(code) : next.add(code);
    this.checked.set(next);
    this.persist();
  }

  setNotes(event: Event): void {
    this.notes.set((event.target as HTMLTextAreaElement).value);
    this.persist();
  }

  loadSummary(): void {
    if (!this.showSales) return;
    const { date, shiftCode } = this.workShift();
    this.dashboardService.getSummary(date, shiftCode).subscribe({
      next: (response) => {
        if (this.workShift().shiftCode === shiftCode) {
          this.summary.set(response.result);
        }
      },
      // Keep the last figures; the tiles show a placeholder until the first load succeeds.
      error: () => {},
    });
  }

  private persist(): void {
    this.editedSinceLoad = true;
    const { date, shiftCode } = this.workShift();
    const request = new ShiftChecklistDTORequest(
      date,
      shiftCode,
      [...this.checked()],
      this.notes()
    );
    // Local copy (with the task list) keeps the checklist usable when the server can't be reached.
    const cached: Partial<ShiftChecklistDTOResponse> = {
      items: this.items(),
      checkedItemIds: request.checkedItemIds,
      notes: request.notes ?? '',
    };
    this.localStorageService.set(this.checklistKey(), JSON.stringify(cached));
    this.saveQueue.next(request);
  }

  private loadChecklist(): void {
    this.applyChecklist(this.readLocalChecklist());
    this.editedSinceLoad = false;
    this.syncState.set('loading');

    const { date, shiftCode } = this.workShift();
    this.dashboardService
      .getShiftChecklist(date, shiftCode)
      .subscribe({
        next: (response) => {
          if (this.editedSinceLoad || this.workShift().shiftCode !== shiftCode) {
            return;
          }
          const checklist = response.result;
          this.applyChecklist(checklist);
          this.localStorageService.set(
            this.checklistKey(),
            JSON.stringify(checklist)
          );
          this.syncState.set('saved');
        },
        error: () => this.syncState.set('offline'),
      });
  }

  private applyChecklist(
    checklist: Partial<ShiftChecklistDTOResponse> | null
  ): void {
    // Older caches have no task list; keep whatever list is already shown.
    if (checklist?.items?.length) {
      this.items.set(checklist.items);
    }
    // Drop codes of tasks that are no longer active.
    const knownCodes = new Set(this.items().map((item) => item.code));
    this.checked.set(
      new Set(
        (checklist?.checkedItemIds ?? []).filter((code) => knownCodes.has(code))
      )
    );
    this.notes.set(checklist?.notes ?? '');
  }

  private readLocalChecklist(): Partial<ShiftChecklistDTOResponse> | null {
    try {
      const saved = JSON.parse(
        this.localStorageService.get(this.checklistKey()) ?? 'null'
      );
      // Older versions stored only the array of checked ids.
      if (Array.isArray(saved)) return { checkedItemIds: saved };
      return saved && typeof saved === 'object' ? saved : null;
    } catch {
      return null;
    }
  }

  // One checklist per user, per shift, per working day.
  private checklistKey(): string {
    const { date, shiftCode } = this.workShift();
    return `shift-checklist:${this.username}:${date}:${shiftCode}`;
  }

  // Working day (yyyy-MM-dd) and code of the current shift, as the backend expects them.
  private workShift(): { date: string; shiftCode: string } {
    const now = this.now();
    const shift = this.shift();
    // The night shift belongs to the day it started on.
    const day = new Date(now);
    if (shift.start > shift.end && now.getHours() < shift.end) {
      day.setDate(day.getDate() - 1);
    }
    const pad = (value: number) => String(value).padStart(2, '0');
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    return { date, shiftCode: shift.code };
  }

  private shiftOf(date: Date): Shift {
    const hour = date.getHours();
    return (
      SHIFTS.find((shift) =>
        shift.start < shift.end
          ? hour >= shift.start && hour < shift.end
          : hour >= shift.start || hour < shift.end
      ) ?? SHIFTS[0]
    );
  }
}
