import { CityDTOResponse } from '../cities/city.dto';

export class DistrictDTOResponse {
  id: string;
  name: string;
  city: CityDTOResponse;

  constructor(id: string, name: string, city: CityDTOResponse) {
    this.id = id;
    this.name = name;
    this.city = city;
  }
  
}
