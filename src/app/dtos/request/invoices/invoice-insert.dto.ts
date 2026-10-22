import { InvoiceDetailInsertDTORequest } from '../invoice-details/invoice-detail-insert.dto';

// Totals, prices and dates are computed by the server; an empty customer is a walk-in sale
export class InvoiceInsertDTORequest {
  warehouseId: string;
  invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[];
  statusInvoiceId?: string | null;
  customerId?: string | null;
  discount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  amountPaid?: number | null;

  constructor(
    warehouseId: string,
    invoiceDetailInsertRequests: InvoiceDetailInsertDTORequest[],
    statusInvoiceId?: string | null,
    customerId?: string | null,
    discount: number = 0,
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' = 'CASH',
    amountPaid?: number | null
  ) {
    this.warehouseId = warehouseId;
    this.invoiceDetailInsertRequests = invoiceDetailInsertRequests;
    this.statusInvoiceId = statusInvoiceId;
    this.customerId = customerId;
    this.discount = discount;
    this.paymentMethod = paymentMethod;
    this.amountPaid = amountPaid;
  }
}
