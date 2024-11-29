import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { SupplierDTOResponse } from '../../../../dtos/response/suppliers/supplier.dto';
import { SupplierService } from '../../../../services/supplier.service';

@Component({
  selector: 'app-supplier-show',
  imports: [],
  templateUrl: './supplier-show.component.html',
  styleUrl: './supplier-show.component.css',
})
export class SupplierShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private supplierService = inject(SupplierService);
  supplierDTOs!: SupplierDTOResponse[];

  ngOnInit(): void {
    this.supplierService.showAllNoParam().subscribe({
      next: (response: ApiResponse<SupplierDTOResponse[]>) => {
        this.supplierDTOs = response.result;
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
