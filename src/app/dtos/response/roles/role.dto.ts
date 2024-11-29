export class RoleDTOResponse {
  private code: string;
  private name: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

}
