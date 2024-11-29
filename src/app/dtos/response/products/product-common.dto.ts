import { BrandDTOResponse } from '../brands/brand.dto';
import { UnitDTOResponse } from '../units/unit.dto';

export class ProductCommonDetailDTOResponse {
  id: string;
  name: string;
  vat: number;
  warranty: number;
  salePrice: number;
  unit: UnitDTOResponse;
  brand: BrandDTOResponse;

  constructor(
    id: string,
    name: string,
    vat: number,
    warranty: number,
    salePrice: number,
    unit: UnitDTOResponse,
    brand: BrandDTOResponse
  ) {
    this.id = id;
    this.name = name;
    this.vat = vat;
    this.warranty = warranty;
    this.salePrice = salePrice;
    this.unit = unit;
    this.brand = brand;
  }
}
