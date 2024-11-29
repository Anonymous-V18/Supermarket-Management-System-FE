import { BrandDTOResponse } from '../brands/brand.dto';
import { ProductCategoryDTOResponse } from '../product-categories/product-category.dto';
import { SupplierDTOResponse } from '../suppliers/supplier.dto';
import { UnitDTOResponse } from '../units/unit.dto';

export class ProductDTOResponse {
  id: string;
  name: string;
  description: string;
  details: string;
  vat: number;
  warranty: number;
  image: string;
  productCategory: ProductCategoryDTOResponse;
  supplier: SupplierDTOResponse;
  unit: UnitDTOResponse;
  brand: BrandDTOResponse;

  constructor(
    id: string,
    name: string,
    description: string,
    details: string,
    vat: number,
    warranty: number,
    image: string,
    productCategory: ProductCategoryDTOResponse,
    supplier: SupplierDTOResponse,
    unit: UnitDTOResponse,
    brand: BrandDTOResponse
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.details = details;
    this.vat = vat;
    this.warranty = warranty;
    this.image = image;
    this.productCategory = productCategory;
    this.supplier = supplier;
    this.unit = unit;
    this.brand = brand;
  }
}
