import { StockInDetailInsertDTORequest } from '../stockin-details/stockin-detail-insert.dto';

export class StockInInsertDTORequest {
  totalProduct: number;
  totalPrice: number;
  stockInDate: string;
  statusInvoiceId: string;
  stockInDetailInsertRequests: StockInDetailInsertDTORequest[];
  supplierId: string;
  warehouseId: string;

  constructor(
    totalProduct: any,
    totalPrice: any,
    stockInDate: any,
    statusInvoiceId: any,
    stockInDetailInsertRequests: any,
    supplierId: any,
    warehouseId: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.stockInDate = stockInDate;
    this.statusInvoiceId = statusInvoiceId;
    this.stockInDetailInsertRequests = stockInDetailInsertRequests;
    this.supplierId = supplierId;
    this.warehouseId = warehouseId;
  }
}
