export class StockOutDetailUpdateDTORequest {
  id: string;
  quantity: number;

  constructor(quantity: number, id: string) {
    this.id = id;
    this.quantity = quantity;
  }
}
