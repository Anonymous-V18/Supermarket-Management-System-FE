export class ApiResponse<T> {
  result: T;
  message: string;
  status: number;

  constructor(result: T, message: string, status: number) {
    this.result = result;
    this.message = message;
    this.status = status;
  }

}
