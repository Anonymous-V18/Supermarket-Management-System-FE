import { StockOutDetailInsertDTORequest } from '../stockout-details/stockout-detail-insert.dto';

// Totals, prices and dates are computed by the server; goods are valued at cost
export class StockOutInsertDTORequest {
  warehouseId: string;
  reason: string;
  stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  customerId?: string | null;
  stockOutDate?: string | null;

  constructor(
    warehouseId: string,
    reason: string,
    stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    customerId?: string | null,
    stockOutDate?: string | null
  ) {
    this.warehouseId = warehouseId;
    this.reason = reason;
    this.stockOutDetailInsertRequests = stockOutDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.customerId = customerId;
    this.stockOutDate = stockOutDate;
  }
}
