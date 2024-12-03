import { CustomerDTOResponse } from '../customers/customer.dto';
import { EmployeeDTOResponse } from '../employees/employee.dto';

export class AuthDTOResponse {
  accessToken: string;
  employee: EmployeeDTOResponse;
  customer: CustomerDTOResponse;

  constructor(
    accessToken: string,
    employee: EmployeeDTOResponse,
    customer: CustomerDTOResponse
  ) {
    this.accessToken = accessToken;
    this.employee = employee;
    this.customer = customer;
  }
}
