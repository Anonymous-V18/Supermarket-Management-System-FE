import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { StockoutDTOResponse } from '../../../../dtos/response/stockouts/stockout.dto';
import { StockoutService } from '../../../../services/stockout.service';

@Component({
  selector: 'app-stockout-show',
  imports: [RouterLink, DatePipe],
  templateUrl: './stockout-show.component.html',
  styleUrl: './stockout-show.component.css',
})
export class StockoutShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private stockoutService = inject(StockoutService);
  stockoutDTOs!: StockoutDTOResponse[];

  constructor() {}

  ngOnInit() {
    this.getAllNoParam();
  }

  getAllNoParam() {
    this.stockoutService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StockoutDTOResponse[]>) => {
        this.stockoutDTOs = response.result;
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
