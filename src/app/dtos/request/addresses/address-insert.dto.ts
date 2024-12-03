export class AddressInsertDTORequest {
  cityId: string;
  districtId: string;
  wardId: string;
  street: string;

  constructor(cityId: any, districtId: any, wardId: any, street: any) {
    this.cityId = cityId;
    this.districtId = districtId;
    this.wardId = wardId;
    this.street = street;
  }
  
}
