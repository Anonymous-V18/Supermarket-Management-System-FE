// Report rows; dates are yyyy-MM-dd in Vietnam time

export interface RevenueByDayDTOResponse {
  date: string;
  invoiceCount: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
  cost: number;
  grossProfit: number;
}

export interface ProductSalesDTOResponse {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  revenue: number;
  grossProfit: number;
}

export interface EmployeeSalesDTOResponse {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  invoiceCount: number;
  revenue: number;
}

export interface InventoryRowDTOResponse {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  barcode?: string;
  unitName?: string;
  quantity: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  stockValue: number;
  lowStock: boolean;
}

export interface ExpiringLotDTOResponse {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productCode: string;
  productName: string;
  lotNumber?: string;
  expiryDate: string;
  daysLeft: number;
  quantity: number;
  stockInCode: string;
  expired: boolean;
}

export interface AuditLogDTOResponse {
  id: string;
  createdDate: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  resource: string;
  httpMethod: string;
  path: string;
  reference?: string;
  username?: string;
  ipAddress?: string;
  success: boolean;
  statusCode: number;
  errorCode?: number;
}

export interface ChecklistItemDTOResponse {
  id: string;
  code: string;
  label: string;
  groupCode: 'START' | 'END';
  sortOrder: number;
  isActive: boolean;
}
