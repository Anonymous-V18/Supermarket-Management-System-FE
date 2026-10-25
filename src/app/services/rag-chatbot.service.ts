import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import {
  ChatCapabilitiesDTOResponse,
  ChatCitationDTOResponse,
  ChatConversationDTOResponse,
  ChatMessageDTOResponse,
} from '../dtos/response/chatbot/chatbot.dto';
import { ApiUrl } from '../environments/api-url';
import { CONSTANT } from '../environments/constant';
import { LocalStorageService } from './local-storage.service';

// all: documents and data, docs: documents only, data: live data only
export type ChatScope = 'all' | 'docs' | 'data';

export interface ChatMessageView {
  // Server id once saved; a temporary id while streaming
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  citations: ChatCitationDTOResponse[];
  suggestions: string[];
  link?: string;
  linkLabel?: string;
  latencyMs?: number;
  feedback?: number;
  streaming: boolean;
  error?: string;
  // The question an assistant message answers (for "Thử lại")
  question?: string;
}

// Key of the conversation that has not been saved yet
export const NEW_CONVERSATION = '__new__';

// Client-side state of the internal chatbot. Everything comes from the server: what the user may ask
// (capabilities), private history, and answers streamed as server-sent events. The store belongs to the
// signed-in user only: it is wiped on logout and whenever another user is detected.
@Injectable({
  providedIn: 'root',
})
export class RagChatbotService {
  private httpClient = inject(HttpClient);
  private localStorageService = inject(LocalStorageService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly widgetOpen = signal(false);
  readonly capabilities = signal<ChatCapabilitiesDTOResponse | null>(null);
  readonly conversations = signal<ChatConversationDTOResponse[]>([]);
  readonly activeConversationId = signal<string>(NEW_CONVERSATION);
  readonly scope = signal<ChatScope>('all');
  readonly loadError = signal<string | null>(null);

  private readonly messagesByConversation = signal<Record<string, ChatMessageView[]>>({});
  private readonly pendingConversations = signal<ReadonlySet<string>>(new Set());
  private readonly controllers = new Map<string, AbortController>();
  private loadedFor: string | null = null;
  private loading: Promise<void> | null = null;
  private temporaryId = 0;

  readonly activeMessages = computed(() => this.messagesByConversation()[this.activeConversationId()] ?? []);
  readonly activePending = computed(() => this.pendingConversations().has(this.activeConversationId()));
  readonly canAskData = computed(() => (this.capabilities()?.tools.length ?? 0) > 0);
  readonly canManageKnowledge = computed(() => this.capabilities()?.canManageKnowledge ?? false);

  openWidget(): void {
    this.widgetOpen.set(true);
    this.ensureLoaded();
  }

  closeWidget(): void {
    this.widgetOpen.set(false);
  }

  toggleWidget(): void {
    if (this.widgetOpen()) {
      this.closeWidget();
    } else {
      this.openWidget();
    }
  }

  // Loads capabilities and history once per signed-in user
  ensureLoaded(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }
    const user = this.localStorageService.get('username');
    if (this.loadedFor !== user) {
      this.reset();
      this.loadedFor = user;
    }
    if (this.capabilities()) {
      return Promise.resolve();
    }
    if (!this.loading) {
      this.loading = Promise.all([
        firstValueFrom(this.httpClient.get<ApiResponse<ChatCapabilitiesDTOResponse>>(ApiUrl.chatbot.capabilities)),
        firstValueFrom(this.httpClient.get<ApiResponse<ChatConversationDTOResponse[]>>(ApiUrl.chatbot.conversations)),
      ])
        .then(([capabilities, conversations]) => {
          this.capabilities.set(capabilities.result);
          this.conversations.set(conversations.result ?? []);
          this.loadError.set(null);
        })
        .catch((error) => this.loadError.set(this.messageOf(error)))
        .finally(() => (this.loading = null));
    }
    return this.loading;
  }

  // Forget everything (logout / another user); also stops answers still streaming
  reset(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
    this.capabilities.set(null);
    this.conversations.set([]);
    this.messagesByConversation.set({});
    this.pendingConversations.set(new Set());
    this.activeConversationId.set(NEW_CONVERSATION);
    this.scope.set('all');
    this.loadError.set(null);
    this.widgetOpen.set(false);
    this.loadedFor = null;
  }

  newConversation(): void {
    this.activeConversationId.set(NEW_CONVERSATION);
    if (!this.pendingConversations().has(NEW_CONVERSATION)) {
      this.setMessages(NEW_CONVERSATION, []);
    }
  }

  async selectConversation(id: string): Promise<void> {
    this.activeConversationId.set(id);
    if (this.messagesByConversation()[id]) {
      return;
    }
    try {
      const response = await firstValueFrom(this.httpClient.get<ApiResponse<ChatMessageDTOResponse[]>>(
        ApiUrl.chatbot.messages, { params: { conversationId: id } }));
      this.setMessages(id, (response.result ?? []).map((message) => this.toView(message)));
    } catch (error) {
      this.setMessages(id, [this.errorMessage(this.messageOf(error))]);
    }
  }

  async deleteConversation(id: string): Promise<void> {
    await firstValueFrom(this.httpClient.delete(`${ApiUrl.chatbot.deleteConversation}/${id}`));
    this.controllers.get(id)?.abort();
    this.conversations.update((list) => list.filter((conversation) => conversation.id !== id));
    this.messagesByConversation.update((all) => {
      const { [id]: _removed, ...rest } = all;
      return rest;
    });
    if (this.activeConversationId() === id) {
      this.newConversation();
    }
  }

  async setFeedback(message: ChatMessageView, value: number): Promise<void> {
    const next = message.feedback === value ? 0 : value;
    await firstValueFrom(this.httpClient.patch(`${ApiUrl.chatbot.feedback}/${message.id}/feedback`, { value: next }));
    this.updateMessage(this.findConversationOf(message.id), message.id, { feedback: next === 0 ? undefined : next });
  }

  stop(conversationId = this.activeConversationId()): void {
    this.controllers.get(conversationId)?.abort();
  }

  retry(message: ChatMessageView): void {
    if (message.question) {
      this.send(message.question);
    }
  }

  // Sends a question to the active conversation and streams the answer into it
  async send(question: string): Promise<void> {
    const text = question.trim();
    let key = this.activeConversationId();
    if (!text || this.pendingConversations().has(key)) {
      return;
    }
    await this.ensureLoaded();
    const assistantId = `tmp-${++this.temporaryId}`;
    this.appendMessages(key, [
      this.view({ id: `tmp-${++this.temporaryId}`, role: 'user', content: text }),
      this.view({ id: assistantId, role: 'assistant', content: '', streaming: true, question: text }),
    ]);
    this.setPending(key, true);
    const controller = new AbortController();
    this.controllers.set(key, controller);

    try {
      const response = await fetch(ApiUrl.chatbot.ask, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${this.localStorageService.get(CONSTANT.ACCESS_TOKEN_NAME_KEY) ?? ''}`,
        },
        body: JSON.stringify({
          conversationId: key === NEW_CONVERSATION ? null : key,
          question: text,
          scope: this.scope(),
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(await this.errorText(response));
      }
      await this.readEvents(response.body, (event, data) => {
        key = this.applyEvent(key, assistantId, event, data);
      });
      this.updateMessage(key, assistantId, { streaming: false });
    } catch (error) {
      const aborted = controller.signal.aborted;
      const current = this.messagesByConversation()[key]?.find((message) => message.id === assistantId);
      this.updateMessage(key, assistantId, {
        streaming: false,
        content: aborted ? `${current?.content ?? ''}${current?.content ? '\n\n' : ''}_(Đã dừng)_` : current?.content ?? '',
        error: aborted ? undefined : this.messageOf(error),
      });
    } finally {
      this.controllers.delete(key);
      this.setPending(key, false);
      if (key !== NEW_CONVERSATION) {
        this.setPending(NEW_CONVERSATION, false);
      }
    }
  }

  // Server-sent events over fetch (EventSource cannot send the Authorization header)
  private async readEvents(body: ReadableStream<Uint8Array>, onEvent: (event: string, data: any) => void): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        let event = 'message';
        const data: string[] = [];
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            data.push(line.slice(5).replace(/^ /, ''));
          }
        }
        if (data.length) {
          try {
            const parsed = JSON.parse(data.join('\n'));
            onEvent(event, parsed);
          } catch {
            onEvent(event, data.join('\n'));
          }
        }
        if (event === 'done' || event === 'error') {
          try {
            await reader.cancel();
          } catch {
            // Reader already finished or closed
          }
          return;
        }
      }
    }
  }

  // Returns the conversation key, which changes once the server has created the conversation
  private applyEvent(key: string, assistantId: string, event: string, data: any): string {
    switch (event) {
      case 'meta':
        return this.adoptConversation(key, data.conversationId, data.title);
      case 'delta':
        this.updateMessage(key, assistantId, (message) => ({ content: message.content + data.text }));
        break;
      case 'replace':
        this.updateMessage(key, assistantId, { content: data.text });
        break;
      case 'citations':
        this.updateMessage(key, assistantId, { citations: data.items ?? [] });
        break;
      case 'action':
        this.updateMessage(key, assistantId, { link: data.link, linkLabel: data.label });
        break;
      case 'suggestions':
        this.updateMessage(key, assistantId, { suggestions: data.items ?? [] });
        break;
      case 'done':
        this.updateMessage(key, assistantId, { id: data.messageId, intent: data.intent, latencyMs: data.latencyMs, streaming: false });
        break;
      case 'error':
        this.updateMessage(key, assistantId, { error: data.message, streaming: false });
        break;
    }
    return key;
  }

  // The first answer of a new conversation: move its messages under the id the server gave it
  private adoptConversation(key: string, conversationId: string, title: string): string {
    if (key === conversationId) {
      return key;
    }
    const messages = this.messagesByConversation()[key] ?? [];
    this.messagesByConversation.update((all) => {
      const { [key]: _moved, ...rest } = all;
      return { ...rest, [conversationId]: messages };
    });
    this.pendingConversations.update((set) => {
      const next = new Set(set);
      next.delete(key);
      next.add(conversationId);
      return next;
    });
    const controller = this.controllers.get(key);
    if (controller) {
      this.controllers.delete(key);
      this.controllers.set(conversationId, controller);
    }
    const now = new Date().toISOString();
    this.conversations.update((list) => [{ id: conversationId, title, createdDate: now, modifiedDate: now },
      ...list.filter((conversation) => conversation.id !== conversationId)]);
    if (this.activeConversationId() === key) {
      this.activeConversationId.set(conversationId);
    }
    return conversationId;
  }

  private toView(message: ChatMessageDTOResponse): ChatMessageView {
    return this.view({
      id: message.id,
      role: message.role === 'USER' ? 'user' : 'assistant',
      content: message.content,
      intent: message.intent,
      citations: message.citations ?? [],
      link: message.link,
      linkLabel: message.linkLabel,
      latencyMs: message.latencyMs,
      feedback: message.feedback ?? undefined,
    });
  }

  private view(partial: Partial<ChatMessageView> & Pick<ChatMessageView, 'id' | 'role' | 'content'>): ChatMessageView {
    return { citations: [], suggestions: [], streaming: false, ...partial };
  }

  private errorMessage(text: string): ChatMessageView {
    return this.view({ id: `tmp-${++this.temporaryId}`, role: 'assistant', content: '', error: text });
  }

  private setMessages(key: string, messages: ChatMessageView[]): void {
    this.messagesByConversation.update((all) => ({ ...all, [key]: messages }));
  }

  private appendMessages(key: string, messages: ChatMessageView[]): void {
    this.messagesByConversation.update((all) => ({ ...all, [key]: [...(all[key] ?? []), ...messages] }));
  }

  private updateMessage(key: string, id: string,
                        change: Partial<ChatMessageView> | ((message: ChatMessageView) => Partial<ChatMessageView>)): void {
    this.messagesByConversation.update((all) => {
      const list = all[key];
      if (!list) {
        return all;
      }
      return {
        ...all,
        [key]: list.map((message) => message.id === id
          ? { ...message, ...(typeof change === 'function' ? change(message) : change) }
          : message),
      };
    });
  }

  private findConversationOf(messageId: string): string {
    const all = this.messagesByConversation();
    return Object.keys(all).find((key) => all[key].some((message) => message.id === messageId)) ?? this.activeConversationId();
  }

  private setPending(key: string, pending: boolean): void {
    this.pendingConversations.update((set) => {
      const next = new Set(set);
      if (pending) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  private async errorText(response: Response): Promise<string> {
    try {
      const body = await response.json();
      if (body?.message) {
        return body.message;
      }
    } catch {
      // Not a JSON error body
    }
    return response.status === 401 ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' : 'Không gửi được câu hỏi, vui lòng thử lại.';
  }

  private messageOf(error: any): string {
    return error?.error?.message ?? error?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.';
  }
}
