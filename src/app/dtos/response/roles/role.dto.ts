export class RoleDTOResponse {
   id: string;
   code: string;
   name: string;

  constructor(id: string, code: string, name: string) {
    this.id = id;
    this.code = code;
    this.name = name;
  }

}
