import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InvoiceDTOResponse } from '../../../../dtos/response/invoices/invoice.dto';
import { InvoiceService } from '../../../../services/invoice.service';
import { ApiResponse } from './../../../../dtos/response/api-response/api-response.dto';

@Component({
  selector: 'app-invoice-show',
  imports: [DatePipe, RouterLink],
  templateUrl: './invoice-show.component.html',
  styleUrl: './invoice-show.component.css',
})
export class InvoiceShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  private invoiceService = inject(InvoiceService);
  invoiceDTOs!: InvoiceDTOResponse[];

  ngOnInit(): void {
    this.getAllNoParam();
  }

  getAllNoParam() {
    this.invoiceService.showAllNoParam().subscribe({
      next: (response: ApiResponse<InvoiceDTOResponse[]>) => {
        this.invoiceDTOs = response.result;
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
