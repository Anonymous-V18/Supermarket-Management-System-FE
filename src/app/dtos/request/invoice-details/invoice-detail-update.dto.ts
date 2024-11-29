export class InvoiceDetailUpdateDTORequest {
  id: string;
  quantity: number;
  promotionalPrice: number;
  percentDiscount: number;

  constructor(
    id: string,
    quantity: number,
    promotionalPrice: number,
    percentDiscount: number
  ) {
    this.id = id;
    this.quantity = quantity;
    this.promotionalPrice = promotionalPrice;
    this.percentDiscount = percentDiscount;
  }
}
