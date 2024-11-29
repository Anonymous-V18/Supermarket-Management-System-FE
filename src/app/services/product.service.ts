import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { ProductCommonDetailDTOResponse } from '../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../dtos/response/products/product.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrlShowAllNoParam = ApiUrl.product.showAllNoParam;
  private apiUrlGetCommonDetail = ApiUrl.product.getCommonDetail;
  private httpClient = inject(HttpClient);
  private apiConfig = {
    headers: this.createHeaders(),
  };
  constructor() {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  showAllNoParam(): Observable<ApiResponse<ProductDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<ProductDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  getCommonDetail(
    productId: string,
    warehouseId: string
  ): Observable<ApiResponse<ProductCommonDetailDTOResponse>> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('warehouseId', warehouseId);
    return this.httpClient.get<ApiResponse<ProductCommonDetailDTOResponse>>(
      this.apiUrlGetCommonDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }
}
