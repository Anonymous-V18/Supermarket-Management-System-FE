import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductDTORequest } from '../dtos/request/products/product.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { ProductCommonDetailDTOResponse } from '../dtos/response/products/product-common.dto';
import { ProductDTOResponse } from '../dtos/response/products/product.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrlShowAllNoParam = ApiUrl.product.showAllNoParam;
  private apiUrlInsert = ApiUrl.product.insert;
  private apiUrlUpdate = ApiUrl.product.update;
  private apiUrlGetDetail = ApiUrl.product.getDetail;
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

  insert(productDTORequest: ProductDTORequest): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      productDTORequest,
      this.apiConfig
    );
  }

  update(
    productId: string,
    productDTORequest: ProductDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      `${this.apiUrlUpdate}/${productId}`,
      productDTORequest,
      this.apiConfig
    );
  }

  getDetail(productId: string): Observable<ApiResponse<ProductDTOResponse>> {
    const params = new HttpParams().set('productId', productId);
    return this.httpClient.get<ApiResponse<ProductDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<PageResponse<ProductDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    return this.httpClient.get<ApiResponse<PageResponse<ProductDTOResponse>>>(
      ApiUrl.product.search,
      { headers: this.createHeaders(), params: params }
    );
  }

  // Soft delete on the server: the rows stay for history and disappear from lists
  delete(ids: string[]): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(ApiUrl.product.delete, {
      headers: this.createHeaders(),
      body: ids,
    });
  }

  // Barcode scanner on the sales screen: product with its price and stock in that warehouse
  getByBarcode(
    barcode: string,
    warehouseId: string
  ): Observable<ApiResponse<ProductCommonDetailDTOResponse>> {
    const params = new HttpParams()
      .set('barcode', barcode)
      .set('warehouseId', warehouseId);
    return this.httpClient.get<ApiResponse<ProductCommonDetailDTOResponse>>(
      ApiUrl.product.getByBarcode,
      { headers: this.createHeaders(), params: params }
    );
  }
}
