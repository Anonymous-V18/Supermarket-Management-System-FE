import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
   afterNextRender,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  KnowledgeScope,
  RagChatbotService,
  RagCitation,
  RagKnowledgeSource,
  ResponseMode,
  SuggestedPrompt,
} from '../../../services/rag-chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  readonly ragService = inject(RagChatbotService);

  @ViewChild('chatScrollContainer')
  private chatScrollContainer?: ElementRef<HTMLDivElement>;

  // Main view tab: 'chat' | 'knowledge'
  readonly activeTab = signal<'chat' | 'knowledge'>('chat');

  // Responsive panel states
  readonly leftPanelOpen = signal<boolean>(true);
  readonly rightPanelOpen = signal<boolean>(true);
  readonly rightPanelTab = signal<'inspector' | 'config'>('inspector');
  readonly isCompactScreen = signal<boolean>(false);
  readonly isMobileScreen = signal<boolean>(false);

  // Conversation search query
  readonly conversationSearch = signal<string>('');

  // Chat input text
  readonly questionInput = signal<string>('');

  // Copied message feedback
  readonly copiedMessageId = signal<string | null>(null);

  // Knowledge base filters & upload state
  readonly kbSearch = signal<string>('');
  readonly kbTypeFilter = signal<'all' | 'db_sync' | 'document'>('all');
  readonly showUploadModal = signal<boolean>(false);
  readonly uploadFileName = signal<string>('');
  readonly uploadCategory = signal<string>('Quy trình vận hành (SOP)');
  readonly uploadFileSize = signal<string>('1.2 MB');
  readonly previewSource = signal<RagKnowledgeSource | null>(null);

  readonly filteredConversations = computed(() => {
    const q = this.conversationSearch().trim().toLowerCase();
    const list = this.ragService.conversations();
    if (!q) return list;
    return list.filter((c) => c.title.toLowerCase().includes(q));
  });

  readonly filteredKnowledgeSources = computed(() => {
    const q = this.kbSearch().trim().toLowerCase();
    const typeFilter = this.kbTypeFilter();
    return this.ragService.knowledgeSources().filter((item) => {
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'db_sync' && item.type === 'db_sync') ||
        (typeFilter === 'document' && item.type !== 'db_sync');
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  });

  readonly dbSourcesCount = computed(
    () =>
      this.ragService
        .knowledgeSources()
        .filter((s) => s.type === 'db_sync').length
  );

  readonly docSourcesCount = computed(
    () =>
      this.ragService
        .knowledgeSources()
        .filter((s) => s.type !== 'db_sync').length
  );

  constructor() {
    this.ragService.closeWidget();
    afterNextRender(() => {
      this.checkViewportSize(window.innerWidth);
    });
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: UIEvent): void {
    const w = (event.target as Window).innerWidth;
    this.checkViewportSize(w);
  }

  private checkViewportSize(width: number): void {
    const wasCompact = this.isCompactScreen();
    const wasMobile = this.isMobileScreen();
    const nowCompact = width < 1360;
    const nowMobile = width < 992;

    this.isCompactScreen.set(nowCompact);
    this.isMobileScreen.set(nowMobile);

    // Auto-collapse side panels when transitioning into smaller viewports so center chat stays spacious
    if (nowCompact && !wasCompact) {
      this.rightPanelOpen.set(false);
    }
    if (nowMobile && !wasMobile) {
      this.leftPanelOpen.set(false);
    }
    if (!nowMobile && wasMobile) {
      this.leftPanelOpen.set(true);
    }
  }

  toggleLeftPanel(): void {
    const next = !this.leftPanelOpen();
    this.leftPanelOpen.set(next);
    if (next && this.isMobileScreen()) {
      this.rightPanelOpen.set(false);
    }
  }

  toggleRightPanel(): void {
    const next = !this.rightPanelOpen();
    this.rightPanelOpen.set(next);
    if (next && this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
  }

  closeOverlayPanels(): void {
    if (this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
    if (this.isCompactScreen()) {
      this.rightPanelOpen.set(false);
    }
  }

  selectConversation(id: string): void {
    this.ragService.selectConversation(id);
    if (this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
  }

  createNewConversation(): void {
    this.ragService.createNewConversation();
    if (this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
  }

  onSend(): void {
    const text = this.questionInput().trim();
    if (!text || this.ragService.isRetrieving()) return;
    this.questionInput.set('');
    this.ragService.sendMessage(text);
    this.scrollToBottomSoon();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  useSuggestedPrompt(item: SuggestedPrompt): void {
    this.ragService.updateConfig({ knowledgeScope: item.scope });
    this.ragService.sendMessage(item.prompt);
    this.scrollToBottomSoon();
  }

  inspectCitation(citation: RagCitation): void {
    this.ragService.selectedCitation.set(citation);
    this.rightPanelTab.set('inspector');
    this.rightPanelOpen.set(true);
    if (this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
  }

  openConfigPanel(): void {
    this.rightPanelTab.set('config');
    this.rightPanelOpen.set(true);
    if (this.isMobileScreen()) {
      this.leftPanelOpen.set(false);
    }
  }

  setScope(scope: KnowledgeScope): void {
    this.ragService.updateConfig({ knowledgeScope: scope });
  }

  setTopK(topK: number): void {
    this.ragService.updateConfig({ topK });
  }

  setThreshold(threshold: number): void {
    this.ragService.updateConfig({ similarityThreshold: threshold });
  }

  setResponseMode(responseMode: ResponseMode): void {
    this.ragService.updateConfig({ responseMode });
  }

  toggleReranker(): void {
    const current = this.ragService.config().rerankerEnabled;
    this.ragService.updateConfig({ rerankerEnabled: !current });
  }

  copyMessage(messageId: string, content: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
    this.copiedMessageId.set(messageId);
    setTimeout(() => {
      if (this.copiedMessageId() === messageId) {
        this.copiedMessageId.set(null);
      }
    }, 1800);
  }

  formatMessageHtml(raw: string): string {
    if (!raw) return '';
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/`([^`\n]+)`/g, '<code class="rag-inline-code">$1</code>');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadFileName.set(file.name);
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      this.uploadFileSize.set(
        sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`
      );
    }
  }

  submitUploadDocument(): void {
    const name =
      this.uploadFileName().trim() ||
      'Chinh_sach_khuyen_mai_va_the_thanh_vien_2026.pdf';
    this.ragService.addUploadedDocument(
      name,
      this.uploadCategory(),
      this.uploadFileSize()
    );
    this.uploadFileName.set('');
    this.showUploadModal.set(false);
  }

  formatScorePercent(score: number): number {
    return Math.round(score * 100);
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const el = this.chatScrollContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 60);
  }
}
