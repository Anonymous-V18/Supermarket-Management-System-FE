export class InvoiceDetailInsertDTORequest {
  productId: string;
  quantity: number;
  promotionalPrice: number;
  percentDiscount: number;

  constructor(
    productId: string,
    quantity: number,
    promotionalPrice: number,
    percentDiscount: number
  ) {
    this.productId = productId;
    this.quantity = quantity;
    this.promotionalPrice = promotionalPrice;
    this.percentDiscount = percentDiscount;
  }
}
