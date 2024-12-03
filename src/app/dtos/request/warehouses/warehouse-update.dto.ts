import { AddressUpdateDTORequest } from '../addresses/address-update.dto';

export class WarehouseUpdateDTORequest {
  name: string;
  moreInfo: string;
  establishDate: Date;
  phoneNumber: string;
  email: string;
  currentAddress: AddressUpdateDTORequest;

  constructor(
    name: any,
    moreInfo: any,
    establishDate: any,
    phoneNumber: any,
    email: any,
    currentAddress: any
  ) {
    this.name = name;
    this.moreInfo = moreInfo;
    this.establishDate = establishDate;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.currentAddress = currentAddress;
  }
}
