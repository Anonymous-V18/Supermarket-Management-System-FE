import { AddressDTOResponse } from "../addresses/address.dto";

export class WarehouseDTResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  moreInfo: string;
  establishDate: Date;
  address: AddressDTOResponse;

  constructor(
    id: string,
    name: string,
    email: string,
    phoneNumber: string,
    moreInfo: string,
    establishDate: Date,
    address: AddressDTOResponse
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.moreInfo = moreInfo;
    this.establishDate = establishDate;
    this.address = address;
  }
  
}
