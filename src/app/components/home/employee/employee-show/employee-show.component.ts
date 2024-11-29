import { Component, inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../../../services/employee.service';
import { EmployeeDTOResponse } from '../../../../dtos/response/employees/employee.dto';
import { ApiResponse } from '../../../../dtos/response/api-response/api-response.dto';

@Component({
  selector: 'app-employee-show',
  imports: [],
  templateUrl: './employee-show.component.html',
  styleUrl: './employee-show.component.css',
})
export class EmployeeShowComponent implements OnInit {
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };

  private employeeService = inject(EmployeeService);
  employeeDTOs!: EmployeeDTOResponse[];

  ngOnInit(): void {
    this.employeeService.showAllNoParam().subscribe({
      next: (response: ApiResponse<EmployeeDTOResponse[]>) => {
        this.employeeDTOs = response.result;
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
