import { DistrictDTOResponse } from '../districts/district.dto';
import { WardDTOResponse } from '../wards/ward.dto';

export class AddressDTOResponse {
  id: string;
  district: DistrictDTOResponse;
  ward: WardDTOResponse;
  street: string;

  constructor(
    id: string,
    district: DistrictDTOResponse,
    ward: WardDTOResponse,
    street: string
  ) {
    this.id = id;
    this.district = district;
    this.ward = ward;
    this.street = street;
  }
}
