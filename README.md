# 🛒 Supermarket Management System - Frontend Portal

> **Giao diện Người dùng Hiện đại & Trợ lý ảo RAG Tương tác Thời gian thực**  
> Dự án Chuyên ngành Kỹ thuật Phần mềm (CNPMTT) – ThS CNTT.

[![Angular](https://img.shields.io/badge/Angular-22.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

---

## 📑 Mục lục
1. [Giới thiệu](#-giới-thiệu)
2. [Công nghệ & Thư viện (Tech Stack)](#-công-nghệ--thư-viện-tech-stack)
3. [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
4. [Các tính năng giao diện nổi bật](#-các-tính-năng-giao-diện-nổi-bật)
5. [Trợ lý ảo AI & Cơ chế Server-Sent Events (SSE)](#-trợ-lý-ảo-ai--cơ-chế-server-sent-events-sse)
6. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
7. [Build & Server-Side Rendering (SSR)](#-build--server-side-rendering-ssr)

---

## 📖 Giới thiệu

`Supermarket-Management-System-FE` là giao diện Web Single Page Application (SPA) kiêm Server-Side Rendering (SSR) được xây dựng trên nền tảng **Angular 18+ / 19**, cung cấp trải nghiệm quản lý siêu thị trực quan, mượt mà và bảo mật cao.

Giao diện áp dụng kiến trúc **Angular Signals**, **Standalone Components**, tối ưu hóa phản ứng dữ liệu (Reactivity) và loại bỏ hoàn toàn các overhead thừa, đem lại hiệu năng phản hồi tức thì cho thu ngân và nhân viên quản lý.

---

## 🛠 Công nghệ & Thư viện (Tech Stack)

| Thư viện | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| **Angular** | 22.x / 18.2 Core | Nền tảng SPA + SSR với Signals & Standalone Components |
| **TypeScript** | 6.x | Ngôn ngữ phát triển Type-safe chặt chẽ |
| **Bootstrap & Icons**| 5.3.3 / Icons | Hệ thống lưới responsive và biểu tượng giao diện |
| **RxJS** | ~7.8.0 | Xử lý bất đồng bộ, luồng sự kiện phản ứng |
| **ngx-toastr** | 20.x | Thông báo popup trực quan (Thành công, Lỗi, Cảnh báo) |
| **@ng-select** | 24.x | Ô chọn tìm kiếm nâng cao đa trường |
| **JWT Decode** | 4.0 | Giải mã và kiểm tra hạn ngạch token phía client |
| **Express / SSR** | 4.18 | Render phía máy chủ (Server-Side Rendering) chuẩn SEO |

---

## 📂 Cấu trúc thư mục dự án

```text
src/app/
├── components/
│   ├── account/              # Quản lý thông tin tài khoản người dùng
│   ├── audit-log/            # Xem nhật ký kiểm toán hệ thống
│   ├── chatbot-thread/       # Khung hội thoại chat, render Markdown, citations
│   ├── chatbot-widget/       # Nút chat nổi (Floating Widget) mở ở mọi trang
│   ├── checklist-item/       # Quản lý danh mục công việc trong ca
│   ├── dashboard/            # Tổng quan doanh thu, cảnh báo kho, ca làm việc
│   ├── employee/             # Quản lý danh sách và hồ sơ nhân viên
│   ├── header/ & sidebar/    # Thanh điều hướng, thông tin tài khoản, menu
│   ├── home/
│   │   ├── chatbot/          # Màn hình quản lý Chatbot & Quản trị Knowledge Base
│   │   ├── invoice/          # Màn hình lập hóa đơn bán hàng (POS)
│   │   ├── product/          # Quản lý danh mục sản phẩm, mã vạch, giá niêm yết
│   │   ├── promotion/        # Quản lý mã giảm giá và chương trình khuyến mãi
│   │   ├── report/           # Báo cáo doanh thu, tồn kho, hạn sử dụng
│   │   ├── sales-return/     # Quản lý đổi trả hàng và hoàn tiền
│   │   ├── stock-take/       # Lập phiếu kiểm kê kho định kỳ
│   │   ├── stock-transfer/   # Quản lý phiếu điều chuyển kho nội bộ
│   │   ├── stockin/          # Quản lý phiếu nhập kho từ nhà cung cấp
│   │   ├── stockout/         # Quản lý phiếu xuất kho
│   │   ├── supplier/         # Quản lý thông tin và công nợ nhà cung cấp
│   │   └── warehouse/        # Quản lý thông tin chuỗi kho hàng
│   └── login/                # Màn hình đăng nhập xác thực JWT
├── dtos/                     # Data Transfer Objects & Interfaces khớp với Backend
├── environments/             # Cấu hình API endpoint (ApiUrl)
├── guard/                    # AuthGuard & RoleGuard kiểm soát truy cập
├── interceptors/             # AuthInterceptor gắn Token Bearer & bắt lỗi 401/403
├── services/                 # Service nghiệp vụ & RagChatbotService
└── utils/                    # Pipe render ChatMarkdown, định dạng tiền tệ, ngày tháng
```

---

## ✨ Các tính năng giao diện nổi bật

1. **Giao diện Bán hàng POS thông minh**:
   - Quét mã vạch nhanh, tự động tra cứu giá bán và tồn kho khả dụng.
   - Hỗ trợ thêm khách hàng, áp dụng voucher khuyến mãi, tính tiền thừa tự động.
   - In hóa đơn nhiệt hoặc xuất PDF ngay sau khi thanh toán.
2. **Dashboard thời gian thực**:
   - Biểu đồ thống kê doanh thu hôm nay / tuần này / tháng này.
   - Thống kê hóa đơn đã lập trong ca của nhân viên thu ngân.
   - Checklist đầu ca / cuối ca bắt buộc giúp tăng tính kỷ luật vận hành.
3. **Quản lý Đa Kho & Lô Hàng**:
   - Danh sách tồn kho theo từng kho với nhãn cảnh báo trực quan: `(Sắp hết)` hoặc `(Cận date)`.
   - Lập phiếu kiểm kê dễ dàng, tính chênh lệch thực tế vs sổ sách và cho phép cân bằng kho.
4. **Quản lý Tri thức RAG nội bộ**:
   - Tải lên tài liệu hướng dẫn quy trình vận hành (PDF, HTML, Text, Markdown).
   - Tự động bóc tách thành các đoạn chunk và đồng bộ vào Vector Database.
   - Phân quyền tài liệu theo vai trò (chỉ ai có quyền mới tra cứu được tài liệu tương ứng).

---

## 🤖 Trợ lý ảo AI & Cơ chế Server-Sent Events (SSE)

Hệ thống hỗ trợ 2 chế độ hiển thị Chatbot:
- **Floating Widget**: Nút bong bóng chat tiện lợi ở góc phải màn hình, có thể bật/tắt nhanh mà không làm gián đoạn tác vụ hiện tại.
- **Dedicated View (`/home/chatbot`)**: Màn hình chat toàn trang với lịch sử hội thoại, danh sách câu hỏi gợi ý và công cụ quản trị tri thức.

### Cơ chế Streaming với Angular Signals:
- Kết nối tới backend thông qua API `POST /api/v1/chatbot/ask` với tiêu đề `Accept: text/event-stream`.
- Xử lý các sự kiện SSE tuần tự:
  - `meta`: Ghi nhận ID hội thoại và tiêu đề mới sinh.
  - `delta` / `replace`: Hiển thị từng từ theo thời gian thực (typing effect).
  - `citations`: Hiển thị trích dẫn tài liệu quy trình tham chiếu (nhấn để xem chi tiết đoạn trích).
  - `action`: Hiển thị nút điều hướng nhanh tới màn hình liên quan (ví dụ: *"Đến trang Báo cáo tồn kho"*).
  - `done` / `error`: Đóng stream tức thì, mở khóa ô nhập liệu và chuyển nút dừng về trạng thái gửi.
- Hỗ trợ xuất trực tiếp báo cáo ra file CSV tải về ngay trên khung chat qua Data URI.

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 20.x hoặc 22.x LTS.
- **NPM**: Phiên bản 10.x+.
- **Angular CLI**: Cài đặt toàn cục (tùy chọn):
  ```bash
  npm install -g @angular/cli
  ```

### Các bước thực hiện

1. **Cài đặt dependencies**:
   ```bash
   cd Supermarket-Management-System-FE
   npm install
   ```
2. **Kiểm tra cấu hình API Backend**:
   - File cấu hình: [api-url.ts](file:///d:/Profile/ThS/Class/CNPMTT/Project/Supermarket-Management-System-FE/src/app/environments/api-url.ts)
   - Mặc định: `http://localhost:9999/api/v1`
3. **Khởi chạy Development Server**:
   ```bash
   npm start
   # hoặc: ng serve --open
   ```
4. Truy cập ứng dụng tại: `http://localhost:4200`

---

## 📦 Build & Server-Side Rendering (SSR)

### Build cho môi trường Production:
```bash
npm run build
```
Thư mục xuất kết quả: `dist/supermarket-management-system-fe`

### Chạy ứng dụng với chế độ SSR (Express Server):
```bash
npm run serve:ssr:supermarket-management-system-FE
```
Ứng dụng sẽ phục vụ tại: `http://localhost:4000` với khả năng tối ưu hóa tải trang lần đầu (FCP) và hỗ trợ SEO toàn diện.
