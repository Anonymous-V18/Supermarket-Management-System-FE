export class ProductDTORequest {
  name: string;
  description: string;
  details: string;
  warranty: number;
  vat: number;
  image: string;
  productCategoryId: string;
  supplierId: string;
  unitId: string;
  brandId: string;

  constructor(
    name: any,
    description: any,
    details: any,
    warranty: any,
    vat: any,
    image: any,
    productCategoryId: any,
    supplierId: any,
    unitId: any,
    brandId: any
  ) {
    this.name = name;
    this.description = description;
    this.details = details;
    this.warranty = warranty;
    this.vat = vat;
    this.image = image;
    this.productCategoryId = productCategoryId;
    this.supplierId = supplierId;
    this.unitId = unitId;
    this.brandId = brandId;
  }
}
