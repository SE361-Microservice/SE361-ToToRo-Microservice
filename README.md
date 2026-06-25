# 🏡 Totoro Microservices — Infrastructure & Setup Repo

Chào mừng đến với repository hệ thống Microservices của dự án **Totoro** (Tìm Trọ) — Nền tảng hỗ trợ tìm phòng, ghép bạn ở chung và đánh giá khu trọ dành cho sinh viên. 

Đây là repository monorepo chứa hạ tầng dùng chung, cấu hình CI/CD và toàn bộ mã nguồn của các dịch vụ sau khi được phân tách từ phiên bản Monolith gốc.

> [!IMPORTANT]
> Để xem chi tiết về kiến trúc hệ thống, sơ đồ nghiệp vụ chi tiết, quy trình chuyển đổi dữ liệu và phân tích thiết kế, vui lòng tham khảo:
> 📄 **[Tài liệu Tổng quan Hệ thống (SYSTEM_OVERVIEW.md)](./docs/SYSTEM_OVERVIEW.md)**

---

## 🗺️ Bản Đồ Hệ Thống & Cổng Kết Nối

Mọi client (Frontend React, Mobile, Postman) đều gọi qua **gateway-service** chạy ở port **8080** để định tuyến và kiểm tra quyền JWT tập trung. Các service nội bộ gọi trực tiếp với nhau hoặc qua cơ chế Pub/Sub của Broker.

| Thành phần | Port | Công nghệ | Vai trò |
| :--- | :--- | :--- | :--- |
| **frontend** | `5173` | React + Vite | Giao diện người dùng — chỉ giao tiếp với gateway và ai-service |
| **gateway-service** | `8080` | Spring Cloud Gateway | Định tuyến API (Routing) & Kiểm tra JWT tập trung |
| **identity-service** | `8081` | Spring Boot | Quản lý Auth, Đăng ký, Đăng nhập, Profile người dùng |
| **core-service** | `8082` | Spring Boot | Core nghiệp vụ phòng trọ (Listing, Location, Saved Listings) |
| **social-service** | `8083` | Spring Boot | Tương tác cộng đồng (Chat, Roommate Matching, Review, Report, Notification) |
| **ai-service** | `8000` | FastAPI (Python) | Agentic AI Chatbot hỗ trợ tìm phòng, matching score (LangGraph + Gemini) |

---

## 🛠️ Hạ Tầng Dùng Chung (Infrastructure Stack)

Môi trường phát triển local sử dụng Docker Compose để chạy các cơ sở dữ liệu, Cache, Message Broker, và hệ thống giám sát Observability.

### Danh Sách Containers & Port Hoạt Động:

| Dịch vụ | Container Name | Port ngoài | Vai trò |
| :--- | :--- | :--- | :--- |
| **identity-db** | `totoro-identity-db` | `5433` (local) / `5432` (internal) | PostgreSQL lưu thông tin User & Auth |
| **core-db** | `totoro-core-db` | `5434` (local) / `5432` (internal) | PostgreSQL lưu thông tin Listing (phòng trọ) |
| **social-db** | `totoro-social-db` | `5435` (local) / `5432` (internal) | PostgreSQL lưu Review, Community, Chat, Notification |
| **redis** | `totoro-redis` | `6379` | Distributed Cache cho Core-service & JWT Blacklist cho Identity-service |
| **redpanda** | `totoro-redpanda` | `9092` (internal) / `29092` (local) | Message Broker hiệu năng cao (tương thích Kafka API) |
| **redpanda-console** | `totoro-redpanda-console` | `8088` | Giao diện Web quản trị & debug Topics, Messages |
| **jaeger** | `totoro-jaeger` | `16686` (UI) / `4318` (OTLP HTTP) | Distributed Tracing (Thu thập trace requests chéo service) |
| **prometheus** | `totoro-prometheus` | `9090` | Thu thập metrics hiệu năng từ `/actuator/prometheus` |
| **grafana** | `totoro-grafana` | `3001` (admin/admin) | Dashboard trực quan hóa số liệu (đã cấu hình sẵn data sources) |

---

## 🚀 Khởi Chạy Hạ Tầng Local

Đảm bảo bạn đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Có hai cách khởi chạy tùy theo nhu cầu phát triển:

### Cách 1: Chỉ khởi chạy các Database & Broker (Khuyên dùng khi chạy code IntelliJ/Eclipse/VS Code để debug)
```bash
# Khởi chạy databases, redis, redpanda, jaeger, prometheus, grafana
docker compose up -d
```

### Cách 2: Khởi chạy toàn bộ hệ thống (gồm cả các Microservices chạy bằng container)
```bash
# Build và chạy tất cả services + databases + monitoring
docker compose -f docker-compose.full.yml up -d --build
```

### Truy cập các công cụ qua trình duyệt:
* **Redpanda Console (Kafka UI)**: [http://localhost:8088](http://localhost:8088)
* **Jaeger Tracing UI**: [http://localhost:16686](http://localhost:16686)
* **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
* **Grafana Dashboards**: [http://localhost:3001](http://localhost:3001) *(User: `admin` / Password: `admin`)*
  * Chọn dashboard **ToToRo Microservices Overview** đã được cấu hình sẵn để theo dõi tình trạng hệ thống.

---

## 📦 Cấu Trúc Monorepo Các Services

Mỗi thư mục đại diện cho một service độc lập, chứa codebase, Dockerfile và file cấu hình riêng:

```
SE361-ToToRo-Microservice/
├── frontend/           # React + Vite SPA (Client Web)
├── identity-service/   # Auth & User Service (Port 8081)
├── core-service/       # Listing & Location Service (Port 8082)
├── social-service/     # Review, Matching, Chat, Notification Service (Port 8083)
├── gateway-service/    # API Gateway - Spring Cloud Gateway (Port 8080)
├── ai-service/         # Python FastAPI + LangGraph Agentic AI (Port 8000)
├── common/             # Thư viện dùng chung (DTOs, Exceptions, Response format)
├── infra/              # Cấu hình hạ tầng giám sát (Prometheus & Grafana)
├── k8s/                # Kubernetes manifests để deploy cụm container
├── docker-compose.yml  # Compose khởi chạy hạ tầng (DB, Broker, Cache, Observability)
├── docker-compose.full.yml # Compose chạy toàn bộ hệ thống (gồm cả service)
├── inter-service-api.md# API Contract định nghĩa giao tiếp REST nội bộ giữa các Service
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
   * Khi deploy demo: Sử dụng cơ sở dữ liệu serverless trên **Neon** ([neon.tech](https://neon.tech)), tạo 3 project tương ứng để lấy URL kết nối độc lập và điền vào các biến tương ứng.
3. **Thực thi quy chuẩn đặt tên package**:
   * Service nào chỉ import package của service đó. Xóa hoàn toàn các import chéo từ codebase Monolith cũ.
   * Giao tiếp đồng bộ giữa các service thông qua FeignClient (API contract chi tiết được định nghĩa trong [inter-service-api.md](./inter-service-api.md)).
4. **Chạy Frontend** (sau khi hạ tầng và các service đã sẵn sàng):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   * Frontend chạy ở [http://localhost:5173](http://localhost:5173) và tự động kết nối tới gateway tại `http://localhost:8080`.
   * `VITE_API_URL` trong `frontend/.env` đã được cấu hình sẵn, không cần thay đổi.

---

## 🔁 Quy Trình CI/CD Pipeline (GitHub Actions)

Hệ thống được tích hợp quy trình tích hợp và triển khai liên tục (CI/CD) tự động thông qua **GitHub Actions** (`.github/workflows/ci-cd.yml`):

1. **Khi Pull Request hoặc Push lên các nhánh (`main`, `master`, `dev`, `feature/**`)**:
   * Tự động khởi dựng môi trường Java 21 (Temurin).
   * Sử dụng Maven cache giúp tối ưu thời gian tải dependencies.
   * Biên dịch và chạy toàn bộ unit tests bằng Maven (`mvn clean install`).
2. **Khi Merge/Push trực tiếp vào nhánh chạy chính (`main`, `master`, `dev`)**:
   * Xây dựng Docker Image tối ưu thông qua Multi-stage build (sử dụng JRE 21 alpine siêu nhẹ, chạy bằng non-root user).
   * Tự động đẩy (Push) các Docker Images lên **Google Artifact Registry (GAR)**.
   * Tự động quét lỗ hổng bảo mật các images bằng **Trivy Vulnerability Scanner** (đối với branch main/master).
   * Tự động triển khai các container mới lên **Google Cloud Run** dưới dạng các dịch vụ Serverless.
