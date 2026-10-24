import { Injectable, computed, signal } from '@angular/core';

export type KnowledgeScope = 'all' | 'inventory_db' | 'sop_docs' | 'sales_reports';
export type ResponseMode = 'strict' | 'balanced' | 'detailed';

export interface RagCitation {
  id: string;
  sourceTitle: string;
  sourceType: 'document' | 'database' | 'policy';
  chunkIndex: string;
  similarityScore: number; // 0 to 1
  snippet: string;
  metadata: string;
}

export interface RagRetrievalMetrics {
  latencyMs: number;
  chunksScanned: number;
  topKUsed: number;
  knowledgeScopeLabel: string;
}

export interface RagMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: RagCitation[];
  retrievalMetrics?: RagRetrievalMetrics;
  feedback?: 'up' | 'down' | null;
}

export interface RagConversation {
  id: string;
  title: string;
  updatedAt: Date;
  category: 'inventory' | 'policy' | 'sales' | 'general';
  messages: RagMessage[];
}

export interface RagConfig {
  knowledgeScope: KnowledgeScope;
  topK: number;
  similarityThreshold: number; // 0.50 to 0.95
  responseMode: ResponseMode;
  rerankerEnabled: boolean;
}

export interface RagKnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'csv' | 'db_sync';
  category: string;
  sizeOrRecords: string;
  chunkCount: number;
  vectorStatus: 'indexed' | 'indexing' | 'error';
  lastUpdated: Date;
  description: string;
  sampleChunk: string;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
  category: string;
  icon: string;
  scope: KnowledgeScope;
}

@Injectable({
  providedIn: 'root',
})
export class RagChatbotService {
  // Widget state
  readonly widgetOpen = signal<boolean>(false);
  readonly isRetrieving = signal<boolean>(false);
  readonly retrievalStage = signal<string>('');

  // Currently inspected citation on the full page
  readonly selectedCitation = signal<RagCitation | null>(null);

  // RAG Configuration state
  readonly config = signal<RagConfig>({
    knowledgeScope: 'all',
    topK: 4,
    similarityThreshold: 0.75,
    responseMode: 'strict',
    rerankerEnabled: true,
  });

  // Suggested prompts for Supermarket operations
  readonly suggestedPrompts: SuggestedPrompt[] = [
    {
      id: 'sp-1',
      label: 'Tồn kho thấp & sắp hết hạn',
      prompt: 'Kiểm tra các mặt hàng có tồn kho dưới định mức hoặc lô hàng sắp hết hạn trong 15 ngày tới tại Kho Trung Tâm.',
      category: 'Kho & Sản phẩm',
      icon: 'bi-box-seam',
      scope: 'inventory_db',
    },
    {
      id: 'sp-2',
      label: 'Quy trình đổi trả hàng tươi sống',
      prompt: 'Cho tôi biết quy định và điều kiện đổi trả đối với nhóm hàng thực phẩm tươi sống khi khách phản ánh chất lượng.',
      category: 'Quy trình nội bộ',
      icon: 'bi-arrow-repeat',
      scope: 'sop_docs',
    },
    {
      id: 'sp-3',
      label: 'Xử lý chênh lệch kiểm kê kho',
      prompt: 'Khi kiểm kê kho phát hiện chênh lệch âm giữa thực tế và hệ thống thì thủ kho cần lập biên bản và xử lý thế nào?',
      category: 'Quy trình nội bộ',
      icon: 'bi-clipboard-check',
      scope: 'sop_docs',
    },
    {
      id: 'sp-4',
      label: 'Tổng hợp doanh thu & Khuyến mãi ca',
      prompt: 'Tóm tắt hiệu quả các chương trình khuyến mãi đang áp dụng và nhóm ngành hàng bán chạy nhất tuần này.',
      category: 'Bán hàng & Báo cáo',
      icon: 'bi-graph-up-arrow',
      scope: 'sales_reports',
    },
  ];

  // Knowledge Base sources (Documents + Live DB Connectors)
  readonly knowledgeSources = signal<RagKnowledgeSource[]>([
    {
      id: 'kb-db-1',
      name: 'DB: Sản phẩm, Lô hàng & Tồn kho (Live)',
      type: 'db_sync',
      category: 'Cơ sở dữ liệu',
      sizeOrRecords: '1,420 bản ghi',
      chunkCount: 485,
      vectorStatus: 'indexed',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 15),
      description: 'Đồng bộ tự động từ bảng Products, Warehouses, StockIn/StockOut và hạn sử dụng lô hàng.',
      sampleChunk: '[Product ID: SP-00182] Sữa tươi tiệt trùng Vinamilk 100% Ít Đường (Thùng 48 bịch) · Tồn kho Kho Chính: 14 thùng (Định mức tối thiểu: 25 thùng) · Lô LOT-2609 hạn dùng 05/11/2026.',
    },
    {
      id: 'kb-db-2',
      name: 'DB: Hóa đơn, Trả hàng & Doanh thu ca',
      type: 'db_sync',
      category: 'Cơ sở dữ liệu',
      sizeOrRecords: '8,950 bản ghi',
      chunkCount: 620,
      vectorStatus: 'indexed',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30),
      description: 'Tổng hợp hóa đơn bán hàng, phiếu trả hàng (Sales Return) và báo cáo doanh thu theo ca.',
      sampleChunk: '[Báo cáo Tuần 42/2026] Nhóm Hàng tiêu dùng nhanh (FMCG) và Sữa các loại chiếm 46.8% tổng doanh thu. Tỷ lệ hoàn trả hàng (Sales Return) giảm còn 0.82%.',
    },
    {
      id: 'kb-doc-1',
      name: 'Quy_trinh_doi_tra_va_hoan_tien_2026.pdf',
      type: 'pdf',
      category: 'Quy trình vận hành (SOP)',
      sizeOrRecords: '2.4 MB · 18 trang',
      chunkCount: 64,
      vectorStatus: 'indexed',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      description: 'Quy định chi tiết về điều kiện đổi trả hàng hóa, thời hạn áp dụng cho từng ngành hàng và phân quyền duyệt phiếu trả.',
      sampleChunk: 'Điều 4.2 - Hàng thực phẩm tươi sống & Đông lạnh: Khách hàng được quyền đổi trả trong vòng 24 giờ kể từ thời điểm xuất hóa đơn nếu có dấu hiệu hư hỏng do bảo quản. Thu ngân kiểm tra hóa đơn gốc và lập phiếu Sales Return kèm ảnh chụp.',
    },
    {
      id: 'kb-doc-2',
      name: 'So_tay_kiem_ke_va_chuyen_kho_noi_bo.docx',
      type: 'docx',
      category: 'Quy trình kho',
      sizeOrRecords: '1.8 MB · 24 trang',
      chunkCount: 82,
      vectorStatus: 'indexed',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      description: 'Hướng dẫn quy trình kiểm kê định kỳ, xử lý hàng cận date (FEFO) và quy định điều chuyển giữa các kho.',
      sampleChunk: 'Mục 3.1 - Xử lý chênh lệch kiểm kê: Khi phát hiện chênh lệch vượt quá ±2% hoặc giá trị trên 500.000₫, Thủ kho phải giữ phiếu ở trạng thái Nháp, kiểm đếm lại lần 2 và đính kèm giải trình trước khi Quản lý phê duyệt.',
    },
    {
      id: 'kb-doc-3',
      name: 'Danh_muc_dinh_muc_ton_kho_Q4_2026.csv',
      type: 'csv',
      category: 'Định mức hàng hóa',
      sizeOrRecords: '640 KB · 850 dòng',
      chunkCount: 115,
      vectorStatus: 'indexed',
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12),
      description: 'Bảng định mức tồn tối thiểu (Min Stock), tồn tối đa (Max Stock) và chu kỳ đặt hàng theo nhà cung cấp.',
      sampleChunk: 'Ngành hàng: Đồ uống & Sữa | Mã SP: SP-00182 | Min Stock: 25 thùng | Max Stock: 120 thùng | Nhà cung cấp chính: Công ty CP Sữa Việt Nam | Thời gian giao hàng (Lead time): 24h.',
    },
  ]);

  // Initial conversations with rich RAG examples
  readonly conversations = signal<RagConversation[]>([
    {
      id: 'conv-1',
      title: 'Tra cứu tồn kho thấp & quy định đổi trả',
      updatedAt: new Date(Date.now() - 1000 * 60 * 10),
      category: 'inventory',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Kiểm tra giúp tôi các mặt hàng đang dưới định mức tồn kho tại Kho Chính và hướng dẫn xử lý lô hàng cận hạn.',
          timestamp: new Date(Date.now() - 1000 * 60 * 12),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content:
            'Dựa trên dữ liệu đồng bộ từ **Kho Chính** và **Sổ tay vận hành kho**, hiện có **3 mặt hàng** đang dưới định mức tồn tối thiểu hoặc có lô cận hạn cần ưu tiên xử lý:\n\n' +
            '1. **Sữa tươi tiệt trùng Vinamilk 100% Ít Đường (SP-00182)**: Tồn hiện tại **14 thùng** (Định mức tối thiểu: 25 thùng). Ngoài ra có lô `LOT-2609` (6 thùng) sẽ hết hạn vào **05/11/2026**.\n' +
            '2. **Dầu ăn Neptune Light 2L (SP-00094)**: Tồn hiện tại **8 thùng** (Định mức tối thiểu: 20 thùng) — khuyến nghị tạo phiếu nhập từ NCC thực phẩm Á Châu.\n' +
            '3. **Mì Hảo Hảo Tôm Chua Cay thùng 30 gói (SP-00041)**: Tồn hiện tại **19 thùng** (Định mức tối thiểu: 35 thùng).\n\n' +
            '**Hướng dẫn xử lý lô cận hạn (FEFO):** Theo quy định tại *Sổ tay kiểm kê & chuyển kho*, các lô còn hạn dưới 15 ngày cần được xuất chuyển lên quầy khuyến mãi cận date hoặc thông báo bộ phận Bán hàng áp dụng giảm giá 20%–30%.',
          timestamp: new Date(Date.now() - 1000 * 60 * 11),
          retrievalMetrics: {
            latencyMs: 380,
            chunksScanned: 1366,
            topKUsed: 3,
            knowledgeScopeLabel: 'Tất cả nguồn tri thức',
          },
          feedback: 'up',
          citations: [
            {
              id: 'cit-1',
              sourceTitle: 'DB: Sản phẩm, Lô hàng & Tồn kho (Live)',
              sourceType: 'database',
              chunkIndex: 'Bản ghi #SP-00182 · Kho Chính',
              similarityScore: 0.94,
              snippet:
                '[Product ID: SP-00182] Sữa tươi tiệt trùng Vinamilk 100% Ít Đường (Thùng 48 bịch) · Tồn kho Kho Chính: 14 thùng (Định mức tối thiểu: 25 thùng) · Lô LOT-2609 (6 thùng) hạn dùng 05/11/2026.',
              metadata: 'Đồng bộ lúc 09:35 · Bảng: warehouse_stock, product_lots',
            },
            {
              id: 'cit-2',
              sourceTitle: 'Danh_muc_dinh_muc_ton_kho_Q4_2026.csv',
              sourceType: 'document',
              chunkIndex: 'Chunk #18 · Dòng 142-160',
              similarityScore: 0.89,
              snippet:
                'SP-00182 (Min: 25, Max: 120) | SP-00094 Dầu ăn Neptune Light 2L (Min: 20, Max: 80) | SP-00041 Mì Hảo Hảo 30 gói (Min: 35, Max: 150). Tự động cảnh báo khi tồn khả dụng < Min Stock.',
              metadata: 'Tài liệu CSV · Cập nhật Quý 4/2026',
            },
            {
              id: 'cit-3',
              sourceTitle: 'So_tay_kiem_ke_va_chuyen_kho_noi_bo.docx',
              sourceType: 'policy',
              chunkIndex: 'Chunk #42 · Trang 14',
              similarityScore: 0.86,
              snippet:
                'Mục 5.3 - Quản lý hàng cận hạn theo nguyên tắc FEFO (First Expired, First Out): Hàng hóa có thời hạn sử dụng còn dưới 15 ngày đối với hàng tiêu dùng nhanh phải được tách khu vực hoặc điều chuyển sang quầy bán hàng giảm giá.',
              metadata: 'SOP Kho vận · Phiên bản 2.1',
            },
          ],
        },
      ],
    },
    {
      id: 'conv-2',
      title: 'Quy định duyệt phiếu trả hàng (Sales Return)',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      category: 'policy',
      messages: [
        {
          id: 'msg-201',
          role: 'user',
          content: 'Khách mua thực phẩm tươi sống muốn đổi trả sau 10 tiếng vì bị hỏng thì thu ngân cần làm những bước nào trên hệ thống?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
        {
          id: 'msg-202',
          role: 'assistant',
          content:
            'Theo **Quy trình đổi trả và hoàn tiền 2026 (Điều 4.2)**, khách hàng phản ánh thực phẩm tươi sống trong vòng **24 giờ** kể từ lúc xuất hóa đơn hoàn toàn đủ điều kiện đổi trả.\n\n' +
            '**Các bước thực hiện trên hệ thống:**\n' +
            '1. Truy cập menu **Trả hàng (`/home/sales-return/create`)** và nhập mã Hóa đơn gốc của khách.\n' +
            '2. Chọn mặt hàng tươi sống cần trả, nhập số lượng và ghi rõ lý do: *"Lỗi chất lượng / Bảo quản trong hạn 24h"*.\n' +
            '3. Đối với hàng tươi sống hư hỏng, khi phiếu trả được **Duyệt**, hệ thống sẽ ghi nhận hoàn tiền cho khách và chuyển trạng thái hàng về kho hủy/chờ xử lý NCC thay vì cộng lại vào tồn kho bán bình thường.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          retrievalMetrics: {
            latencyMs: 310,
            chunksScanned: 64,
            topKUsed: 2,
            knowledgeScopeLabel: 'Tài liệu Quy trình (SOP)',
          },
          citations: [
            {
              id: 'cit-201',
              sourceTitle: 'Quy_trinh_doi_tra_va_hoan_tien_2026.pdf',
              sourceType: 'policy',
              chunkIndex: 'Chunk #14 · Trang 5',
              similarityScore: 0.96,
              snippet:
                'Điều 4.2 - Hàng thực phẩm tươi sống & Đông lạnh: Khách hàng được quyền đổi trả trong vòng 24 giờ kể từ thời điểm xuất hóa đơn nếu có dấu hiệu hư hỏng. Thu ngân đối chiếu hóa đơn gốc và lập phiếu Trả hàng (Sales Return).',
              metadata: 'Chính sách CSKH & Thu ngân · Trang 5/18',
            },
          ],
        },
      ],
    },
  ]);

  readonly activeConversationId = signal<string>('conv-1');

  readonly activeConversation = computed<RagConversation>(() => {
    const id = this.activeConversationId();
    const list = this.conversations();
    return list.find((c) => c.id === id) ?? list[0];
  });

  readonly totalChunksCount = computed(() =>
    this.knowledgeSources().reduce((acc, item) => acc + item.chunkCount, 0)
  );

  constructor() {
    // Set initial selected citation from first conversation
    const firstMsgWithCit = this.conversations()[0]?.messages.find(
      (m) => m.citations && m.citations.length > 0
    );
    if (firstMsgWithCit?.citations?.[0]) {
      this.selectedCitation.set(firstMsgWithCit.citations[0]);
    }
  }

  toggleWidget(): void {
    this.widgetOpen.update((v) => !v);
  }

  openWidget(): void {
    this.widgetOpen.set(true);
  }

  closeWidget(): void {
    this.widgetOpen.set(false);
  }

  selectConversation(id: string): void {
    this.activeConversationId.set(id);
    const conv = this.conversations().find((c) => c.id === id);
    const lastCit = conv?.messages
      .slice()
      .reverse()
      .find((m) => m.citations?.length)?.citations?.[0];
    if (lastCit) {
      this.selectedCitation.set(lastCit);
    }
  }

  createNewConversation(): void {
    const newId = 'conv-' + Date.now();
    const newConv: RagConversation = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      updatedAt: new Date(),
      category: 'general',
      messages: [],
    };
    this.conversations.update((list) => [newConv, ...list]);
    this.activeConversationId.set(newId);
  }

  deleteConversation(id: string): void {
    this.conversations.update((list) => {
      const filtered = list.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fallback: RagConversation = {
          id: 'conv-' + Date.now(),
          title: 'Cuộc trò chuyện mới',
          updatedAt: new Date(),
          category: 'general',
          messages: [],
        };
        return [fallback];
      }
      return filtered;
    });
    if (this.activeConversationId() === id) {
      this.activeConversationId.set(this.conversations()[0].id);
    }
  }

  updateConfig(partial: Partial<RagConfig>): void {
    this.config.update((curr) => ({ ...curr, ...partial }));
  }

  setMessageFeedback(messageId: string, vote: 'up' | 'down'): void {
    const convId = this.activeConversationId();
    this.conversations.update((list) =>
      list.map((conv) => {
        if (conv.id !== convId) return conv;
        return {
          ...conv,
          messages: conv.messages.map((m) =>
            m.id === messageId
              ? { ...m, feedback: m.feedback === vote ? null : vote }
              : m
          ),
        };
      })
    );
  }

  sendMessage(rawQuestion: string): void {
    const question = rawQuestion.trim();
    if (!question || this.isRetrieving()) return;

    const convId = this.activeConversationId();
    const userMsg: RagMessage = {
      id: 'msg-u-' + Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    // Append user message and update conversation title if it was empty
    this.conversations.update((list) =>
      list.map((conv) => {
        if (conv.id !== convId) return conv;
        const isFirst = conv.messages.length === 0;
        const shortTitle =
          question.length > 42 ? question.slice(0, 42) + '...' : question;
        return {
          ...conv,
          title: isFirst ? shortTitle : conv.title,
          updatedAt: new Date(),
          messages: [...conv.messages, userMsg],
        };
      })
    );

    // Simulate RAG pipeline stages
    this.isRetrieving.set(true);
    this.retrievalStage.set('Đang tạo embedding câu hỏi & truy vấn Vector DB...');

    setTimeout(() => {
      if (this.isRetrieving()) {
        this.retrievalStage.set(
          `Đang lọc Top-${this.config().topK} chunks (Ngưỡng ≥ ${Math.round(
            this.config().similarityThreshold * 100
          )}%) & tổng hợp câu trả lời...`
        );
      }
    }, 550);

    setTimeout(() => {
      const responseMsg = this.buildSimulatedRagResponse(question);
      this.conversations.update((list) =>
        list.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                updatedAt: new Date(),
                messages: [...conv.messages, responseMsg],
              }
            : conv
        )
      );
      if (responseMsg.citations?.[0]) {
        this.selectedCitation.set(responseMsg.citations[0]);
      }
      this.isRetrieving.set(false);
      this.retrievalStage.set('');
    }, 1150);
  }

  syncKnowledgeSource(sourceId: string): void {
    this.knowledgeSources.update((list) =>
      list.map((item) =>
        item.id === sourceId ? { ...item, vectorStatus: 'indexing' } : item
      )
    );
    setTimeout(() => {
      this.knowledgeSources.update((list) =>
        list.map((item) =>
          item.id === sourceId
            ? {
                ...item,
                vectorStatus: 'indexed',
                lastUpdated: new Date(),
                chunkCount: item.chunkCount + Math.floor(Math.random() * 5),
              }
            : item
        )
      );
    }, 900);
  }

  addUploadedDocument(fileName: string, category: string, fileSizeLabel: string): void {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const docType: 'pdf' | 'docx' | 'csv' =
      ext === 'csv' ? 'csv' : ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf';

    const newId = 'kb-doc-' + Date.now();
    const newDoc: RagKnowledgeSource = {
      id: newId,
      name: fileName,
      type: docType,
      category: category || 'Tài liệu nội bộ',
      sizeOrRecords: fileSizeLabel,
      chunkCount: 0,
      vectorStatus: 'indexing',
      lastUpdated: new Date(),
      description: 'Tài liệu vừa được tải lên, hệ thống đang tách đoạn (chunking) và sinh vector embedding.',
      sampleChunk: `Đoạn trích mẫu từ tài liệu "${fileName}" sau khi được tách chunk (Chunk size: 512 tokens, Overlap: 64 tokens).`,
    };

    this.knowledgeSources.update((list) => [newDoc, ...list]);

    setTimeout(() => {
      this.knowledgeSources.update((list) =>
        list.map((item) =>
          item.id === newId
            ? {
                ...item,
                vectorStatus: 'indexed',
                chunkCount: Math.floor(Math.random() * 45) + 18,
                description: 'Đã tách chunk và lập chỉ mục Vector DB thành công, sẵn sàng phục vụ truy vấn RAG.',
              }
            : item
        )
      );
    }, 1200);
  }

  removeKnowledgeSource(sourceId: string): void {
    this.knowledgeSources.update((list) => list.filter((s) => s.id !== sourceId));
  }

  getScopeLabel(scope: KnowledgeScope): string {
    switch (scope) {
      case 'inventory_db':
        return 'Dữ liệu Sản phẩm & Kho';
      case 'sop_docs':
        return 'Tài liệu Quy trình (SOP)';
      case 'sales_reports':
        return 'Hóa đơn & Báo cáo';
      default:
        return 'Tất cả nguồn tri thức';
    }
  }

  private buildSimulatedRagResponse(question: string): RagMessage {
    const q = question.toLowerCase();
    const cfg = this.config();

    if (q.includes('đổi trả') || q.includes('trả hàng') || q.includes('tươi sống') || q.includes('hoàn tiền')) {
      return {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        timestamp: new Date(),
        content:
          'Theo **Quy trình đổi trả và hoàn tiền 2026**, quy định áp dụng như sau:\n\n' +
          '- **Thực phẩm tươi sống & Đông lạnh**: Hỗ trợ đổi trả trong vòng **24 giờ** kể từ thời điểm mua hàng nếu có lỗi chất lượng hoặc bảo quản.\n' +
          '- **Hàng khô & Hóa mỹ phẩm**: Hỗ trợ đổi trả trong vòng **7 ngày** với điều kiện còn nguyên tem nhãn, chưa qua sử dụng và có hóa đơn gốc.\n' +
          '- **Thao tác trên hệ thống**: Thu ngân vào mục **Trả hàng (`/home/sales-return`)**, chọn hóa đơn gốc và lập phiếu trả. Với đơn hoàn tiền trên 1.000.000₫ cần tài khoản Quản lý (`ADMIN`) phê duyệt.',
        retrievalMetrics: {
          latencyMs: 340,
          chunksScanned: this.totalChunksCount(),
          topKUsed: cfg.topK,
          knowledgeScopeLabel: this.getScopeLabel(cfg.knowledgeScope),
        },
        citations: [
          {
            id: 'cit-' + Date.now() + '-1',
            sourceTitle: 'Quy_trinh_doi_tra_va_hoan_tien_2026.pdf',
            sourceType: 'policy',
            chunkIndex: 'Chunk #14 · Trang 5',
            similarityScore: 0.95,
            snippet:
              'Điều 4.2 - Hàng thực phẩm tươi sống & Đông lạnh: Đổi trả trong vòng 24 giờ kể từ thời điểm xuất hóa đơn. Điều 4.3 - Hàng tiêu dùng đóng gói: Đổi trả trong 7 ngày khi nguyên bao bì.',
            metadata: 'Tài liệu PDF · Ban hành 01/2026',
          },
          {
            id: 'cit-' + Date.now() + '-2',
            sourceTitle: 'DB: Hóa đơn, Trả hàng & Doanh thu ca',
            sourceType: 'database',
            chunkIndex: 'Quy tắc nghiệp vụ SalesReturn',
            similarityScore: 0.87,
            snippet:
              'Phiếu trả hàng (SalesReturn) liên kết trực tiếp với Invoice ID gốc. Khi trạng thái chuyển sang APPROVED, hệ thống tự động ghi nhận nhật ký Audit Log và cập nhật tồn kho.',
            metadata: 'Schema nghiệp vụ · Bảng sales_returns',
          },
        ],
      };
    }

    if (q.includes('kiểm kê') || q.includes('chênh lệch') || q.includes('lệch tồn')) {
      return {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        timestamp: new Date(),
        content:
          'Dựa trên **Sổ tay kiểm kê và chuyển kho nội bộ**, quy trình xử lý khi phát hiện chênh lệch kiểm kê gồm 3 bước:\n\n' +
          '1. **Giữ phiếu ở trạng thái Nháp**: Tại màn hình **Kiểm kê (`/home/stock-take`)**, thủ kho nhập số lượng thực tế đếm được. Hệ thống tự động tính cột *Chênh lệch*.\n' +
          '2. **Kiểm đếm chéo (nếu lệch > ±2% hoặc > 500.000₫)**: Thủ kho phối hợp với nhân viên ca kiểm đếm lại vị trí kệ và đối chiếu các phiếu Xuất/Nhập chưa hoàn tất trong ca.\n' +
          '3. **Ghi chú nguyên nhân & Phê duyệt**: Ghi rõ nguyên nhân (hư hỏng, thất thoát, nhập sai đơn vị tính) vào phần ghi chú phiếu trước khi bấm **Hoàn tất** để cân bằng tồn kho.',
        retrievalMetrics: {
          latencyMs: 395,
          chunksScanned: this.totalChunksCount(),
          topKUsed: cfg.topK,
          knowledgeScopeLabel: this.getScopeLabel(cfg.knowledgeScope),
        },
        citations: [
          {
            id: 'cit-' + Date.now() + '-1',
            sourceTitle: 'So_tay_kiem_ke_va_chuyen_kho_noi_bo.docx',
            sourceType: 'policy',
            chunkIndex: 'Chunk #27 · Trang 9',
            similarityScore: 0.93,
            snippet:
              'Mục 3.1 - Xử lý chênh lệch kiểm kê: Khi phát hiện chênh lệch vượt quá ±2% hoặc giá trị trên 500.000₫, Thủ kho phải giữ phiếu ở trạng thái Nháp, kiểm đếm lại lần 2 và đính kèm giải trình.',
            metadata: 'SOP Kho vận · Trang 9/24',
          },
        ],
      };
    }

    if (q.includes('doanh thu') || q.includes('khuyến mãi') || q.includes('bán chạy') || q.includes('báo cáo')) {
      return {
        id: 'msg-a-' + Date.now(),
        role: 'assistant',
        timestamp: new Date(),
        content:
          'Theo dữ liệu tổng hợp từ **DB Hóa đơn & Báo cáo doanh thu**, kết quả kinh doanh nổi bật hiện tại:\n\n' +
          '- **Nhóm ngành hàng chủ lực**: Hàng tiêu dùng nhanh (FMCG) và Sữa tươi đóng góp **46.8%** doanh thu toàn cửa hàng.\n' +
          '- **Chương trình khuyến mãi**: Các mã voucher giảm trực tiếp trên hóa đơn từ 300.000₫ giúp tăng giá trị trung bình mỗi giỏ hàng thêm **18.4%**.\n' +
          '- **Tỷ lệ hoàn trả hàng**: Duy trì ở mức thấp (**0.82%** tổng số hóa đơn), chủ yếu phát sinh ở nhóm hàng đổi size/nhầm mã.',
        retrievalMetrics: {
          latencyMs: 360,
          chunksScanned: this.totalChunksCount(),
          topKUsed: cfg.topK,
          knowledgeScopeLabel: this.getScopeLabel(cfg.knowledgeScope),
        },
        citations: [
          {
            id: 'cit-' + Date.now() + '-1',
            sourceTitle: 'DB: Hóa đơn, Trả hàng & Doanh thu ca',
            sourceType: 'database',
            chunkIndex: 'Tổng hợp Tuần 42/2026',
            similarityScore: 0.92,
            snippet:
              '[Báo cáo Tuần 42/2026] Nhóm Hàng tiêu dùng nhanh (FMCG) và Sữa các loại chiếm 46.8% tổng doanh thu. Giá trị trung bình giỏ hàng tăng 18.4% nhờ khuyến mãi hóa đơn.',
            metadata: 'Dữ liệu trực tiếp · Bảng invoices, promotions',
          },
        ],
      };
    }

    // Default comprehensive RAG response for any custom question
    return {
      id: 'msg-a-' + Date.now(),
      role: 'assistant',
      timestamp: new Date(),
      content:
        `Tôi đã truy xuất dữ liệu liên quan đến yêu cầu **"${question}"** từ kho tri thức siêu thị (Chế độ: *${
          cfg.responseMode === 'strict'
            ? 'Chính xác theo tài liệu'
            : cfg.responseMode === 'balanced'
            ? 'Cân bằng'
            : 'Phân tích chi tiết'
        }*):\n\n` +
        '- **Dữ liệu Tồn kho & Sản phẩm**: Các chỉ số tồn kho, lô hàng và hạn sử dụng đang được đồng bộ từ Kho Chính (`1,420 bản ghi`). Những mặt hàng dưới ngưỡng `Min Stock` đã được đánh dấu ưu tiên nhập bổ sung.\n' +
        '- **Quy trình vận hành (SOP)**: Mọi nghiệp vụ nhập/xuất/chuyển kho và đổi trả hóa đơn đều tuân thủ phân quyền theo vai trò (`ADMIN`, `STOREKEEPER`, `SALESMAN`, `ACCOUNTING_STAFF`).\n\n' +
        'Bạn có thể bấm vào **các thẻ Nguồn trích dẫn bên dưới** để kiểm tra đoạn văn bản gốc (chunk) và điểm tương đồng (similarity score).',
      retrievalMetrics: {
        latencyMs: 410,
        chunksScanned: this.totalChunksCount(),
        topKUsed: cfg.topK,
        knowledgeScopeLabel: this.getScopeLabel(cfg.knowledgeScope),
      },
      citations: [
        {
          id: 'cit-' + Date.now() + '-1',
          sourceTitle: 'DB: Sản phẩm, Lô hàng & Tồn kho (Live)',
          sourceType: 'database',
          chunkIndex: 'Chunk #08 · Tổng hợp Kho Chính',
          similarityScore: 0.88,
          snippet:
            'Hệ thống quản lý tồn kho theo lô (Lot) và hạn sử dụng. Cảnh báo tự động kích hoạt khi số lượng tồn khả dụng thấp hơn ngưỡng định mức tối thiểu (Min Stock) cấu hình theo từng quý.',
          metadata: 'Đồng bộ tự động · Vector Index v2',
        },
        {
          id: 'cit-' + Date.now() + '-2',
          sourceTitle: 'So_tay_kiem_ke_va_chuyen_kho_noi_bo.docx',
          sourceType: 'document',
          chunkIndex: 'Chunk #04 · Trang 2',
          similarityScore: 0.82,
          snippet:
            'Quy định phân quyền vận hành: Thủ kho chịu trách nhiệm lập phiếu Nhập, Xuất, Chuyển kho và Kiểm kê định kỳ; Thu ngân thực hiện lập Hóa đơn bán hàng và tiếp nhận yêu cầu Trả hàng.',
          metadata: 'Tài liệu nội bộ · DOCX',
        },
      ],
    };
  }
}
