import { AddressUpdateDTORequest } from '../addresses/address-update.dto';

export class EmployeeUpdateDTORequest {
  name: string;
  gender: string;
  dob: string;
  phoneNumber: string;
  email: string;
  positionId: string;
  currentAddress: AddressUpdateDTORequest;
  roleIds: string[];

  constructor(
    name: any,
    gender: any,
    dob: any,
    phoneNumber: any,
    email: any,
    positionId: any,
    currentAddress: any,
    roleIds: any
  ) {
    this.name = name;
    this.gender = gender;
    this.dob = dob;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.positionId = positionId;
    this.currentAddress = currentAddress;
    this.roleIds = roleIds;
  }
}
