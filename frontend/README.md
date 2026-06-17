# ⚛️ Totoro Frontend (React + Vite)

Frontend của dự án Totoro, được xây dựng với React + TypeScript + Vite.

## ⚙️ Yêu Cầu
* **Node.js** 18+ và **npm**
* Hạ tầng Backend đang chạy (khởi động từ root repo với `docker compose up -d`, sau đó chạy từng service)

## 🚀 Khởi Chạy Local

```bash
# 1. Cài đặt dependencies
npm install

# 2. Copy file biến môi trường
cp .env.example .env
# → Kiểm tra lại VITE_API_URL (mặc định: http://localhost:8080/api)

# 3. Chạy dev server
npm run dev
```

Frontend sẽ chạy ở [http://localhost:5173](http://localhost:5173).

## 🔗 Kết Nối Với Backend

Frontend giao tiếp với **gateway-service** (port `8080`) — đây là Single Entry Point của toàn hệ thống. Không kết nối trực tiếp tới identity/core/social service.

```bash
# frontend/.env
VITE_API_URL=http://localhost:8080/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

> **Lưu ý**: File `.env` đã được copy từ monolith và cấu hình API URL trỏ đúng cổng 8080 — không cần thay đổi.

## 📦 Scripts

```bash
npm run dev       # Dev server với HMR
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```
