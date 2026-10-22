export class ChecklistItemDTOResponse {
  code: string;
  label: string;
  groupCode: 'START' | 'END';
  sortOrder: number;
  checked: boolean;

  constructor(
    code: string,
    label: string,
    groupCode: 'START' | 'END',
    sortOrder: number,
    checked: boolean
  ) {
    this.code = code;
    this.label = label;
    this.groupCode = groupCode;
    this.sortOrder = sortOrder;
    this.checked = checked;
  }
}

// Fields left null by the backend are omitted from the JSON (@JsonInclude NON_NULL).
export class ShiftChecklistDTOResponse {
  id?: string;
  username: string;
  workDate: string; // yyyy-MM-dd
  shiftCode: string;
  shiftName: string;
  checkedItemIds: string[]; // checklist item codes
  // Every active task in display order; the list is managed in the checklist_item table.
  items: ChecklistItemDTOResponse[];
  isCompleted: boolean;
  completedPercent: number;
  notes?: string;

  constructor(
    username: string,
    workDate: string,
    shiftCode: string,
    shiftName: string,
    checkedItemIds: string[],
    items: ChecklistItemDTOResponse[],
    isCompleted: boolean,
    completedPercent: number,
    id?: string,
    notes?: string
  ) {
    this.id = id;
    this.username = username;
    this.workDate = workDate;
    this.shiftCode = shiftCode;
    this.shiftName = shiftName;
    this.checkedItemIds = checkedItemIds;
    this.items = items;
    this.isCompleted = isCompleted;
    this.completedPercent = completedPercent;
    this.notes = notes;
  }
}
