# 🚀 Kế Hoạch Nâng Cấp WebAudio (Phase 2)

## 1. 🎨 UI/UX Redesign (Ưu Tiên Số 1)
*Mục tiêu: Giao diện hiện đại, đẹp như App Spotify/Netflix, dễ dùng.*

- [ ] **Giao Diện Mobile-First (App-like)**
    - **Header/Navigation Mới**: Chuyển sang **Bottom Navigation Bar** (trên Mobile) để dễ thao tác 1 tay.
    - **Siêu Mượt (Transitions)**: Thêm hiệu ứng chuyển trang, skeleton loading (shim), hover effects.
- [ ] **Audio Player Cái Tiến**
    - **Mini Player**: Thanh phát nhạc Neo-morphism nổi ở dưới cùng tất cả các trang.
    - **Full Screen Player**: Giao diện tập trung, ảnh bìa xoay, visualizer (sóng nhạc).
- [ ] **Trang Chủ (Home)**
    - **Hero Section**: Banner trượt tự động, hiệu ứng mờ (backdrop blur).
    - **Horizontal Scroll**: Các list truyện vuốt ngang mượt mà.
- [ ] **Dark Mode Chuẩn**: Tối ưu màu sắc cho chế độ đêm (OLED black).

## 2. 📈 SEO & Analytics (Ưu Tiên Số 2)
*Mục tiêu: Tăng traffic từ Google.*

- [ ] **SEO Optimization**
    - Dynamic Sitemap (Tự động cập nhật link truyện mới).
    - JSON-LD Structured Data (Hiển thị rating, ảnh đẹp trên Google Search).
    - Metadata động cho từng chương.
- [ ] **Analytics**: Tích hợp Google Analytics 4.

## 3. 📱 PWA - Trải Nghiệm App (Ưu Tiên Số 3)
*Mục tiêu: Cài đặt và sử dụng offline.*

- [ ] **Installable**: Cài web lên màn hình chính (Manifest).
- [ ] **Service Worker**: Cache giao diện, load ngay lập tức kể cả mạng yếu.

## 4. 🔍 Khám Phá (Discovery) (Ưu Tiên Số 4)
- [ ] **Bảng Xếp Hạng**: Top Trending, Top View.
- [ ] **Gợi Ý**: "Có thể bạn thích".

## 5. 👤 User System (Ưu Tiên Số 5)
- [ ] Authentication (NextAuth).
- [ ] Đồng bộ lịch sử/Yêu thích.

---

### UI/UX Implementation Steps (Detailed)

#### 1. Visual Style: "Modern Minimalism" (Spotify x Audiotruyen)
*Kết hợp sự đơn giản của Audiotruyen với trải nghiệm App mượt mà của Spotify.*

-   **Color Palette**:
    -   **Chế độ Sáng (Default)**: Nền trắng sạch (`#ffffff`), Text đen xám (`#1e293b`). Card đổ bóng nhẹ. (Giống Audiotruyen).
    -   **Chế độ Tối (Dark)**: Nền đen sâu (`#09090b`), Text trắng. (Giống Spotify/Netflix).
    -   **Primary**: **Cam rực rỡ (Vibrant Orange #f97316)** hoặc **Xanh biển hiện đại (#3b82f6)**. Dùng cho nút Play, Badge.
-   **Typography**: Font **Inter** hoặc **Be Vietnam Pro**. Size chữ to rõ, dễ đọc.
-   **Components**:
    -   **Card**: Bo góc lớn (`rounded-xl`), ảnh bìa to đẹp.
    -   **Interactions**: Hiệu ứng Hover nổi lên, bấm vào có feedback (ripple).

#### 2. Layout Structure (Personalized)
-   **Mobile App-like**:
    -   **Bottom Navigation**: [Trang chủ] [Tìm kiếm] [Tủ sách] [Cá nhân].
    -   **Mini Player**: Luôn hiện ở dưới cùng khi lướt web (Giống Spotify).
-   **Desktop**:
    -   **Sidebar**: Menu bên trái cố định.
    -   **Content**: Grid layout, cuộn vô tận.

#### 4. Component Architecture (Technical)
*Cấu trúc Component cần xây dựng:*

-   **Atoms (Cơ bản)**:
    -   `Button`: Variants (Primary/Ghost/Outline).
    -   `Input`: Search input with icon.
    -   `Badge`: Tag thể hiện trạng thái (Full, New).
    -   `Skeleton`: Loading placeholder (quan trọng cho trải nghiệm mượt).
-   **Molecules (Ghép nối)**:
    -   `BookCard`: Ảnh + Tên + Badge + Tác giả.
    -   `SectionHeader`: Tiêu đề mục + Nút "Xem thêm".
    -   `MiniPlayer`: Thanh phát nhạc nhỏ (Ảnh + Controls + Progress).
-   **Organisms (Phức tạp)**:
    -   `Sidebar`: Navigation cho Desktop.
    -   `BottomNav`: Navigation cho Mobile.
    -   `HeroSlider`: Banner trượt trang chủ.
    -   `AudioPlayerFull`: Màn hình phát nhạc chi tiết.

#### 5. State Management (Zustand)
*Quản lý trạng thái ứng dụng:*

-   **PlayerStore**:
    -   `currentTrack`: Bài đang phát.
    -   `playlist`: Danh sách bài trong Queue.
    -   `isPlaying`, `volume`, `currentTime`.
    -   `togglePlay()`, `next()`, `prev()`.
-   **UIStore**:
    -   `isSidebarOpen` (Mobile).
    -   `theme` (Dark/Light sync).

---

## Technical Stack Update
-   **Framework**: Next.js 16 (App Router).
-   **Styling**: Tailwind CSS v4 (CSS Variables).
-   **Icons**: Lucide React (Nhẹ, đẹp).
-   **Animations**: `tailwindcss-animate` + native CSS transitions.
-   **State**: Zustand (Gọn nhẹ hơn Redux).

