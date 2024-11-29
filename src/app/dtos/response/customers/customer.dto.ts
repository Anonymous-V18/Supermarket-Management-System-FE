import { AddressDTOResponse } from "../addresses/address.dto";

export class CustomerDTOResponse {
  id: string;
  name: string;
  gender: string;
  dob: Date;
  phoneNumber: string;
  email: string;
  accumulatedPoints: number;
  address: AddressDTOResponse;

  constructor(
    id: string,
    name: string,
    gender: string,
    dob: Date,
    phoneNumber: string,
    email: string,
    accumulatedPoints: number,
    address: AddressDTOResponse
  ) {
    this.id = id;
    this.name = name;
    this.gender = gender;
    this.dob = dob;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.accumulatedPoints = accumulatedPoints;
    this.address = address;
  }
}
