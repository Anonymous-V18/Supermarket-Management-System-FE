export class ShiftChecklistDTORequest {
  workDate: string; // yyyy-MM-dd
  shiftCode: string;
  checkedItemIds: string[];
  isCompleted?: boolean;
  openingCash?: number | null;
  closingCash?: number | null;
  notes?: string | null;

  constructor(
    workDate: string,
    shiftCode: string,
    checkedItemIds: string[],
    openingCash?: number | null,
    closingCash?: number | null,
    notes?: string | null,
    isCompleted?: boolean
  ) {
    this.workDate = workDate;
    this.shiftCode = shiftCode;
    this.checkedItemIds = checkedItemIds;
    this.openingCash = openingCash;
    this.closingCash = closingCash;
    this.notes = notes;
    this.isCompleted = isCompleted;
  }
}
