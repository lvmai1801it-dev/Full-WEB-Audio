# Hướng Dẫn Deploy Lên Vercel

Dự án này sử dụng **Next.js** và **MySQL**. Dưới đây là các bước để deploy lên Vercel.

## 1. Chuẩn Bị
- Đã push code lên GitHub/GitLab/Bitbucket.
- Đã có tài khoản Vercel.
- Database MySQL (Cloud) đã sẵn sàng (có public Host, User, Pass).

## 2. Environment Variables (Biến Môi Trường)
Trên Vercel Project Settings > Environment Variables, thêm các biến sau (lấy từ `.env.example`):

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Host của MySQL server (VD: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`) |
| `DB_USER` | Username database |
| `DB_PASS` | Password database |
| `DB_NAME` | Tên database (VD: `audio_truyen`) |
| `DB_PORT` | Port (thường là `3306` hoặc `4000`) |
| `DB_SSL` | `true` (Bắt buộc nếu dùng Cloud DB yêu cầu SSL) |
| `JWT_SECRET` | Chuỗi ngẫu nhiên bảo mật cho Admin API |

## 3. Cấu Hình Project Trên Vercel
Khi Import Project từ Git, cấu hình như sau:

- **Framework Preset:** Next.js
- **Root Directory:** `frontend` (Quan trọng! Vì code Next.js nằm trong thư mục này)
- **Build Command:** `npm run build` (Mặc định)
- **Output Directory:** `.next` (Mặc định)
- **Install Command:** `npm install` (Mặc định)

## 4. Database Setup
Do Vercel là môi trường Serverless, bạn cần đảm bảo Database:
- Cho phép kết nối từ bên ngoài (Public Access).
- Đã chạy script migration (`migration_full_uuid.sql`) để có cấu trúc bảng mới nhất.

## 5. Deploy
- Nhấn **Deploy**.
- Sau khi deploy thành công, Vercel sẽ cung cấp domain (VD: `frontend.vercel.app`).
- Update lại biến `NEXT_PUBLIC_API_URL` trong Environment Variables của Vercel thành: `https://<your-domain>/api`.
- Redeploy lại (nếu cần cập nhật biến môi trường Frontend).
