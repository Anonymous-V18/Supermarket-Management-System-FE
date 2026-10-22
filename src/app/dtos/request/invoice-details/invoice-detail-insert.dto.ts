export class InvoiceDetailInsertDTORequest {
  productId: string;
  quantity: number;
  discountPercent: number;

  constructor(
    productId: string,
    quantity: number,
    discountPercent: number = 0
  ) {
    this.productId = productId;
    this.quantity = quantity;
    this.discountPercent = discountPercent;
  }
}
