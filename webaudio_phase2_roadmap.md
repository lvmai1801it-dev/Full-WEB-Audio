# 🚀 WebAudio Phase 2 - Roadmap v2.1 (Optimized)

## 1. Tổng Quan & Mục Tiêu
Roadmap này được tối ưu hóa để tập trung vào xây dựng nền tảng vững chắc (Foundation) trước khi phát triển các tính năng phức tạp, đảm bảo khả năng mở rộng (Scale) và trải nghiệm người dùng (UX) đạt chuẩn Native App.

**Key Optimizations Update:**
- **Strict Typing:** Thêm TypeScript Interfaces chuẩn ngay từ đầu (Shared Types).
- **Service Layer Pattern:** Tách biệt logic gọi API khỏi UI components.
- **Design System First:** Xây dựng các UI Atoms/Molecules trước khi làm Page.
- **Native Experience:** Tối ưu Media Session API và Audio Recovery.

---

## 2. Phase 0.5 – Tech Debt & Foundation (BẮT BUỘC)
*Mục tiêu: Chuẩn hóa code base, tránh technical debt về sau.*

- [ ] **Data Modeling & Types**
  - [ ] Tạo `types/index.ts`: Định nghĩa Interface Interface chuẩn cho `Book`, `Chapter`, `User` (Khớp với model PostgreSQL).
  - [ ] Định nghĩa `ApiResponse<T>` để thống nhất data trả về từ Backend.

- [ ] **Architecture Setup**
  - [ ] Setup `services/api.client.ts`: Cấu hình Axios/Fetch instance với Interceptors (để handle token, error global).
  - [ ] Setup `services/audio.service.ts`: Abstraction layer cho HTML5 Audio (tránh gọi trực tiếp `<audio>` trong component).

---

## 3. Phase 2.1 – UI Core & Design System
*Mục tiêu: Xây dựng bộ UI Kit tái sử dụng, đảm bảo tính nhất quán.*

- [ ] **Theme Config (Tailwind v4)**
  - [ ] Config màu chủ đạo: Orange/Blue & Semantic Colors (Error, Success).
  - [ ] Dark/Light Mode variable setup.

- [ ] **Atomic Components** (Building Blocks)
  - [ ] `Button`: Variants (Primary, Secondary, Ghost).
  - [ ] `Input`: Search-optimized inputs.
  - [ ] `Card`: Base interactable container with hover effects.
  - [ ] `Skeleton`: Loading states (QUAN TRỌNG cho trải nghiệm mượt).

- [ ] **Layout Architecture**
  - [ ] `MobileLayout`: Bottom Navigation Bar (Home, Search, Library, User).
  - [ ] `DesktopLayout`: Sidebar persistence.

---

## 4. Phase 2.2 – Audio Player (Core Experience)
*Mục tiêu: Playback mượt mà, giữ trạng thái khi reload, tích hợp hệ điều hành.*

- [ ] **State Management (Zustand)**
  - [ ] `usePlayerStore`: Logic play/pause, playlist management, shuffle/repeat.
  - [ ] Persistence: Lưu vị trí bài hát vào `localStorage` (và sync DB sau này).

- [ ] **Player UI**
  - [ ] **Mini Player**: Hiển thị xuyên suốt ở dưới màn hình (Glassmorphism).
  - [ ] **Full Screen Player**: Giao diện tập trung, ảnh bìa lớn, Visualizer (nếu có thể).

- [ ] **Native Integration**
  - [ ] **Media Session API**: Cho phép điều khiển từ Lockscreen, đồng hồ, tai nghe.
  - [ ] **Graceful Error Handling**: Fallback khi link lỗi, auto-skip sau 3s.

---

## 5. Phase 2.3 – Discovery & Home (Frontend-First)
- [ ] **Home Page Modules**
  - [ ] `HeroSlider`: Banner trượt tự động.
  - [ ] `HorizontalList`: Các list sách vuốt ngang.
  - [ ] Content Skeleton: Hiệu ứng loading khi fetch dữ liệu.

- [ ] **Personalization (Lite)**
  - [ ] "Tiếp tục nghe": Lấy từ local history.
  - [ ] "Mới nghe gần đây": History log đơn giản.

---

## 6. Phase 2.4 – PWA & Performance
- [ ] **PWA Enhancement**
  - [ ] Manifest.json đầy đủ.
  - [ ] Service Worker: Cache UI shell.
  - [ ] Install Prompt custom UI.

- [ ] **SEO & Performance**
  - [ ] Metadata động (OpenGraph images).
  - [ ] Dynamic Imports cho các component nặng (Player Full Screen).

---

## 8. Kết Luận
Roadmap này chia nhỏ công việc kỹ hơn, tập trung vào **Chất lượng code (Type safety)** và **Trải nghiệm UX (Skeleton, Error Handling)** thay vì chỉ liệt kê tính năng.
