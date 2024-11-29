import { StockOutDetailInsertDTORequest } from '../stockout-details/stockout-detail-insert.dto';
import { StockOutDetailUpdateDTORequest } from '../stockout-details/stockout-detail-update.dto';

export class StockOutUpdateDTORequest {
  totalProduct: number;
  totalPrice: number;
  reason: string;
  stockOutDate: Date;
  statusInvoiceId: string;
  stockOutDetailUpdateRequests: StockOutDetailUpdateDTORequest[];
  stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[];
  customerId: string;

  constructor(
    totalProduct: any,
    totalPrice: any,
    reason: any,
    stockOutDate: any,
    statusInvoiceId: any,
    stockOutDetailUpdateRequests: any,
    stockOutDetailInsertRequests: any,
    customerId: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.reason = reason;
    this.stockOutDate = stockOutDate;
    this.statusInvoiceId = statusInvoiceId;
    this.stockOutDetailUpdateRequests = stockOutDetailUpdateRequests;
    this.stockOutDetailInsertRequests = stockOutDetailInsertRequests;
    this.customerId = customerId;
  }
}
