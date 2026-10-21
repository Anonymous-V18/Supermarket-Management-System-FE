import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { RouterLink } from '@angular/router';
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

interface ChecklistItem {
  id: string;
  label: string;
  group: 'start' | 'end';
}

// Shift times are the store's convention — adjust here if they change.
const SHIFTS: Shift[] = [
  { code: 'MORNING', name: 'Ca sáng', start: 6, end: 14 },
  { code: 'AFTERNOON', name: 'Ca chiều', start: 14, end: 22 },
  { code: 'NIGHT', name: 'Ca đêm', start: 22, end: 6 },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  STOREKEEPER: 'Thủ kho',
  SALESMAN: 'Thu ngân',
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

const CHECKLIST: ChecklistItem[] = [
  { id: 'printer', label: 'Kiểm tra máy in hóa đơn và giấy in', group: 'start' },
  { id: 'scanner', label: 'Kiểm tra máy quét mã vạch', group: 'start' },
  { id: 'cash-start', label: 'Kiểm đếm tiền lẻ trong két', group: 'start' },
  { id: 'unpaid', label: 'Rà soát hóa đơn chưa thanh toán', group: 'end' },
  { id: 'cash-end', label: 'Đối chiếu tiền mặt cuối ca', group: 'end' },
  { id: 'handover', label: 'Bàn giao ca và đăng xuất', group: 'end' },
];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
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

  readonly startItems = CHECKLIST.filter((item) => item.group === 'start');
  readonly endItems = CHECKLIST.filter((item) => item.group === 'end');
  readonly checked = signal<Set<string>>(new Set());
  readonly progress = computed(() =>
    Math.round((this.checked().size / CHECKLIST.length) * 100)
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Browser only: a running interval would keep SSR from settling.
    afterNextRender(() => {
      this.loadChecklist();
      const timer = setInterval(() => {
        const previousShift = this.shift().code;
        this.now.set(new Date());
        if (this.shift().code !== previousShift) {
          this.loadChecklist();
        }
      }, 1000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  toggle(id: string): void {
    const next = new Set(this.checked());
    next.has(id) ? next.delete(id) : next.add(id);
    this.checked.set(next);
    this.localStorageService.set(
      this.checklistKey(),
      JSON.stringify([...next])
    );
  }

  private loadChecklist(): void {
    try {
      const saved = JSON.parse(
        this.localStorageService.get(this.checklistKey()) ?? '[]'
      );
      this.checked.set(new Set(Array.isArray(saved) ? saved : []));
    } catch {
      this.checked.set(new Set());
    }
  }

  // One checklist per user, per shift, per working day.
  private checklistKey(): string {
    const now = this.now();
    const shift = this.shift();
    // The night shift belongs to the day it started on.
    const day = new Date(now);
    if (shift.start > shift.end && now.getHours() < shift.end) {
      day.setDate(day.getDate() - 1);
    }
    const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    return `shift-checklist:${this.username}:${date}:${shift.code}`;
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
