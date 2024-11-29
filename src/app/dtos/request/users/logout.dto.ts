export class LogoutDTORequest {
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}
