import { RoleDTOResponse } from './../roles/role.dto';

export class UserDetailsDTOResponse {
  private id: string;
  private username: string;
  private roles: RoleDTOResponse[];

  constructor(id: string, username: string, roles: RoleDTOResponse[]) {
    this.id = id;
    this.username = username;
    this.roles = roles;
  }

  public getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getRoles(): RoleDTOResponse[] {
    return this.roles;
  }

}
