import { AddressInsertDTORequest } from '../addresses/address-insert.dto';

export class EmployeeInsertDTORequest {
  name: string;
  gender: string;
  dob: string;
  phoneNumber: string;
  email: string;
  positionId: string;
  newAddress: AddressInsertDTORequest;
  roleIds: string[];

  constructor(
    name: any,
    gender: any,
    dob: any,
    phoneNumber: any,
    email: any,
    positionId: any,
    newAddress: any,
    roleIds: any
  ) {
    this.name = name;
    this.gender = gender;
    this.dob = dob;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.positionId = positionId;
    this.newAddress = newAddress;
    this.roleIds = roleIds;
  }
}
