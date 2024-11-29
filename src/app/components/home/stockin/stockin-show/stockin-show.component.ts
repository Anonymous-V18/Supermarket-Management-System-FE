import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';
import { StockinDTOResponse } from '../../../../dtos/response/stockins/stockin.dto';
import { StockinService } from '../../../../services/stockin.service';

@Component({
  selector: 'app-stockin-show',
  imports: [RouterLink, DatePipe],
  templateUrl: './stockin-show.component.html',
  styleUrl: './stockin-show.component.css',
})
export class StockinShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private stockinService = inject(StockinService);
  stockinDTOs!: StockinDTOResponse[];

  ngOnInit(): void {
    this.getAllNoParamStockin();
  }

  getAllNoParamStockin() {
    this.stockinService.showAllNoParam().subscribe({
      next: (response: ApiResponse<StockinDTOResponse[]>) => {
        this.stockinDTOs = response.result;
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
