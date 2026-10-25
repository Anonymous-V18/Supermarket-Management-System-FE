import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../dtos/response/api-response/api-response.dto';
import { KbDocumentDTOResponse } from '../dtos/response/chatbot/chatbot.dto';
import { ApiUrl } from '../environments/api-url';

// Chatbot knowledge base (admin): documents and the roles allowed to read them
@Injectable({
  providedIn: 'root',
})
export class KnowledgeBaseService {
  private httpClient = inject(HttpClient);

  showAll(): Observable<ApiResponse<KbDocumentDTOResponse[]>> {
    return this.httpClient.get<ApiResponse<KbDocumentDTOResponse[]>>(ApiUrl.knowledgeDocument.showAll);
  }

  insert(file: File, title: string, roleCodes: string[]): Observable<ApiResponse<KbDocumentDTOResponse>> {
    const form = new FormData();
    form.append('file', file);
    if (title.trim()) {
      form.append('title', title.trim());
    }
    roleCodes.forEach((role) => form.append('roleCodes', role));
    return this.httpClient.post<ApiResponse<KbDocumentDTOResponse>>(ApiUrl.knowledgeDocument.insert, form);
  }

  update(id: string, title: string, roleCodes: string[]): Observable<ApiResponse<KbDocumentDTOResponse>> {
    return this.httpClient.put<ApiResponse<KbDocumentDTOResponse>>(`${ApiUrl.knowledgeDocument.update}/${id}`, { title, roleCodes });
  }

  replaceContent(id: string, file: File): Observable<ApiResponse<KbDocumentDTOResponse>> {
    const form = new FormData();
    form.append('file', file);
    return this.httpClient.put<ApiResponse<KbDocumentDTOResponse>>(`${ApiUrl.knowledgeDocument.update}/${id}/content`, form);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(`${ApiUrl.knowledgeDocument.delete}/${id}`);
  }

  reindex(id: string): Observable<ApiResponse<KbDocumentDTOResponse>> {
    return this.httpClient.post<ApiResponse<KbDocumentDTOResponse>>(`${ApiUrl.knowledgeDocument.reindex}/${id}`, {});
  }

  reindexAll(): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(ApiUrl.knowledgeDocument.reindexAll, {});
  }
}
