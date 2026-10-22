// Request bodies for sales returns, stock-takes and stock transfers.
// Every update sends the whole set of lines; empty status = PENDING.

export interface DocumentLineDTORequest {
  productId: string;
  quantity: number;
}

export interface SalesReturnDTORequest {
  invoiceId?: string; // insert only
  reason: string;
  statusInvoiceId: string | null;
  refundMethod: 'CASH' | 'CARD' | 'TRANSFER' | null; // null = as the invoice was paid
  lines: DocumentLineDTORequest[];
}

export interface StockTakeLineDTORequest {
  productId: string;
  countedQuantity: number;
}

export interface StockTakeDTORequest {
  warehouseId?: string; // insert only
  note: string | null;
  statusInvoiceId: string | null;
  lines: StockTakeLineDTORequest[];
}

export interface StockTransferDTORequest {
  fromWarehouseId?: string; // insert only
  toWarehouseId: string;
  note: string | null;
  statusInvoiceId: string | null;
  lines: DocumentLineDTORequest[];
}

export interface ChecklistItemDTORequest {
  code?: string; // insert only
  label: string;
  groupCode: 'START' | 'END';
  sortOrder: number;
  isActive: boolean;
}
