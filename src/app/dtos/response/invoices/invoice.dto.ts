import { CustomerDTOResponse } from '../customers/customer.dto';
import { EmployeeDTOResponse } from '../employees/employee.dto';
import { InvoiceDetailDTOResponse } from '../invoice-details/invoice-detail.dto';
import { StatusInvoiceDTOResponse } from '../status-invoice/status-invoice.dto';
import { WarehouseDTResponse } from '../warehouses/warehouse.dto';

export class InvoiceDTOResponse {
  id: string;
  createdDate: Date;
  modifiedDate: Date;
  discount: number;
  totalProduct: number;
  totalPrice: number;
  invoiceCreateDate: Date;
  statusInvoice: StatusInvoiceDTOResponse;
  invoiceDetails: InvoiceDetailDTOResponse[];
  customer: CustomerDTOResponse;
  employee: EmployeeDTOResponse;
  warehouse: WarehouseDTResponse;

  constructor(
    id: string,
    createdDate: Date,
    modifiedDate: Date,
    discount: number,
    totalProduct: number,
    totalPrice: number,
    invoiceCreateDate: Date,
    statusInvoice: StatusInvoiceDTOResponse,
    invoiceDetails: InvoiceDetailDTOResponse[],
    customer: CustomerDTOResponse,
    employee: EmployeeDTOResponse,
    warehouse: WarehouseDTResponse
  ) {
    this.id = id;
    this.createdDate = createdDate;
    this.modifiedDate = modifiedDate;
    this.discount = discount;
    this.totalProduct = totalProduct;
    this.totalPrice = totalPrice;
    this.invoiceCreateDate = invoiceCreateDate;
    this.statusInvoice = statusInvoice;
    this.invoiceDetails = invoiceDetails;
    this.customer = customer;
    this.employee = employee;
    this.warehouse = warehouse;
  }
}
