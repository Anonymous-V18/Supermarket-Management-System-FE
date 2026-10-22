import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeUpdateDTORequest } from '../dtos/request/employees/employee-update.dto';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { EmployeeDTOResponse } from '../dtos/response/employees/employee.dto';
import { PageResponse } from '../dtos/response/page/page-response.dto';
import { ApiUrl } from '../environments/api-url';
import { EmployeeInsertDTORequest } from './../dtos/request/employees/employee-insert.dto';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrlShowAllNoParam = ApiUrl.employee.showAllNoParam;
  private apiUrlInsert = ApiUrl.employee.insert;
  private apiUrlUpdate = ApiUrl.employee.update;
  private apiUrlGetDetail = ApiUrl.employee.getDetail;
  private apiUrlGetMyInfo = ApiUrl.employee.getMyInfo;
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

  showAllNoParam(): Observable<ApiResponse<EmployeeDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<EmployeeDTOResponse[]>>(
      this.apiUrlShowAllNoParam,
      this.apiConfig
    );
  }

  insert(
    employeeInsertDTORequest: EmployeeInsertDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(
      this.apiUrlInsert,
      employeeInsertDTORequest,
      this.apiConfig
    );
  }

  update(
    employeeId: string,
    employeeUpdateDTORequest: EmployeeUpdateDTORequest
  ): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      `${this.apiUrlUpdate}/${employeeId}`,
      employeeUpdateDTORequest,
      this.apiConfig
    );
  }

  updateCurrentEmployee(employeeUpdateDTORequest: EmployeeUpdateDTORequest): Observable<ApiResponse<void>> {
    return this.httpClient.put<ApiResponse<void>>(
      this.apiUrlUpdate,
      employeeUpdateDTORequest,
      this.apiConfig
    );
  }

  getDetail(employeeId: string): Observable<ApiResponse<EmployeeDTOResponse>> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.httpClient.get<ApiResponse<EmployeeDTOResponse>>(
      this.apiUrlGetDetail,
      {
        headers: this.createHeaders(),
        params: params,
      }
    );
  }

  getMyInfo(): Observable<ApiResponse<EmployeeDTOResponse>> {
    return this.httpClient.get<ApiResponse<EmployeeDTOResponse>>(
      this.apiUrlGetMyInfo,
      this.apiConfig
    );
  }

  // Paged list for the list screen; keyword matches codes, names, phone numbers...
  search(
    keyword: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<PageResponse<EmployeeDTOResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword.trim()) params = params.set('keyword', keyword.trim());
    return this.httpClient.get<ApiResponse<PageResponse<EmployeeDTOResponse>>>(
      ApiUrl.employee.search,
      { headers: this.createHeaders(), params: params }
    );
  }
}
