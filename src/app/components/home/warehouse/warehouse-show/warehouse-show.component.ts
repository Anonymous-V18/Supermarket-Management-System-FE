import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { WarehouseService } from '../../../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-show',
  imports: [],
  templateUrl: './warehouse-show.component.html',
  styleUrl: './warehouse-show.component.css',
})
export class WarehouseShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeout: 3000,
    closeButton: true,
    progressBar: true,
  };
  private warehouseService = inject(WarehouseService);
  warehouseDTOs!: WarehouseDTResponse[];

  ngOnInit(): void {
    this.warehouseService.showAllNoParam().subscribe({
      next: (response: ApiResponse<WarehouseDTResponse[]>) => {
        this.warehouseDTOs = response.result;
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
