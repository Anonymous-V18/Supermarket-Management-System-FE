import { AddressUpdateDTORequest } from '../addresses/address-update.dto';

export class SupplierUpdateDTORequest {
  name: string;
  moreInfo: string;
  contactDate: Date;
  phoneNumber: string;
  email: string;
  currentAddress: AddressUpdateDTORequest;

  constructor(
    name: any,
    moreInfo: any,
    contactDate: any,
    phoneNumber: any,
    email: any,
    currentAddress: any
  ) {
    this.name = name;
    this.moreInfo = moreInfo;
    this.contactDate = contactDate;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.currentAddress = currentAddress;
  }
}
