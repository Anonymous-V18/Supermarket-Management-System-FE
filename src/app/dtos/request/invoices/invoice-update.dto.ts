import { InvoiceDetailInsertDTORequest } from '../invoice-details/invoice-detail-insert.dto';
import { InvoiceDetailUpdateDTORequest } from '../invoice-details/invoice-detail-update.dto';

export class InvoiceUpdateDTORequest {
  totalProduct: number;
  totalPrice: number;
  statusInvoiceId: string;
  invoiceCreateDate: Date;
  invoiceDetailUpdateRequests: InvoiceDetailUpdateDTORequest[];
  invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[];
  customerId: string;

  constructor(
    totalProduct: any,
    totalPrice: any,
    statusInvoiceId: any,
    invoiceCreateDate: any,
    invoiceDetailUpdateRequests: any,
    invoiceDetailInsertRequests: any,
    customerId: any
  ) {
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.statusInvoiceId = statusInvoiceId;
    this.invoiceCreateDate = invoiceCreateDate;
    this.invoiceDetailUpdateRequests = invoiceDetailUpdateRequests;
    this.invoiceDetailInsertRequests = invoiceDetailInsertRequests;
    this.customerId = customerId;
  }
}
