import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RagChatbotService } from '../../services/rag-chatbot.service';
import { ChatbotThreadComponent } from '../chatbot-thread/chatbot-thread.component';

// Floating assistant available on every screen (hidden on the full chatbot page)
@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [ChatbotThreadComponent],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ChatbotWidgetComponent {
  readonly chat = inject(RagChatbotService);
  private readonly router = inject(Router);

  private readonly launcher = viewChild<ElementRef<HTMLButtonElement>>('launcher');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly thread = viewChild(ChatbotThreadComponent);

  readonly currentUrl = signal(this.router.url);
  readonly hidden = computed(() => this.currentUrl().startsWith('/home/chatbot'));

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
    // Focus the question box when the panel opens
    effect(() => {
      if (this.chat.widgetOpen()) {
        setTimeout(() => this.thread()?.focus());
      }
    });
  }

  toggle(): void {
    this.chat.toggleWidget();
  }

  close(): void {
    this.chat.closeWidget();
    // After the panel is gone: on phones the launcher is hidden while the panel is open
    setTimeout(() => this.launcher()?.nativeElement.focus());
  }

  onEscape(): void {
    if (this.chat.widgetOpen() && !this.hidden()) {
      this.close();
    }
  }

  openFullPage(): void {
    this.chat.closeWidget();
    this.router.navigate(['/home/chatbot']);
  }

  // Keeps Tab inside the open panel
  trapFocus(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;
    if (event.key !== 'Tab' || !panel) {
      return;
    }
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
