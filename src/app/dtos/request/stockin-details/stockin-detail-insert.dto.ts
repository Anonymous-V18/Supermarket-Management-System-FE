export class StockInDetailInsertDTORequest {
  productId: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;

  constructor(
    productId: string,
    quantity: number,
    inputPrice: number,
    salePrice: number
  ) {
    this.productId = productId;
    this.quantity = quantity;
    this.inputPrice = inputPrice;
    this.salePrice = salePrice;
  }
}
