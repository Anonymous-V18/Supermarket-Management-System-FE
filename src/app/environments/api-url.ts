import { environment } from './environment';

export const ApiUrl = {
  login: `${environment.apiUrl}/auth/login`,
  warehouse: {
    showAllNoParam: `${environment.apiUrl}/warehouses/show-all-no-param`,
    insert: `${environment.apiUrl}/warehouses/insert`,
    update: `${environment.apiUrl}/warehouses/update`,
    getDetail: `${environment.apiUrl}/warehouses/get-detail`,
  },
  supplier: {
    showAllNoParam: `${environment.apiUrl}/suppliers/show-all-no-param`,
    insert: `${environment.apiUrl}/suppliers/insert`,
    update: `${environment.apiUrl}/suppliers/update`,
    getDetail: `${environment.apiUrl}/suppliers/get-detail`,
  },
  product: {
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
    showAllNoParam: `${environment.apiUrl}/employees/show-all-no-param`,
    insert: `${environment.apiUrl}/employees/insert`,
    update: `${environment.apiUrl}/employees/update`,
    getDetail: `${environment.apiUrl}/employees/get-detail`,
    getMyInfo: `${environment.apiUrl}/employees/get-my-info`,
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
  logout: `${environment.apiUrl}/auth/logout`,
};
