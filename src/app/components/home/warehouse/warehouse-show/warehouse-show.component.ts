import { RoleService } from './../../../../services/role.service';
import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { WarehouseDTResponse } from '../../../../dtos/response/warehouses/warehouse.dto';
import { WarehouseService } from '../../../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-show',
  imports: [RouterLink, DatePipe],
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
  private roleService = inject(RoleService);

  ngOnInit(): void {
    this.getAllNoParam();
  }

  getAllNoParam() {
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

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
