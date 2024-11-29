import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../../services/product.service';
import { ProductDTOResponse } from '../../../../dtos/response/products/product.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';

@Component({
  selector: 'app-product-show',
  imports: [],
  templateUrl: './product-show.component.html',
  styleUrl: './product-show.component.css',
})
export class ProductShowComponent implements OnInit{
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };

  private productService = inject(ProductService);
  productDTOs!: ProductDTOResponse[];

  ngOnInit(): void {
      this.productService.showAllNoParam().subscribe({
        next: (response: ApiResponse<ProductDTOResponse[]>) => {
          this.productDTOs = response.result;
        },
        complete: () => {},
        error: (error: any) => {
          this.toastrService.error(
            error.error.message,
            'Error !',
            this.toastrConfig
          );
        },
      });
  }

}
