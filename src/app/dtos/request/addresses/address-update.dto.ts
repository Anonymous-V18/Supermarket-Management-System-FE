export class AddressUpdateDTORequest {
  id: string;
  cityId: string;
  districtId: string;
  wardId: string;
  street: string;

  constructor(id: any, cityId: any, districtId: any, wardId: any, street: any) {
    this.id = id;
    this.cityId = cityId;
    this.districtId = districtId;
    this.wardId = wardId;
    this.street = street;
  }
}
