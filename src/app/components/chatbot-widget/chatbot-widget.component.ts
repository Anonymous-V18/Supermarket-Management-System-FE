import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  KnowledgeScope,
  RagChatbotService,
  RagCitation,
  SuggestedPrompt,
} from '../../services/rag-chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotWidgetComponent {
  readonly ragService = inject(RagChatbotService);
  private readonly router = inject(Router);

  @ViewChild('widgetScroll')
  private widgetScroll?: ElementRef<HTMLDivElement>;

  readonly currentUrl = signal<string>(this.router.url);
  readonly widgetInput = signal<string>('');
  readonly expandedCitationId = signal<string | null>(null);

  // Hide the floating widget when already on the dedicated /home/chatbot page
  readonly isOnDedicatedChatbotPage = computed(() =>
    this.currentUrl().includes('/home/chatbot')
  );

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
      });
  }

  toggleWidget(): void {
    this.ragService.toggleWidget();
    if (this.ragService.widgetOpen()) {
      this.scrollToBottomSoon();
    }
  }

  openFullPage(): void {
    this.ragService.closeWidget();
    this.router.navigate(['/home/chatbot']);
  }

  onSend(): void {
    const text = this.widgetInput().trim();
    if (!text || this.ragService.isRetrieving()) return;
    this.widgetInput.set('');
    this.ragService.sendMessage(text);
    this.scrollToBottomSoon();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  usePrompt(sp: SuggestedPrompt): void {
    this.ragService.updateConfig({ knowledgeScope: sp.scope });
    this.ragService.sendMessage(sp.prompt);
    this.scrollToBottomSoon();
  }

  setScope(scope: KnowledgeScope): void {
    this.ragService.updateConfig({ knowledgeScope: scope });
  }

  toggleCitationPreview(cit: RagCitation): void {
    this.ragService.selectedCitation.set(cit);
    this.expandedCitationId.update((curr) => (curr === cit.id ? null : cit.id));
  }

  formatScore(score: number): number {
    return Math.round(score * 100);
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

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const el = this.widgetScroll?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 60);
  }
}
