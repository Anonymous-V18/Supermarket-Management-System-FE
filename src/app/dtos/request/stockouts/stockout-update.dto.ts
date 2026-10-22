import { StockOutDetailInsertDTORequest } from '../stockout-details/stockout-detail-insert.dto';
import { StockOutDetailUpdateDTORequest } from '../stockout-details/stockout-detail-update.dto';

// Totals, prices and dates are computed by the server
export class StockOutUpdateDTORequest {
  reason: string;
  stockOutDetailUpdateRequests: StockOutDetailUpdateDTORequest[];
  stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  customerId?: string | null;
  stockOutDate?: string | null;

  constructor(
    reason: string,
    stockOutDetailUpdateRequests: StockOutDetailUpdateDTORequest[],
    stockOutDetailInsertRequests: StockOutDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    customerId?: string | null,
    stockOutDate?: string | null
  ) {
    this.reason = reason;
    this.stockOutDetailUpdateRequests = stockOutDetailUpdateRequests;
    this.stockOutDetailInsertRequests = stockOutDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.customerId = customerId;
    this.stockOutDate = stockOutDate;
  }
}
