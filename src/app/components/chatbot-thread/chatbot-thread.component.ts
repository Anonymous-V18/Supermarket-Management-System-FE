import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatMarkdownPipe } from '../../utils/chat-markdown.pipe';
import { ChatMessageView, ChatScope, RagChatbotService } from '../../services/rag-chatbot.service';

const MAX_QUESTION_LENGTH = 1000;
// Within this distance of the bottom the list keeps following new text
const STICK_THRESHOLD_PX = 80;

// One conversation: messages, sources and the question box. Used by the floating widget (compact)
// and by the full chatbot page.
@Component({
  selector: 'app-chatbot-thread',
  standalone: true,
  imports: [RouterLink, ChatMarkdownPipe],
  templateUrl: './chatbot-thread.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotThreadComponent {
  readonly chat = inject(RagChatbotService);
  readonly compact = input(false);

  private readonly scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');
  private readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');

  readonly draft = signal('');
  readonly stickToBottom = signal(true);
  readonly expandedCitation = signal<string | null>(null);
  readonly copiedId = signal<string | null>(null);
  readonly maxLength = MAX_QUESTION_LENGTH;

  readonly aiModalOpen = signal(false);
  readonly aiProvider = signal<'gemini' | 'groq' | 'openrouter'>('gemini');
  readonly aiApiKey = signal('');
  readonly aiModel = signal('gemini-3.5-flash-lite');
  readonly aiSaving = signal(false);
  readonly aiNotice = signal<string | null>(null);

  readonly aiActive = computed(() => {
    const cfg = this.chat.aiConfig();
    return !!(cfg?.enabled && cfg?.hasApiKey);
  });
  readonly aiBadgeLabel = computed(() => {
    const cfg = this.chat.aiConfig();
    if (!cfg || !cfg.enabled || !cfg.hasApiKey) return 'Gắn Key AI Free';
    if (cfg.provider === 'groq') return 'Groq Llama 3.3';
    if (cfg.provider === 'openrouter') return 'OpenRouter AI';
    return 'Gemini Flash';
  });

  readonly messages = this.chat.activeMessages;
  readonly pending = this.chat.activePending;
  readonly canSend = computed(() => !!this.draft().trim() && !this.pending() && this.draft().length <= MAX_QUESTION_LENGTH);
  readonly scopes = computed<{ value: ChatScope; label: string }[]>(() => [
    { value: 'all', label: 'Tất cả' },
    { value: 'docs', label: 'Quy trình' },
    ...(this.chat.canAskData() ? [{ value: 'data' as ChatScope, label: 'Số liệu' }] : []),
  ]);
  readonly suggestions = computed(() => this.chat.capabilities()?.suggestions ?? []);

  constructor() {
    // Switching conversation starts at its latest message
    effect(() => {
      this.chat.activeConversationId();
      this.stickToBottom.set(true);
    });
    // New text keeps the view at the bottom, unless the reader scrolled up to read something
    afterRenderEffect(() => {
      this.messages();
      const element = this.scroller()?.nativeElement;
      if (element && this.stickToBottom()) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  focus(): void {
    this.composer()?.nativeElement.focus();
  }

  onScroll(): void {
    const element = this.scroller()?.nativeElement;
    if (element) {
      this.stickToBottom.set(element.scrollHeight - element.scrollTop - element.clientHeight < STICK_THRESHOLD_PX);
    }
  }

  scrollToLatest(): void {
    this.stickToBottom.set(true);
    const element = this.scroller()?.nativeElement;
    element?.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.draft.set(textarea.value);
    this.autosize(textarea);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  send(text = this.draft()): void {
    if (!text.trim() || this.pending() || text.length > MAX_QUESTION_LENGTH) {
      return;
    }
    this.chat.send(text);
    this.draft.set('');
    const textarea = this.composer()?.nativeElement;
    if (textarea) {
      textarea.value = '';
      this.autosize(textarea);
    }
    this.stickToBottom.set(true);
  }

  setScope(scope: ChatScope): void {
    this.chat.scope.set(scope);
  }

  toggleCitation(message: ChatMessageView, chunkId: string): void {
    const key = `${message.id}:${chunkId}`;
    this.expandedCitation.update((current) => (current === key ? null : key));
  }

  isExpanded(message: ChatMessageView, chunkId: string): boolean {
    return this.expandedCitation() === `${message.id}:${chunkId}`;
  }

  copy(message: ChatMessageView): void {
    navigator.clipboard?.writeText(message.content).then(() => {
      this.copiedId.set(message.id);
      setTimeout(() => this.copiedId.set(null), 1500);
    }).catch(() => {
      // Clipboard not allowed (e.g. insecure context): nothing to do
    });
  }

  feedback(message: ChatMessageView, value: number): void {
    this.chat.setFeedback(message, value).catch(() => {
      // Feedback is best effort
    });
  }

  cleanLinkLabel(label?: string | null): string {
    if (!label) return 'Mở màn hình';
    return label.replace(/^[\p{Emoji}\p{Extended_Pictographic}\p{Symbol}\s]+/u, '').trim() || 'Mở màn hình';
  }

  isSaved(message: ChatMessageView): boolean {
    return !message.id.startsWith('tmp-');
  }

  toggleAiModal(): void {
    const next = !this.aiModalOpen();
    this.aiModalOpen.set(next);
    this.aiNotice.set(null);
    if (next) {
      const cfg = this.chat.aiConfig();
      if (cfg) {
        if (cfg.provider === 'groq' || cfg.provider === 'openrouter' || cfg.provider === 'gemini') {
          this.aiProvider.set(cfg.provider);
        }
        const m = cfg.model || 'gemini-3.5-flash-lite';
        this.aiModel.set(m.startsWith('qwen') || m === 'gemini-2.5-flash' ? 'gemini-3.5-flash-lite' : m);
        this.aiApiKey.set(cfg.maskedApiKey || '');
      }
    }
  }

  selectAiProvider(provider: 'gemini' | 'groq' | 'openrouter'): void {
    this.aiProvider.set(provider);
    if (provider === 'gemini') {
      this.aiModel.set('gemini-3.5-flash-lite');
    } else if (provider === 'groq') {
      this.aiModel.set('llama-3.3-70b-versatile');
    } else {
      this.aiModel.set('meta-llama/llama-3.3-70b-instruct:free');
    }
  }

  onAiKeyInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.trim();
    this.aiApiKey.set(val);
    if (val.startsWith('AIza') || val.startsWith('AQ.')) {
      this.selectAiProvider('gemini');
    } else if (val.startsWith('gsk_')) {
      this.selectAiProvider('groq');
    } else if (val.startsWith('sk-or-')) {
      this.selectAiProvider('openrouter');
    }
  }

  onAiModelInput(event: Event): void {
    this.aiModel.set((event.target as HTMLInputElement).value.trim());
  }

  saveAiKey(): void {
    if (this.aiSaving()) return;
    this.aiSaving.set(true);
    this.aiNotice.set(null);
    this.chat
      .saveAiConfig({
        enabled: true,
        provider: this.aiProvider(),
        apiKey: this.aiApiKey(),
        model: this.aiModel(),
      })
      .then((res) => {
        this.aiApiKey.set(res.maskedApiKey || '');
        this.aiNotice.set('Đã lưu & kích hoạt AI thành công!');
        setTimeout(() => this.aiModalOpen.set(false), 900);
      })
      .catch(() => {
        this.aiNotice.set('Không thể lưu cấu hình AI. Vui lòng thử lại.');
      })
      .finally(() => this.aiSaving.set(false));
  }

  disableAi(): void {
    if (this.aiSaving()) return;
    this.aiSaving.set(true);
    this.chat
      .saveAiConfig({ enabled: false })
      .then(() => {
        this.aiNotice.set('Đã chuyển về chế độ tra cứu tiêu chuẩn.');
        setTimeout(() => this.aiModalOpen.set(false), 700);
      })
      .finally(() => this.aiSaving.set(false));
  }

  onMarkdownClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const entityBtn = target.closest<HTMLButtonElement>('.rag-entity-chip');
    if (entityBtn) {
      const query = entityBtn.getAttribute('data-chat-query');
      if (query && !this.pending()) {
        event.preventDefault();
        this.send(query);
      }
      return;
    }

    const downloadLink = target.closest<HTMLAnchorElement>('a.rag-download-btn');
    if (downloadLink) {
      const href = downloadLink.getAttribute('href') || '';
      if (href.startsWith('data:text/csv')) {
        event.preventDefault();
        const commaIdx = href.indexOf(',');
        if (commaIdx > 0) {
          const encoded = href.substring(commaIdx + 1);
          const decoded = decodeURIComponent(encoded);
          const blob = new Blob([decoded], { type: 'text/csv;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          const tempAnchor = document.createElement('a');
          tempAnchor.href = blobUrl;
          tempAnchor.download = downloadLink.getAttribute('download') || 'bao-cao.csv';
          tempAnchor.click();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        }
      }
    }
  }

  onMarkdownInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl || !inputEl.classList.contains('rag-table-filter')) return;
    const container = inputEl.closest('.rag-details-content');
    if (!container) return;
    const kw = inputEl.value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
    const rows = container.querySelectorAll<HTMLTableRowElement>('tbody tr');
    rows.forEach((row) => {
      if (!kw) {
        row.style.display = '';
        return;
      }
      const text = (row.textContent || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
      row.style.display = text.includes(kw) ? '' : 'none';
    });
  }

  private autosize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, this.compact() ? 120 : 180)}px`;
  }
}
