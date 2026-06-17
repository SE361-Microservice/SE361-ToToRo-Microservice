# 🏡 Totoro Microservices — Infrastructure & Setup Repo

Chào mừng đến với repository hệ thống Microservices của dự án **Totoro** (Tìm Trọ) — Nền tảng hỗ trợ tìm phòng, ghép bạn ở chung và đánh giá khu trọ dành cho sinh viên. 

Đây là repository monorepo chứa hạ tầng dùng chung và cấu trúc các services được phân tách từ codebase Monolith gốc.

---

## 🗺️ Bản Đồ Hệ Thống & Cổng Kết Nối

Mọi client (Frontend React, Mobile, Postman) đều gọi qua **gateway-service** chạy ở port **8080** để định tuyến và kiểm tra quyền JWT tập trung. Các service nội bộ gọi trực tiếp với nhau thông qua port riêng của từng service.

| Thành phần | Port | Package Gốc | Vai trò |
| :--- | :--- | :--- | :--- |
| **frontend** | `5173` | React + Vite | Giao diện người dùng — chỉ giao tiếp với gateway |
| **gateway-service** | `8080` | `com.totoro.gateway` | Định tuyến API (Routing) & Kiểm tra JWT tập trung |
| **identity-service** | `8081` | `com.totoro.identity` | Quản lý Auth, Đăng ký, Đăng nhập, Profile người dùng |
| **core-service** | `8082` | `com.totoro.core` | Core nghiệp vụ phòng trọ (Listing, Location, Saved Listings) |
| **social-service** | `8083` | `com.totoro.social` | Tương tác cộng đồng (Chat, Roommate Matching, Review, Report, Notification) |

---

## 🛠️ Hạ Tầng Dùng Chung (Infrastructure Stack)

Môi trường phát triển local sử dụng Docker Compose để chạy các cơ sở dữ liệu và hệ thống thông báo, giám sát.

### Danh Sách Containers & Port Hoạt Động:

| Dịch vụ | Container Name | Port ngoài | Vai trò |
| :--- | :--- | :--- | :--- |
| **identity-db** | `totoro-identity-db` | `5433` | PostgreSQL lưu thông tin User & Auth |
| **core-db** | `totoro-core-db` | `5434` | PostgreSQL lưu thông tin Listing (phòng trọ) |
| **social-db** | `totoro-social-db` | `5435` | PostgreSQL lưu Review, Community, Chat, Notification |
| **zookeeper** | `totoro-zookeeper` | `2181` | Quản lý trạng thái cho Apache Kafka |
| **kafka** | `totoro-kafka` | `9092` | Message Broker dùng cho mô hình Event-Driven |
| **kafka-ui** | `totoro-kafka-ui` | `8089` | Giao diện quản lý & debug các Topics, Messages |
| **jaeger** | `totoro-jaeger` | `16686` | Distributed Tracing (Quản lý vết request) |
| **prometheus** | `totoro-prometheus` | `9090` | Thu thập metrics hiệu năng hệ thống |
| **grafana** | `totoro-grafana` | `3000` | Trực quan hóa số liệu (Dashboards) |

---

## 🚀 Khởi Chạy Hạ Tầng Local

Đảm bảo bạn đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. **Khởi động toàn bộ Database, Kafka và Observability Tools**:
   ```bash
   docker compose up -d
   ```

2. **Kiểm tra trạng thái các container**:
   ```bash
   docker compose ps
   ```

3. **Truy cập các công cụ hỗ trợ qua trình duyệt**:
   * **Kafka UI**: [http://localhost:8089](http://localhost:8089)
   * **Jaeger UI**: [http://localhost:16686](http://localhost:16686)
   * **Prometheus UI**: [http://localhost:9090](http://localhost:9090)
   * **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) *(User/Password mặc định: `admin` / `admin`)*

---

## 📦 Cấu Trúc Monorepo Các Services

Mỗi thư mục đại diện cho một service độc lập, chứa codebase và file cấu hình riêng:

```
SE361-ToToRo-Microservice/
├── frontend/           # React + Vite SPA (migrate từ SE361-ToToRo)
├── identity-service/   # Auth & User Service
├── core-service/       # Listing & Location Service
├── social-service/     # Review, Matching, Chat, Notification Service
├── gateway-service/    # API Gateway (Spring Cloud Gateway)
├── infra/              # Cấu hình hạ tầng (Prometheus config, ...)
├── docker-compose.yml  # Khởi động hạ tầng: DB, Kafka, Monitoring
├── inter-service-api.md# API Contract giữa các Service
└── .env.example        # Mẫu biến môi trường cho toàn hệ thống
```

---

## 🔗 Hướng Dẫn Phát Triển (Dành Cho Thành Viên)

1. **Copy file `.env.example` thành `.env`**:
   ```bash
   cp .env.example .env
   ```
2. **Cấu hình Database**:
   * Khi phát triển ở local: Giữ nguyên các thông số kết nối tới `localhost:5433`, `localhost:5434`, `localhost:5435`.
   * Khi deploy demo: Sử dụng cơ sở dữ liệu serverless trên **Neon** ([neon.tech](https://neon.tech)), tạo 3 project tương ứng để lấy URL kết nối độc lập.
3. **Thực thi quy chuẩn đặt tên package**:
   * Service nào chỉ import package của service đó. Xóa hoàn toàn các import chéo từ codebase Monolith cũ.
   * Giao tiếp giữa các service thông qua FeignClient (API contract chi tiết được định nghĩa trong [inter-service-api.md](./inter-service-api.md)).
4. **Chạy Frontend** (sau khi hạ tầng và các service đã sẵn sàng):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   * Frontend chạy ở [http://localhost:5173](http://localhost:5173) và tự động kết nối tới gateway tại `http://localhost:8080`.
   * `VITE_API_URL` trong `frontend/.env` đã được cấu hình sẵn, không cần thay đổi.
