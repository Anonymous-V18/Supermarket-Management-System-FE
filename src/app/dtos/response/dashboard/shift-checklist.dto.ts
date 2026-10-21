// Fields left null by the backend are omitted from the JSON (@JsonInclude NON_NULL).
export class ShiftChecklistDTOResponse {
  id?: string;
  username: string;
  workDate: string; // yyyy-MM-dd
  shiftCode: string;
  shiftName: string;
  checkedItemIds: string[];
  isCompleted: boolean;
  completedPercent: number;
  openingCash?: number;
  closingCash?: number;
  notes?: string;

  constructor(
    username: string,
    workDate: string,
    shiftCode: string,
    shiftName: string,
    checkedItemIds: string[],
    isCompleted: boolean,
    completedPercent: number,
    id?: string,
    openingCash?: number,
    closingCash?: number,
    notes?: string
  ) {
    this.id = id;
    this.username = username;
    this.workDate = workDate;
    this.shiftCode = shiftCode;
    this.shiftName = shiftName;
    this.checkedItemIds = checkedItemIds;
    this.isCompleted = isCompleted;
    this.completedPercent = completedPercent;
    this.openingCash = openingCash;
    this.closingCash = closingCash;
    this.notes = notes;
  }
}
