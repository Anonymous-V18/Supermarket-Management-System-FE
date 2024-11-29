import { CustomerDTOResponse } from '../customers/customer.dto';
import { EmployeeDTOResponse } from '../employees/employee.dto';
import { StatusInvoiceDTOResponse } from '../status-invoice/status-invoice.dto';
import { StockoutDetailDTOReponse } from '../stockout-details/stockout-detail.dto';
import { SupplierDTOResponse } from '../suppliers/supplier.dto';
import { WarehouseDTResponse } from '../warehouses/warehouse.dto';

export class StockoutDTOResponse {
  id: string;
  reason: string;
  totalProduct: number;
  totalPrice: number;
  stockOutDate: Date;
  statusInvoice: StatusInvoiceDTOResponse;
  supplier: SupplierDTOResponse;
  warehouse: WarehouseDTResponse;
  employee: EmployeeDTOResponse;
  customer: CustomerDTOResponse;
  stockOutDetails: StockoutDetailDTOReponse[];

  constructor(
    id: string,
    reason: string,
    totalProduct: number,
    totalPrice: number,
    stockOutDate: Date,
    statusInvoice: StatusInvoiceDTOResponse,
    supplier: SupplierDTOResponse,
    warehouse: WarehouseDTResponse,
    employee: EmployeeDTOResponse,
    customer: CustomerDTOResponse,
    stockOutDetails: StockoutDetailDTOReponse[]
  ) {
    this.id = id;
    this.reason = reason;
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.stockOutDate = stockOutDate;
    this.statusInvoice = statusInvoice;
    this.supplier = supplier;
    this.warehouse = warehouse;
    this.employee = employee;
    this.customer = customer;
    this.stockOutDetails = stockOutDetails;
  }
}
