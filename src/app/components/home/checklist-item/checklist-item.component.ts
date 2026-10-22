import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ChecklistItemDTORequest } from '../../../dtos/request/operations/operations.dto';
import { ApiResponse } from '../../../dtos/response/api-response/api-response.dto';
import { ChecklistItemDTOResponse } from '../../../dtos/response/reports/report.dto';
import { ChecklistItemService } from '../../../services/checklist-item.service';

// Admin list of shift tasks shown on the dashboard. Items are hidden (inactive), never deleted,
// because completed checklists keep pointing at them.
@Component({
  selector: 'app-checklist-item',
  imports: [ReactiveFormsModule],
  templateUrl: './checklist-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ChecklistItemComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private checklistItemService = inject(ChecklistItemService);
  private toastrService = inject(ToastrService);
  private toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };

  newItemForm = this.formBuilder.group({
    code: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]{2,50}$/)]],
    label: ['', [Validators.required, Validators.maxLength(255)]],
    groupCode: ['START' as 'START' | 'END', [Validators.required]],
    sortOrder: [10, [Validators.required, Validators.min(0)]],
  });
  items = this.formBuilder.array<FormGroup>([]);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.checklistItemService.showAll().subscribe({
      next: (response: ApiResponse<ChecklistItemDTOResponse[]>) => {
        this.items.clear();
        response.result.forEach((item) =>
          this.items.push(
            this.formBuilder.group({
              id: [item.id],
              code: [item.code],
              label: [item.label, [Validators.required, Validators.maxLength(255)]],
              groupCode: [item.groupCode],
              sortOrder: [item.sortOrder, [Validators.required, Validators.min(0)]],
              isActive: [item.isActive],
            })
          )
        );
      },
      error: (error: any) => this.showError(error),
    });
  }

  rows(): FormArray<FormGroup> {
    return this.items;
  }

  add() {
    const value = this.newItemForm.getRawValue();
    const request: ChecklistItemDTORequest = {
      code: value.code ?? '',
      label: (value.label ?? '').trim(),
      groupCode: value.groupCode ?? 'START',
      sortOrder: Number(value.sortOrder) || 0,
      isActive: true,
    };
    this.checklistItemService.insert(request).subscribe({
      next: (response: ApiResponse<ChecklistItemDTOResponse>) => {
        this.toastrService.success(response.message, 'Thành công !', this.toastrConfig);
        this.newItemForm.reset({ code: '', label: '', groupCode: 'START', sortOrder: 10 });
        this.load();
      },
      error: (error: any) => this.showError(error),
    });
  }

  save(row: FormGroup) {
    const value = row.getRawValue();
    const request: ChecklistItemDTORequest = {
      label: (value.label ?? '').trim(),
      groupCode: value.groupCode,
      sortOrder: Number(value.sortOrder) || 0,
      isActive: !!value.isActive,
    };
    this.checklistItemService.update(value.id, request).subscribe({
      next: (response: ApiResponse<ChecklistItemDTOResponse>) => {
        this.toastrService.success(response.message, 'Thành công !', this.toastrConfig);
        row.markAsPristine();
      },
      error: (error: any) => this.showError(error),
    });
  }

  private showError(error: any) {
    this.toastrService.error(error.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig);
  }
}
