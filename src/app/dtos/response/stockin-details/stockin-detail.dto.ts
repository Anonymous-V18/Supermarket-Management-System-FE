import { ProductDTOResponse } from "../products/product.dto";

export class StockinDetailDTOReponse {
  id: string;
  quantity: number;
  inputPrice: number;
  salePrice: number;
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
