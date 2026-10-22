export class StockInDetailUpdateDTORequest {
  id: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;
  // Optional lot tracking; expiryDate is yyyy-MM-dd
  lotNumber?: string | null;
  expiryDate?: string | null;

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
