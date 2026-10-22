import { StockInDetailInsertDTORequest } from '../stockin-details/stockin-detail-insert.dto';
import { StockInDetailUpdateDTORequest } from '../stockin-details/stockin-detail-update.dto';

// Totals, prices and dates are computed by the server
export class StockInUpdateDTORequest {
  stockInDetailUpdateRequests: StockInDetailUpdateDTORequest[];
  stockInDetailInsertRequests: StockInDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  stockInDate?: string | null;

  constructor(
    stockInDetailUpdateRequests: StockInDetailUpdateDTORequest[],
    stockInDetailInsertRequests: StockInDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    stockInDate?: string | null
  ) {
    this.stockInDetailUpdateRequests = stockInDetailUpdateRequests;
    this.stockInDetailInsertRequests = stockInDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.stockInDate = stockInDate;
  }
}
