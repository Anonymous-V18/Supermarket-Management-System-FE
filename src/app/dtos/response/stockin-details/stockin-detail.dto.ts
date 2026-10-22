import { ProductDTOResponse } from "../products/product.dto";

export class StockinDetailDTOReponse {
  id: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;
  // Optional lot tracking; expiryDate is yyyy-MM-dd
  lotNumber?: string | null;
  expiryDate?: string | null;
  product: ProductDTOResponse;

  constructor(
    id: string,
    quantity: number,
    inputPrice: number,
    salePrice: number,
    product: ProductDTOResponse
  ) {
    this.id = id;
    this.quantity = quantity;
    this.inputPrice = inputPrice;
    this.salePrice = salePrice;
    this.product = product;
  }
}
