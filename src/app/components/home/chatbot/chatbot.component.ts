import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { RagChatbotService } from '../../../services/rag-chatbot.service';
import { ChatbotThreadComponent } from '../../chatbot-thread/chatbot-thread.component';
import { KnowledgeBaseComponent } from './knowledge-base/knowledge-base.component';
import { ChatConversationDTOResponse } from '../../../dtos/response/chatbot/chatbot.dto';

// Full-page assistant: conversation history + chat, and (admin only) the knowledge base
@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [DatePipe, ChatbotThreadComponent, KnowledgeBaseComponent],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  readonly chat = inject(RagChatbotService);
  private readonly toastrService = inject(ToastrService);
  private readonly toastrConfig = { timeOut: 3000, closeButton: true, progressBar: true };

  readonly activeTab = signal<'chat' | 'knowledge'>('chat');
  readonly historyOpen = signal(false);
  readonly search = signal('');

  readonly filteredConversations = computed(() => {
    const query = this.search().trim().toLowerCase();
    const list = this.chat.conversations();
    return query ? list.filter((conversation) => conversation.title.toLowerCase().includes(query)) : list;
  });

  constructor() {
    this.chat.closeWidget();
    this.chat.ensureLoaded();
  }

  newConversation(): void {
    this.chat.newConversation();
    this.historyOpen.set(false);
  }

  select(conversation: ChatConversationDTOResponse): void {
    this.chat.selectConversation(conversation.id);
    this.historyOpen.set(false);
  }

  remove(conversation: ChatConversationDTOResponse, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Xóa cuộc trò chuyện "${conversation.title}"?`)) {
      return;
    }
    this.chat.deleteConversation(conversation.id)
      .then(() => this.toastrService.success('Đã xóa cuộc trò chuyện', 'Thành công !', this.toastrConfig))
      .catch((error) => this.toastrService.error(error?.error?.message ?? 'Có lỗi xảy ra', 'Lỗi !', this.toastrConfig));
  }
}
