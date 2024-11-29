export class StockOutDetailInsertDTORequest {
  productId: string;
  quantity: number;

  constructor(quantity: number, productId: string) {
    this.productId = productId;
    this.quantity = quantity;
  }
}
