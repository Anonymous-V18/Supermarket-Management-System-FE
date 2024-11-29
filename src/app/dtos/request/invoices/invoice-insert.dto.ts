import { InvoiceDetailInsertDTORequest } from "../invoice-details/invoice-detail-insert.dto";

export class InvoiceInsertDTORequest {
  totalProduct: number;
  totalPrice: number;
  statusInvoiceId: string;
  invoiceCreateDate: Date;
  invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[];
  customerId: string;
  warehouseId: string;

  constructor(
    totalProduct: any,
    totalPrice: any,
    statusInvoiceId: any,
    invoiceCreateDate: any,
    invoiceDetailInsertRequests: any,
    customerId: any,
    warehouseId: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.statusInvoiceId = statusInvoiceId;
    this.invoiceCreateDate = invoiceCreateDate;
    this.invoiceDetailInsertRequests = invoiceDetailInsertRequests;
    this.customerId = customerId;
    this.warehouseId = warehouseId;
  }
}
