import { StockOutDetailInsertDTORequest } from "../stockout-details/stockout-detail-insert.dto";

export class StockOutInsertDTORequest {
  totalProduct: number;
  totalPrice: number;
  reason: string;
  stockOutDate: Date;
  statusInvoiceId: string;
  stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[];
  customerId: string;
  warehouseId: string;

  constructor(
    totalProduct: any,
    totalPrice: any,
    reason: any,
    stockOutDate: any,
    statusInvoiceId: any,
    stockOutDetailInsertRequests: any,
    customerId: any,
    warehouseId: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.reason = reason;
    this.stockOutDate = stockOutDate;
    this.statusInvoiceId = statusInvoiceId;
    this.stockOutDetailInsertRequests = stockOutDetailInsertRequests;
    this.customerId = customerId;
    this.warehouseId = warehouseId;
  }
}
