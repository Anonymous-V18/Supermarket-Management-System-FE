export class StockInDetailInsertDTORequest {
  productId: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;
  // Optional lot tracking; expiryDate is yyyy-MM-dd
  lotNumber?: string | null;
  expiryDate?: string | null;

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
