import { AddressInsertDTORequest } from '../addresses/address-insert.dto';

export class WarehouseInsertDTORequest {
  name: string;
  moreInfo: string;
  establishDate: Date;
  phoneNumber: string;
  email: string;
  newAddress: AddressInsertDTORequest;

  constructor(
    name: any,
    moreInfo: any,
    establishDate: any,
    phoneNumber: any,
    email: any,
    newAddress: any
  ) {
    this.name = name;
    this.moreInfo = moreInfo;
    this.establishDate = establishDate;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.newAddress = newAddress;
  }
}
