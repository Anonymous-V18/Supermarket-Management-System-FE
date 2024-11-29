import { StockInDetailInsertDTORequest } from '../stockin-details/stockin-detail-insert.dto';
import { StockInDetailUpdateDTORequest } from '../stockin-details/stockin-detail-update.dto';

export class StockInUpdateDTORequest {
  totalProduct: number;
  totalPrice: number;
  stockInDate: Date;
  statusInvoiceId: string;
  stockInDetailUpdateRequests: StockInDetailUpdateDTORequest[];
  stockInDetailInsertRequests: StockInDetailInsertDTORequest[];

  constructor(
    totalProduct: any,
    totalPrice: any,
    stockInDate: any,
    statusInvoiceId: any,
    stockInDetailUpdateRequests: any,
    stockInDetailInsertRequests: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.stockInDate = stockInDate;
    this.statusInvoiceId = statusInvoiceId;
    this.stockInDetailUpdateRequests = stockInDetailUpdateRequests;
    this.stockInDetailInsertRequests = stockInDetailInsertRequests;
  }
}
