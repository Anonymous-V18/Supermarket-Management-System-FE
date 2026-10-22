export class ActivePromotionDTOResponse {
  id: string;
  name: string;
  voucherCode?: string;
  endDate: string;

  constructor(id: string, name: string, endDate: string, voucherCode?: string) {
    this.id = id;
    this.name = name;
    this.endDate = endDate;
    this.voucherCode = voucherCode;
  }
}

// Fields left null by the backend are omitted from the JSON (@JsonInclude NON_NULL).
export class DashboardSummaryDTOResponse {
  workDate: string; // yyyy-MM-dd
  shiftCode: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  // EMPLOYEE: the logged-in cashier's invoices, STORE: every employee (admin)
  scope: 'EMPLOYEE' | 'STORE';
  // invoiceCount / revenue / productsSold cover every invoice except cancelled ones
  invoiceCount: number;
  revenue: number;
  productsSold: number;
  completedInvoiceCount: number;
  pendingInvoiceCount: number;
  cancelledInvoiceCount: number;
  activePromotions: ActivePromotionDTOResponse[];

  constructor(
    workDate: string,
    shiftCode: string,
    shiftName: string,
    shiftStart: string,
    shiftEnd: string,
    scope: 'EMPLOYEE' | 'STORE',
    invoiceCount: number,
    revenue: number,
    productsSold: number,
    completedInvoiceCount: number,
    pendingInvoiceCount: number,
    cancelledInvoiceCount: number,
    activePromotions: ActivePromotionDTOResponse[]
  ) {
    this.workDate = workDate;
    this.shiftCode = shiftCode;
    this.shiftName = shiftName;
    this.shiftStart = shiftStart;
    this.shiftEnd = shiftEnd;
    this.scope = scope;
    this.invoiceCount = invoiceCount;
    this.revenue = revenue;
    this.productsSold = productsSold;
    this.completedInvoiceCount = completedInvoiceCount;
    this.pendingInvoiceCount = pendingInvoiceCount;
    this.cancelledInvoiceCount = cancelledInvoiceCount;
    this.activePromotions = activePromotions;
  }
}
