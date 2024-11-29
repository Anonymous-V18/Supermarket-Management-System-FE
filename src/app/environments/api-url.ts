import { environment } from './environment';

export const ApiUrl = {
  login: `${environment.apiUrl}/auth/login`,
  warehouse: {
    showAllNoParam: `${environment.apiUrl}/warehouses/show-all-no-param`,
  },
  supplier: {
    showAllNoParam: `${environment.apiUrl}/suppliers/show-all-no-param`,
  },
  product: {
    showAllNoParam: `${environment.apiUrl}/products/show-all-no-param`,
    getCommonDetail: `${environment.apiUrl}/products/get-common-detail`,
  },
  employee: {
    showAllNoParam: `${environment.apiUrl}/employees/show-all-no-param`,
  },
  customer: {
    showAllNoParam: `${environment.apiUrl}/customers/show-all-no-param`,
  },
  stockin: {
    showAllNoParam: `${environment.apiUrl}/stock-ins/show-all-no-param`,
    insert: `${environment.apiUrl}/stock-ins/insert`,
    update: `${environment.apiUrl}/stock-ins/update`,
    getDetail: `${environment.apiUrl}/stock-ins/get-detail`,
  },
  stockout: {
    showAllNoParam: `${environment.apiUrl}/stock-outs/show-all-no-param`,
    insert: `${environment.apiUrl}/stock-outs/insert`,
    update: `${environment.apiUrl}/stock-outs/update`,
    getDetail: `${environment.apiUrl}/stock-outs/get-detail`,
  },
  invoice: {
    showAllNoParam: `${environment.apiUrl}/invoices/show-all-no-param`,
    insert: `${environment.apiUrl}/invoices/insert`,
    update: `${environment.apiUrl}/invoices/update`,
    getDetail: `${environment.apiUrl}/invoices/get-detail`,
  },
  statusInvoice: {
    showAllNoParam: `${environment.apiUrl}/status-invoices/show-all-no-param`,
  },
  logout: `${environment.apiUrl}/auth/logout`,
};
