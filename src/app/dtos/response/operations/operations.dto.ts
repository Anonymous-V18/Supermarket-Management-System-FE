import { CustomerDTOResponse } from '../customers/customer.dto';
import { EmployeeDTOResponse } from '../employees/employee.dto';
import { ProductDTOResponse } from '../products/product.dto';
import { StatusInvoiceDTOResponse } from '../status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../warehouses/warehouse.dto';

// Store operations: sales returns (TH), stock-takes (KK) and stock transfers (CK)

export interface SalesReturnDetailDTOResponse {
  id: string;
  quantity: number;
  unitRefund: number;
  lineTotal: number;
  product: ProductDTOResponse;
}

export interface SalesReturnDTOResponse {
  id: string;
  code: string;
  createdDate: string;
  returnDate: string;
  reason: string;
  totalProduct: number;
  refundAmount: number;
  refundMethod: 'CASH' | 'CARD' | 'TRANSFER';
  invoiceId: string;
  invoiceCode: string;
  statusInvoice: StatusInvoiceDTOResponse;
  customer?: CustomerDTOResponse;
  warehouse: WarehouseDTResponse;
  employee: EmployeeDTOResponse;
  salesReturnDetails: SalesReturnDetailDTOResponse[];
}

// One invoice line with what can still be returned from it
export interface ReturnableLineDTOResponse {
  productId: string;
  productCode: string;
  productName: string;
  soldQuantity: number;
  returnedQuantity: number;
  returnableQuantity: number;
  unitRefund: number;
}

export interface StockTakeDetailDTOResponse {
  id: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  product: ProductDTOResponse;
}

export interface StockTakeDTOResponse {
  id: string;
  code: string;
  createdDate: string;
  stockTakeDate: string;
  note?: string;
  totalDifference: number;
  statusInvoice: StatusInvoiceDTOResponse;
  warehouse: WarehouseDTResponse;
  employee: EmployeeDTOResponse;
  stockTakeDetails: StockTakeDetailDTOResponse[];
}

export interface StockTransferDetailDTOResponse {
  id: string;
  quantity: number;
  product: ProductDTOResponse;
}

export interface StockTransferDTOResponse {
  id: string;
  code: string;
  createdDate: string;
  transferDate: string;
  note?: string;
  totalProduct: number;
  statusInvoice: StatusInvoiceDTOResponse;
  fromWarehouse: WarehouseDTResponse;
  toWarehouse: WarehouseDTResponse;
  employee: EmployeeDTOResponse;
  stockTransferDetails: StockTransferDetailDTOResponse[];
}
