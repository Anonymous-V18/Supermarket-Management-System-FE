// Internal chatbot: what the signed-in user may ask, conversation history and the knowledge base

export interface ChatToolDTOResponse {
  name: string;
  description: string;
  examples: string[];
}

export interface ChatCapabilitiesDTOResponse {
  roleCodes: string[];
  // Live-data questions this user may ask; anything else is refused by the server
  tools: ChatToolDTOResponse[];
  suggestions: string[];
  canManageKnowledge: boolean;
  // false: answers are quoted from the documents / built from the data, no LLM involved
  llmEnabled: boolean;
}

export interface ChatConversationDTOResponse {
  id: string;
  title: string;
  createdDate: string;
  modifiedDate: string;
}

export interface ChatCitationDTOResponse {
  // [n] in the answer text
  index: number;
  chunkId: string;
  documentTitle: string;
  headingPath?: string;
  snippet: string;
}

export interface ChatMessageDTOResponse {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  intent?: string;
  citations?: ChatCitationDTOResponse[];
  // Screen showing the same data (answers to data questions)
  link?: string;
  linkLabel?: string;
  latencyMs?: number;
  feedback?: number;
  createdDate: string;
}

export interface KbDocumentDTOResponse {
  id: string;
  title: string;
  sourceType: 'MD' | 'TXT' | 'PDF' | 'HTML';
  sourceName?: string;
  chunkCount: number;
  indexStatus: 'PENDING' | 'INDEXED' | 'FAILED';
  indexError?: string;
  roleCodes: string[];
  createdBy?: string;
  createdDate: string;
  modifiedDate?: string;
}
