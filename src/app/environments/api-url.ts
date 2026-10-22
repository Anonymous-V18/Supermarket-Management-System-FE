import { environment } from './environment';

export const ApiUrl = {
  login: `${environment.apiUrl}/auth/login`,
  warehouse: {
    search: `${environment.apiUrl}/warehouses/search`,
    showAllNoParam: `${environment.apiUrl}/warehouses/show-all-no-param`,
    insert: `${environment.apiUrl}/warehouses/insert`,
    update: `${environment.apiUrl}/warehouses/update`,
    getDetail: `${environment.apiUrl}/warehouses/get-detail`,
  },
  supplier: {
    search: `${environment.apiUrl}/suppliers/search`,
    showAllNoParam: `${environment.apiUrl}/suppliers/show-all-no-param`,
    insert: `${environment.apiUrl}/suppliers/insert`,
    update: `${environment.apiUrl}/suppliers/update`,
    getDetail: `${environment.apiUrl}/suppliers/get-detail`,
  },
  product: {
    search: `${environment.apiUrl}/products/search`,
    delete: `${environment.apiUrl}/products/delete`,
    getByBarcode: `${environment.apiUrl}/products/get-by-barcode`,
    showAllNoParam: `${environment.apiUrl}/products/show-all-no-param`,
    insert: `${environment.apiUrl}/products/insert`,
    update: `${environment.apiUrl}/products/update`,
    getDetail: `${environment.apiUrl}/products/get-detail`,
    getCommonDetail: `${environment.apiUrl}/products/get-common-detail`,
  },
  productCategory: {
    showAllNoParam: `${environment.apiUrl}/product-categories/show-all-no-param`,
  },
  brand: {
    showAllNoParam: `${environment.apiUrl}/brands/show-all-no-param`,
  },
  unit: {
    showAllNoParam: `${environment.apiUrl}/units/show-all-no-param`,
  },
  employee: {
    search: `${environment.apiUrl}/employees/search`,
    showAllNoParam: `${environment.apiUrl}/employees/show-all-no-param`,
    insert: `${environment.apiUrl}/employees/insert`,
    update: `${environment.apiUrl}/employees/update`,
    getDetail: `${environment.apiUrl}/employees/get-detail`,
    getMyInfo: `${environment.apiUrl}/employees/get-my-info`,
  },
  customer: {
    search: `${environment.apiUrl}/customers/search`,
    showAllNoParam: `${environment.apiUrl}/customers/show-all-no-param`,
  },
  stockin: {
    search: `${environment.apiUrl}/stock-ins/search`,
    delete: `${environment.apiUrl}/stock-ins/delete`,
    showAllNoParam: `${environment.apiUrl}/stock-ins/show-all-no-param`,
    insert: `${environment.apiUrl}/stock-ins/insert`,
    update: `${environment.apiUrl}/stock-ins/update`,
    getDetail: `${environment.apiUrl}/stock-ins/get-detail`,
  },
  stockout: {
    search: `${environment.apiUrl}/stock-outs/search`,
    delete: `${environment.apiUrl}/stock-outs/delete`,
    showAllNoParam: `${environment.apiUrl}/stock-outs/show-all-no-param`,
    insert: `${environment.apiUrl}/stock-outs/insert`,
    update: `${environment.apiUrl}/stock-outs/update`,
    getDetail: `${environment.apiUrl}/stock-outs/get-detail`,
  },
  invoice: {
    search: `${environment.apiUrl}/invoices/search`,
    delete: `${environment.apiUrl}/invoices/delete`,
    showAllNoParam: `${environment.apiUrl}/invoices/show-all-no-param`,
    insert: `${environment.apiUrl}/invoices/insert`,
    update: `${environment.apiUrl}/invoices/update`,
    getDetail: `${environment.apiUrl}/invoices/get-detail`,
  },
  statusInvoice: {
    showAllNoParam: `${environment.apiUrl}/status-invoices/show-all-no-param`,
  },
  city: {
    showAllNoParam: `${environment.apiUrl}/cities/show-all-no-param`,
  },
  district: {
    showAllNoParam: `${environment.apiUrl}/districts/show-all-no-param`,
    getAllByCity: `${environment.apiUrl}/districts/get-all-by-city`,
  },
  ward: {
    showAllNoParam: `${environment.apiUrl}/wards/show-all-no-param`,
    getAllByDistrict: `${environment.apiUrl}/wards/get-all-by-district`,
  },
  role: {
    showAllNoParam: `${environment.apiUrl}/roles/show-all-no-param`,
  },
  position: {
    showAllNoParam: `${environment.apiUrl}/positions/show-all-no-param`,
  },
  user: {
    changePassword: `${environment.apiUrl}/users/update/change-password`,
  },
  dashboard: {
    summary: `${environment.apiUrl}/dashboard/summary`,
    shiftChecklist: `${environment.apiUrl}/dashboard/shift-checklist`,
  },
  salesReturn: {
    search: `${environment.apiUrl}/sales-returns/search`,
    delete: `${environment.apiUrl}/sales-returns/delete`,
    insert: `${environment.apiUrl}/sales-returns/insert`,
    update: `${environment.apiUrl}/sales-returns/update`,
    getDetail: `${environment.apiUrl}/sales-returns/get-detail`,
    returnableLines: `${environment.apiUrl}/sales-returns/returnable-lines`,
  },
  stockTake: {
    search: `${environment.apiUrl}/stock-takes/search`,
    delete: `${environment.apiUrl}/stock-takes/delete`,
    insert: `${environment.apiUrl}/stock-takes/insert`,
    update: `${environment.apiUrl}/stock-takes/update`,
    getDetail: `${environment.apiUrl}/stock-takes/get-detail`,
  },
  stockTransfer: {
    search: `${environment.apiUrl}/stock-transfers/search`,
    delete: `${environment.apiUrl}/stock-transfers/delete`,
    insert: `${environment.apiUrl}/stock-transfers/insert`,
    update: `${environment.apiUrl}/stock-transfers/update`,
    getDetail: `${environment.apiUrl}/stock-transfers/get-detail`,
  },
  report: {
    revenueByDay: `${environment.apiUrl}/reports/revenue-by-day`,
    topProducts: `${environment.apiUrl}/reports/top-products`,
    salesByEmployee: `${environment.apiUrl}/reports/sales-by-employee`,
    inventory: `${environment.apiUrl}/reports/inventory`,
    expiringLots: `${environment.apiUrl}/reports/expiring-lots`,
  },
  auditLog: {
    search: `${environment.apiUrl}/audit-logs/search`,
  },
  checklistItem: {
    showAllNoParam: `${environment.apiUrl}/checklist-items/show-all-no-param`,
    insert: `${environment.apiUrl}/checklist-items/insert`,
    update: `${environment.apiUrl}/checklist-items/update`,
  },
  logout: `${environment.apiUrl}/auth/logout`,
};
