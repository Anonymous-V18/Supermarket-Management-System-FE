export class ProductDTORequest {
  name: string;
  barcode: string | null;
  description: string | null;
  details: string | null;
  warranty: number | null;
  vat: number;
  image: string | null;
  salePrice: number;
  minStock: number;
  productCategoryId: string;
  supplierId: string | null;
  unitId: string;
  brandId: string | null;

  constructor(
    name: string,
    barcode: string | null,
    description: string | null,
    details: string | null,
    warranty: number | null,
    vat: number,
    image: string | null,
    salePrice: number,
    minStock: number,
    productCategoryId: string,
    supplierId: string | null,
    unitId: string,
    brandId: string | null
  ) {
    this.name = name;
    this.barcode = barcode;
    this.description = description;
    this.details = details;
    this.warranty = warranty;
    this.vat = vat;
    this.image = image;
    this.salePrice = salePrice;
    this.minStock = minStock;
    this.productCategoryId = productCategoryId;
    this.supplierId = supplierId;
    this.unitId = unitId;
    this.brandId = brandId;
  }
}
