import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import {
  EmployeeSalesDTOResponse,
  ExpiringLotDTOResponse,
  InventoryRowDTOResponse,
  ProductSalesDTOResponse,
  RevenueByDayDTOResponse,
} from '../dtos/response/reports/report.dto';
import { ApiUrl } from '../environments/api-url';

// from / to are inclusive yyyy-MM-dd; empty warehouse = all warehouses
export interface ReportFilter {
  from: string;
  to: string;
  warehouseId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private httpClient = inject(HttpClient);

  revenueByDay(filter: ReportFilter): Observable<ApiResponse<RevenueByDayDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<RevenueByDayDTOResponse[]>>(ApiUrl.report.revenueByDay, {
      params: this.rangeParams(filter),
    });
  }

  topProducts(filter: ReportFilter, limit = 20): Observable<ApiResponse<ProductSalesDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<ProductSalesDTOResponse[]>>(ApiUrl.report.topProducts, {
      params: this.rangeParams(filter).set('limit', limit),
    });
  }

  salesByEmployee(filter: ReportFilter): Observable<ApiResponse<EmployeeSalesDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<EmployeeSalesDTOResponse[]>>(ApiUrl.report.salesByEmployee, {
      params: this.rangeParams(filter),
    });
  }

  inventory(warehouseId: string, lowStockOnly = false): Observable<ApiResponse<InventoryRowDTOResponse[]>> {
    let params = new HttpParams().set('lowStockOnly', lowStockOnly);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.httpClient.get<ApiResponse<InventoryRowDTOResponse[]>>(ApiUrl.report.inventory, { params });
  }

  expiringLots(warehouseId: string, withinDays: number): Observable<ApiResponse<ExpiringLotDTOResponse[]>> {
    let params = new HttpParams().set('withinDays', withinDays);
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.httpClient.get<ApiResponse<ExpiringLotDTOResponse[]>>(ApiUrl.report.expiringLots, { params });
  }

  private rangeParams(filter: ReportFilter): HttpParams {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.warehouseId) params = params.set('warehouseId', filter.warehouseId);
    return params;
  }
}
