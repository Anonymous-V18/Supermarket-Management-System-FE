import { RoleDTOResponse } from './../roles/role.dto';

export class UserDetailsDTOResponse {
  id: string;
  username: string;
  roles: RoleDTOResponse[];

  constructor(id: string, username: string, roles: RoleDTOResponse[]) {
    this.id = id;
    this.username = username;
    this.roles = roles;
  }
}
