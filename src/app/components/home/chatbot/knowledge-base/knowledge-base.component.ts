import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { KbDocumentDTOResponse } from '../../../../dtos/response/chatbot/chatbot.dto';
import { RoleDTOResponse } from '../../../../dtos/response/roles/role.dto';
import { KnowledgeBaseService } from '../../../../services/knowledge-base.service';
import { RoleService } from '../../../../services/role.service';

const ACCEPTED_FILES = '.md,.markdown,.txt,.pdf,.html,.htm';
// Staff roles a document is usually meant for; CUSTOMER accounts have no internal documents
const STAFF_ROLES = ['ADMIN', 'SALESMAN', 'STOREKEEPER', 'ACCOUNTING_STAFF', 'EMPLOYEE'];

// Admin screen of the chatbot knowledge base: which documents the chatbot quotes, and who may read each one
@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './knowledge-base.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeBaseComponent {
  private readonly knowledgeBaseService = inject(KnowledgeBaseService);
  private readonly roleService = inject(RoleService);
  private readonly toastrService = inject(ToastrService);
  private readonly toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };

  readonly acceptedFiles = ACCEPTED_FILES;
  readonly documents = signal<KbDocumentDTOResponse[]>([]);
  readonly roles = signal<RoleDTOResponse[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<string | null>(null);
  readonly search = signal('');

  // Upload form
  readonly uploadFile = signal<File | null>(null);
  readonly uploadTitle = signal('');
  readonly uploadRoles = signal<string[]>([...STAFF_ROLES]);
  readonly uploading = signal(false);

  // Edit form (title + roles of one document)
  readonly editing = signal<KbDocumentDTOResponse | null>(null);
  readonly editTitle = signal('');
  readonly editRoles = signal<string[]>([]);

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return query ? this.documents().filter((doc) => doc.title.toLowerCase().includes(query)) : this.documents();
  });
  readonly totalChunks = computed(() => this.documents().reduce((sum, doc) => sum + doc.chunkCount, 0));
  readonly failedCount = computed(() => this.documents().filter((doc) => doc.indexStatus === 'FAILED').length);

  constructor() {
    this.reload();
    this.roleService.showAllNoParam().subscribe({
      next: (response) => this.roles.set((response.result ?? []).filter((role) => role.code !== 'CUSTOMER')),
    });
  }

  reload(): void {
    this.loading.set(true);
    this.knowledgeBaseService.showAll().subscribe({
      next: (response) => this.documents.set(response.result ?? []),
      error: (error) => this.showError(error),
      complete: () => this.loading.set(false),
    });
  }

  roleName(code: string): string {
    return this.roles().find((role) => role.code === code)?.name ?? code;
  }

  onFileChosen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadFile.set(file);
    if (file && !this.uploadTitle()) {
      this.uploadTitle.set(file.name.replace(/\.[^.]+$/, ''));
    }
  }

  toggleRole(list: 'upload' | 'edit', code: string): void {
    const target = list === 'upload' ? this.uploadRoles : this.editRoles;
    target.update((roles) => (roles.includes(code) ? roles.filter((role) => role !== code) : [...roles, code]));
  }

  upload(form: HTMLFormElement): void {
    const file = this.uploadFile();
    if (!file || !this.uploadRoles().length) {
      return;
    }
    this.uploading.set(true);
    this.knowledgeBaseService.insert(file, this.uploadTitle(), this.uploadRoles()).subscribe({
      next: (response) => {
        this.documents.update((docs) => [response.result, ...docs]);
        this.notifyIndexed(response.result, 'Đã thêm tài liệu');
        form.reset();
        this.uploadFile.set(null);
        this.uploadTitle.set('');
        this.uploadRoles.set([...STAFF_ROLES]);
      },
      error: (error) => {
        this.showError(error);
        this.uploading.set(false);
      },
      complete: () => this.uploading.set(false),
    });
  }

  startEdit(doc: KbDocumentDTOResponse): void {
    this.editing.set(doc);
    this.editTitle.set(doc.title);
    this.editRoles.set([...doc.roleCodes]);
  }

  saveEdit(): void {
    const doc = this.editing();
    if (!doc || !this.editTitle().trim() || !this.editRoles().length) {
      return;
    }
    this.run(doc, this.knowledgeBaseService.update(doc.id, this.editTitle().trim(), this.editRoles()), 'Đã cập nhật tài liệu',
      () => this.editing.set(null));
  }

  replaceContent(doc: KbDocumentDTOResponse, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.run(doc, this.knowledgeBaseService.replaceContent(doc.id, file), 'Đã thay nội dung tài liệu');
    }
  }

  reindex(doc: KbDocumentDTOResponse): void {
    this.run(doc, this.knowledgeBaseService.reindex(doc.id), 'Đã index lại tài liệu');
  }

  remove(doc: KbDocumentDTOResponse): void {
    if (!confirm(`Xóa tài liệu "${doc.title}"? Chatbot sẽ không trả lời theo tài liệu này nữa.`)) {
      return;
    }
    this.busyId.set(doc.id);
    this.knowledgeBaseService.delete(doc.id).subscribe({
      next: () => {
        this.documents.update((docs) => docs.filter((item) => item.id !== doc.id));
        this.toastrService.success('Đã xóa tài liệu', 'Thành công !', this.toastrConfig);
      },
      error: (error) => this.showError(error),
      complete: () => this.busyId.set(null),
    });
  }

  reindexAll(): void {
    this.busyId.set('*');
    this.knowledgeBaseService.reindexAll().subscribe({
      next: () => {
        this.toastrService.success('Đã index lại toàn bộ tài liệu', 'Thành công !', this.toastrConfig);
        this.reload();
      },
      error: (error) => this.showError(error),
      complete: () => this.busyId.set(null),
    });
  }

  private run(doc: KbDocumentDTOResponse, call: Observable<{ result: KbDocumentDTOResponse }>, message: string,
              onDone?: () => void): void {
    this.busyId.set(doc.id);
    call.subscribe({
      next: (response) => {
        this.documents.update((docs) => docs.map((item) => (item.id === doc.id ? response.result : item)));
        this.notifyIndexed(response.result, message);
        onDone?.();
      },
      error: (error) => {
        this.showError(error);
        this.busyId.set(null);
      },
      complete: () => this.busyId.set(null),
    });
  }

  // Saved in the database even when the vector index failed: say so instead of a plain success
  private notifyIndexed(doc: KbDocumentDTOResponse, message: string): void {
    if (doc.indexStatus === 'FAILED') {
      this.toastrService.warning(`${message}, nhưng chưa index được: ${doc.indexError ?? ''}`, 'Lưu ý !', this.toastrConfig);
    } else {
      this.toastrService.success(message, 'Thành công !', this.toastrConfig);
    }
  }

  private showError(error: any): void {
    this.loading.set(false);
    this.toastrService.error(error?.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig);
  }
}
