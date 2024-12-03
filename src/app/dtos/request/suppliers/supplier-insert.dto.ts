import { AddressInsertDTORequest } from '../addresses/address-insert.dto';

export class SupplierInsertDTORequest {
  name: string;
  moreInfo: string;
  contactDate: Date;
  phoneNumber: string;
  email: string;
  newAddress: AddressInsertDTORequest;

  constructor(
    name: any,
    moreInfo: any,
    contactDate: any,
    phoneNumber: any,
    email: any,
    newAddress: any
  ) {
    this.name = name;
    this.moreInfo = moreInfo;
    this.contactDate = contactDate;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.newAddress = newAddress;
  }
}
