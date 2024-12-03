export class ChangePasswordDTORequest {
  oldPassword: string;
  newPassword: string;

  constructor(oldPassword: any, newPassword: any) {
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }
}
