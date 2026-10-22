export class InvoiceDetailUpdateDTORequest {
  id: string;
  quantity: number;
  discountPercent: number;

  constructor(
    id: string,
    quantity: number,
    discountPercent: number = 0
  ) {
    this.id = id;
    this.quantity = quantity;
    this.discountPercent = discountPercent;
  }
}
