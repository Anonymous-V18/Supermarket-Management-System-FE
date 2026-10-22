import { StockInDetailInsertDTORequest } from '../stockin-details/stockin-detail-insert.dto';

// Totals, prices and dates are computed by the server
export class StockInInsertDTORequest {
  supplierId: string;
  warehouseId: string;
  stockInDetailInsertRequests: StockInDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  stockInDate?: string | null;

  constructor(
    supplierId: string,
    warehouseId: string,
    stockInDetailInsertRequests: StockInDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    stockInDate?: string | null
  ) {
    this.supplierId = supplierId;
    this.warehouseId = warehouseId;
    this.stockInDetailInsertRequests = stockInDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.stockInDate = stockInDate;
  }
}
