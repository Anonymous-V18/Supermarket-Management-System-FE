import { CityDTOResponse } from "../cities/city.dto";
import { DistrictDTOResponse } from "../districts/district.dto";
import { WardDTOResponse } from "../wards/ward.dto";

export class AddressDTOResponse {
  id: string;
  city: CityDTOResponse;
  district: DistrictDTOResponse;
  ward: WardDTOResponse;
  street: string;

  constructor(id: string, city: CityDTOResponse, district: DistrictDTOResponse, ward: WardDTOResponse, street: string) {
    this.id = id;
    this.city = city;
    this.district = district;
    this.ward = ward;
    this.street = street;
  }

}
