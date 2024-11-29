export class StockInDetailUpdateDTORequest {
  id: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;

  constructor(
    id: string,
    quantity: number,
    inputPrice: number,
    salePrice: number
  ) {
    this.id = id;
    this.quantity = quantity;
    this.inputPrice = inputPrice;
    this.salePrice = salePrice;
  }
}
