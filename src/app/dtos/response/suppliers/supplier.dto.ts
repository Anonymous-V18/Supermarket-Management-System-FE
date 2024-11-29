import { AddressDTOResponse } from "../addresses/address.dto";

export class SupplierDTOResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  moreInfo: string;
  contactDate: Date;
  address: AddressDTOResponse;

  constructor(id: string, name: string, email: string, phoneNumber: string, moreInfo: string, contactDate: Date, address: AddressDTOResponse) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.moreInfo = moreInfo;
    this.contactDate = contactDate;
    this.address = address;
  }

}
