import { InvoiceDetailInsertDTORequest } from '../invoice-details/invoice-detail-insert.dto';
import { InvoiceDetailUpdateDTORequest } from '../invoice-details/invoice-detail-update.dto';

// Totals, prices and dates are computed by the server; only pending invoices can change lines
export class InvoiceUpdateDTORequest {
  invoiceDetailUpdateRequests: InvoiceDetailUpdateDTORequest[];
  invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  customerId?: string | null;
  discount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  amountPaid?: number | null;

  constructor(
    invoiceDetailUpdateRequests: InvoiceDetailUpdateDTORequest[],
    invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    customerId?: string | null,
    discount: number = 0,
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' = 'CASH',
    amountPaid?: number | null
  ) {
    this.invoiceDetailUpdateRequests = invoiceDetailUpdateRequests;
    this.invoiceDetailInsertRequests = invoiceDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.customerId = customerId;
    this.discount = discount;
    this.paymentMethod = paymentMethod;
    this.amountPaid = amountPaid;
  }
}
