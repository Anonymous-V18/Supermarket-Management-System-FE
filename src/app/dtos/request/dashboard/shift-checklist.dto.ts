export class ShiftChecklistDTORequest {
  workDate: string; // yyyy-MM-dd
  shiftCode: string;
  checkedItemIds: string[]; // checklist item codes
  isCompleted?: boolean;
  notes?: string | null;

  constructor(
    workDate: string,
    shiftCode: string,
    checkedItemIds: string[],
    notes?: string | null,
    isCompleted?: boolean
  ) {
    this.workDate = workDate;
    this.shiftCode = shiftCode;
    this.checkedItemIds = checkedItemIds;
    this.notes = notes;
    this.isCompleted = isCompleted;
  }
}
