import { AddressDTOResponse } from '../addresses/address.dto';
import { PositionDTOResponse } from '../positions/position.dto';
import { UserDetailsDTOResponse } from '../users/user-details.dto';

export class EmployeeDTOResponse {
  id: string;
  code: string;
  name: string;
  gender: string;
  dob: Date;
  phoneNumber: string;
  email: string;
  position: PositionDTOResponse;
  address: AddressDTOResponse;
  user: UserDetailsDTOResponse;

  constructor(
    id: string,
    code: string,
    name: string,
    gender: string,
    dob: Date,
    phoneNumber: string,
    email: string,
    position: PositionDTOResponse,
    address: AddressDTOResponse,
    user: UserDetailsDTOResponse
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.gender = gender;
    this.dob = dob;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.position = position;
    this.address = address;
    this.user = user;
  }
}
