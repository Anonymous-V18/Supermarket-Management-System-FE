import { EmployeeDTOResponse } from "../employees/employee.dto";
import { StatusInvoiceDTOResponse } from "../status-invoice/status-invoice.dto";
import { StockinDetailDTOReponse } from "../stockin-details/stockin-detail.dto";
import { SupplierDTOResponse } from "../suppliers/supplier.dto";
import { WarehouseDTResponse } from "../warehouses/warehouse.dto";

export class StockinDTOResponse {
  id: string;
  totalProduct: number;
  totalPrice: number;
  stockInDate: Date;
  statusInvoice: StatusInvoiceDTOResponse;
  supplier: SupplierDTOResponse;
  warehouse: WarehouseDTResponse;
  employee: EmployeeDTOResponse;
  stockInDetails: StockinDetailDTOReponse[];

  constructor(
    id: string,
    totalProduct: number,
    totalPrice: number,
    stockInDate: Date,
    statusInvoice: StatusInvoiceDTOResponse,
    supplier: SupplierDTOResponse,
    warehouse: WarehouseDTResponse,
    employee: EmployeeDTOResponse,
    stockInDetails: StockinDetailDTOReponse[]
  ) {
    this.id = id;
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.stockInDate = stockInDate;
    this.statusInvoice = statusInvoice;
    this.supplier = supplier;
    this.warehouse = warehouse;
    this.employee = employee;
    this.stockInDetails = stockInDetails;
  }
}
