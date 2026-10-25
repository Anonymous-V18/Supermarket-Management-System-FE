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

  private autosize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, this.compact() ? 120 : 180)}px`;
  }
}
