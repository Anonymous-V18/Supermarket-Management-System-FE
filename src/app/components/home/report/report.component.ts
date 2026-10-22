import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../dtos/response/api-response/api-response.dto';
import {
  EmployeeSalesDTOResponse,
  ExpiringLotDTOResponse,
  InventoryRowDTOResponse,
  ProductSalesDTOResponse,
  RevenueByDayDTOResponse,
} from '../../../dtos/response/reports/report.dto';
import { WarehouseDTResponse } from '../../../dtos/response/warehouses/warehouse.dto';
import { ReportFilter, ReportService } from '../../../services/report.service';
import { RoleService } from '../../../services/role.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { downloadCsv } from '../../../utils/csv';
import { isoDate } from '../../../utils/document-status';

type ReportTab = 'revenue' | 'products' | 'employees' | 'inventory' | 'expiring';

// Sales figures count completed invoices only, minus completed returns (by return date)
@Component({
  selector: 'app-report',
  imports: [DecimalPipe],
  templateUrl: './report.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private warehouseService = inject(WarehouseService);
  private roleService = inject(RoleService);
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };

  readonly tabs: { key: ReportTab; label: string; icon: string; roles: string[] }[] = [
    { key: 'revenue', label: 'Doanh thu', icon: 'bi-graph-up', roles: ['ADMIN', 'ACCOUNTING_STAFF'] },
    { key: 'products', label: 'Sản phẩm bán chạy', icon: 'bi-trophy', roles: ['ADMIN', 'ACCOUNTING_STAFF'] },
    { key: 'employees', label: 'Theo nhân viên', icon: 'bi-person-badge', roles: ['ADMIN', 'ACCOUNTING_STAFF'] },
    { key: 'inventory', label: 'Tồn kho', icon: 'bi-boxes', roles: ['ADMIN', 'ACCOUNTING_STAFF', 'STOREKEEPER'] },
    { key: 'expiring', label: 'Sắp hết hạn', icon: 'bi-hourglass-split', roles: ['ADMIN', 'ACCOUNTING_STAFF', 'STOREKEEPER'] },
  ];
  visibleTabs = this.tabs;
  tab: ReportTab = 'revenue';
  filter: ReportFilter = { from: '', to: '', warehouseId: '' };
  lowStockOnly = false;
  withinDays = 30;
  warehouses: WarehouseDTResponse[] = [];
  loading = false;

  revenue: RevenueByDayDTOResponse[] = [];
  products: ProductSalesDTOResponse[] = [];
  employees: EmployeeSalesDTOResponse[] = [];
  inventory: InventoryRowDTOResponse[] = [];
  expiring: ExpiringLotDTOResponse[] = [];

  ngOnInit(): void {
    const today = new Date();
    this.filter.to = isoDate(today);
    this.filter.from = isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));
    this.visibleTabs = this.tabs.filter((t) => this.roleService.hasRole(t.roles));
    this.tab = this.visibleTabs[0]?.key ?? 'inventory';
    this.warehouseService.showAllNoParam().subscribe({
      next: (response: ApiResponse<WarehouseDTResponse[]>) => (this.warehouses = response.result),
    });
    this.load();
  }

  get usesDateRange(): boolean {
    return this.tab === 'revenue' || this.tab === 'products' || this.tab === 'employees';
  }

  select(tab: ReportTab) {
    this.tab = tab;
    this.load();
  }

  onFilter(field: 'from' | 'to' | 'warehouseId', event: Event) {
    this.filter = { ...this.filter, [field]: (event.target as HTMLInputElement).value };
  }

  onLowStockOnly(event: Event) {
    this.lowStockOnly = (event.target as HTMLInputElement).checked;
    this.load();
  }

  onWithinDays(event: Event) {
    this.withinDays = Number((event.target as HTMLSelectElement).value);
    this.load();
  }

  load() {
    this.loading = true;
    const done = { complete: () => (this.loading = false), error: (error: any) => this.showError(error) };
    switch (this.tab) {
      case 'revenue':
        this.reportService.revenueByDay(this.filter).subscribe({ next: (r) => (this.revenue = r.result), ...done });
        break;
      case 'products':
        this.reportService.topProducts(this.filter).subscribe({ next: (r) => (this.products = r.result), ...done });
        break;
      case 'employees':
        this.reportService.salesByEmployee(this.filter).subscribe({ next: (r) => (this.employees = r.result), ...done });
        break;
      case 'inventory':
        this.reportService
          .inventory(this.filter.warehouseId, this.lowStockOnly)
          .subscribe({ next: (r) => (this.inventory = r.result), ...done });
        break;
      case 'expiring':
        this.reportService
          .expiringLots(this.filter.warehouseId, this.withinDays)
          .subscribe({ next: (r) => (this.expiring = r.result), ...done });
        break;
    }
  }

  get totals() {
    const add = (pick: (d: RevenueByDayDTOResponse) => number) =>
      this.revenue.reduce((total, day) => total + (Number(pick(day)) || 0), 0);
    return {
      invoiceCount: add((d) => d.invoiceCount),
      revenue: add((d) => d.revenue),
      refunds: add((d) => d.refunds),
      netRevenue: add((d) => d.netRevenue),
      grossProfit: add((d) => d.grossProfit),
    };
  }

  get lowStockCount(): number {
    return this.inventory.filter((row) => row.lowStock).length;
  }

  get stockValue(): number {
    return this.inventory.reduce((total, row) => total + (Number(row.stockValue) || 0), 0);
  }

  // Bar length relative to the best day of the range
  barWidth(value: number): number {
    const max = Math.max(...this.revenue.map((d) => d.netRevenue), 0);
    return max > 0 ? Math.max((value / max) * 100, 0) : 0;
  }

  exportCsv() {
    const range = `${this.filter.from}_${this.filter.to}`;
    switch (this.tab) {
      case 'revenue':
        downloadCsv(`doanh-thu_${range}.csv`,
          ['Ngày', 'Số hóa đơn', 'Doanh thu', 'Hoàn trả', 'Doanh thu thuần', 'Giá vốn', 'Lãi gộp'],
          this.revenue.map((d) => [d.date, d.invoiceCount, d.revenue, d.refunds, d.netRevenue, d.cost, d.grossProfit]));
        break;
      case 'products':
        downloadCsv(`san-pham-ban-chay_${range}.csv`, ['Mã', 'Sản phẩm', 'Số lượng', 'Doanh thu', 'Lãi gộp'],
          this.products.map((p) => [p.productCode, p.productName, p.quantity, p.revenue, p.grossProfit]));
        break;
      case 'employees':
        downloadCsv(`nhan-vien_${range}.csv`, ['Mã NV', 'Nhân viên', 'Số hóa đơn', 'Doanh thu'],
          this.employees.map((e) => [e.employeeCode, e.employeeName, e.invoiceCount, e.revenue]));
        break;
      case 'inventory':
        downloadCsv('ton-kho.csv', ['Kho', 'Mã', 'Sản phẩm', 'Mã vạch', 'ĐVT', 'Tồn', 'Tồn tối thiểu', 'Giá vốn', 'Giá trị tồn'],
          this.inventory.map((i) => [i.warehouseName, i.productCode, i.productName, i.barcode, i.unitName, i.quantity, i.minStock, i.costPrice, i.stockValue]));
        break;
      case 'expiring':
        downloadCsv('sap-het-han.csv', ['Kho', 'Mã', 'Sản phẩm', 'Số lô', 'Hạn sử dụng', 'Còn (ngày)', 'Số lượng còn', 'Phiếu nhập'],
          this.expiring.map((l) => [l.warehouseName, l.productCode, l.productName, l.lotNumber, l.expiryDate, l.daysLeft, l.quantity, l.stockInCode]));
        break;
    }
  }

  private showError(error: any) {
    this.loading = false;
    this.toastrService.error(error.error?.message ?? 'Không tải được báo cáo', 'Lỗi !', this.toastrConfig);
  }
}
