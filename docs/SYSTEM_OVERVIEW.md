# 🏡 TOTORO — Tài Liệu Tổng Quan Hệ Thống
**Dự án**: Totoro (Tìm Trọ) — Nền tảng hỗ trợ sinh viên tìm phòng trọ, ghép bạn ở chung và đánh giá khu trọ.
**Môn học**: SE361 — Kiến trúc Phần mềm | **Nhóm**: 3 thành viên
**Repository Monolith**: SE361-ToToRo | **Repository Microservice**: SE361-ToToRo-Microservice

---

## Mục Lục
1. [Tổng quan dự án & Nghiệp vụ](#1-tổng-quan-dự-án--nghiệp-vụ)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Quá trình Monolith → Microservice](#3-quá-trình-monolith--microservice)
4. [Tech Stack](#4-tech-stack)
5. [Deployment & CI/CD](#5-deployment--cicd)
6. [Observability & Monitoring](#6-observability--monitoring)

---

## 1. Tổng Quan Dự Án & Nghiệp Vụ

### 1.1 Vấn Đề Thực Tế
- Sinh viên mất nhiều thời gian tìm phòng qua các kênh rải rác (Facebook, Zalo, Chợ Tốt) — thông tin thiếu chuẩn hoá.
- Không có cơ chế tìm bạn ở ghép phù hợp về lối sống, ngân sách, trường học.
- Review phòng trọ bị phân tán, dễ làm giả, thiếu uy tín.

### 1.2 Giải Pháp
Totoro tích hợp 3 lớp giá trị: **Tìm trọ** (tìm kiếm nâng cao + AI gợi ý), **Cộng đồng** (review thật + report tin giả), và **Roommate Matching** (swipe UI + AI compatibility score).

### 1.3 Actors

| Actor | Mô tả | Quyền chính |
|:------|:------|:------------|
| Student | Người dùng chính | Tìm kiếm, review, swipe, chat |
| Landlord | Chủ trọ | Đăng/sửa/xóa listing, xem thống kê |
| Admin | Quản trị viên | Duyệt listing, xử lý report |
| AI Agent | Hệ thống AI tự động | Gợi ý phòng, tính điểm ghép bạn, chatbot |

### 1.4 Use Cases Chính

`mermaid
graph LR
    subgraph "Student Use Cases"
        S1[Đăng ký / Đăng nhập]
        S2[Tìm kiếm phòng trọ]
        S3[Xem chi tiết & Lưu yêu thích]
        S4[Viết Review & Upload ảnh]
        S5[Tạo Roommate Profile]
        S6[Swipe & Match bạn ghép]
        S7[Chat 1-1 / Group]
        S8[Hỏi AI Chatbot]
    end
    subgraph "Landlord Use Cases"
        L1[Đăng tin cho thuê]
        L2[Quản lý listing]
        L3[Phản hồi review]
        L4[Chat với sinh viên]
    end
    subgraph "Admin Use Cases"
        A1[Duyệt listing]
        A2[Xử lý report vi phạm]
        A3[Quản lý người dùng]
    end
`

### 1.5 Modules Nghiệp Vụ (8 Bounded Contexts)

| # | Module | Chức năng chính |
|:--|:-------|:---------------|
| 1 | Auth & User | Đăng ký, đăng nhập (Email + Google OAuth2), JWT, quản lý profile |
| 2 | Listing | CRUD tin đăng phòng trọ, tìm kiếm, lọc, bản đồ, lưu yêu thích |
| 3 | Review & Community | Đánh giá đa tiêu chí, upload ảnh review, bài viết cộng đồng |
| 4 | Roommate Matching | Tạo hồ sơ lifestyle, swipe LEFT/RIGHT, AI compatibility score |
| 5 | Chat | Chat 1-1 và group, realtime qua WebSocket |
| 6 | AI Services | Chatbot (Gemini), gợi ý phòng, tính điểm tương thích |
| 7 | Notification | Thông báo in-app realtime, event-driven qua Kafka |
| 8 | Media / Upload | Upload ảnh lên Cloudinary, auto resize & optimize |

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Tổng Quan Kiến Trúc Microservice

`mermaid
graph TB
    Client["🖥️ Frontend<br/>React + Vite<br/>:5173"]
    
    Client -->|"HTTP/WS"| GW["🚪 Gateway Service<br/>Spring Cloud Gateway<br/>:8080"]
    
    GW -->|"/api/auth/**, /api/users/**"| IS["🔐 Identity Service<br/>:8081"]
    GW -->|"/api/listings/**, /api/locations/**"| CS["🏠 Core Service<br/>:8082"]
    GW -->|"/api/chat/**, /api/matching/**<br/>/api/reviews/**, /api/notifications/**"| SS["💬 Social Service<br/>:8083"]
    GW -->|"/ws/**"| SS
    
    IS --- IDB[("identity_db<br/>PostgreSQL<br/>:5433")]
    CS --- CDB[("core_db<br/>PostgreSQL<br/>:5434")]
    SS --- SDB[("social_db<br/>PostgreSQL<br/>:5435")]
    
    IS -->|"Kafka Events"| RP["📨 Redpanda<br/>(Kafka-compatible)<br/>:9092"]
    CS -->|"Kafka Events"| RP
    SS -->|"Consume Events"| RP
    
    IS --- Redis["⚡ Redis<br/>Cache & Blacklist<br/>:6379"]
    CS --- Redis
    
    CS -->|"FeignClient"| IS
    SS -->|"FeignClient"| IS
    SS -->|"FeignClient"| CS
    
    Client -->|"HTTP"| AI["🤖 AI Service<br/>FastAPI + LangGraph<br/>:8000"]
    AI -->|"HTTP"| GW
`

### 2.2 Vai Trò Từng Service

#### Gateway Service (:8080)
- **Công nghệ**: Spring Cloud Gateway (WebFlux — Reactive)
- **Chức năng**: Single entry point, JWT validation tập trung, route requests đến downstream services
- **JWT Filter**: Validate token → extract userId → forward qua header X-User-Id
- **Dẫn chứng**: File gateway-service/src/.../filter/JwtAuthenticationFilter.java — sử dụng AbstractGatewayFilterFactory, hỗ trợ cả Bearer token và WebSocket query parameter

#### Identity Service (:8081)
- **Công nghệ**: Spring Boot + Spring Security + Spring Data JPA
- **Chức năng**: Auth (login/register/OAuth2 Google), JWT (access + refresh token), quản lý user profile, email verification, reset password
- **Database**: identity_db (PostgreSQL) — bảng users, user_profiles
- **Events**: Produce USER_CREATED event lên Kafka khi có user mới đăng ký
- **Cache**: Redis cho JWT blacklist (logout/refresh)

#### Core Service (:8082)
- **Công nghệ**: Spring Boot + Spring Data JPA + OpenFeign + Resilience4j
- **Chức năng**: CRUD listing phòng trọ, tìm kiếm/lọc, quản lý location, saved listings, upload ảnh (Cloudinary)
- **Database**: core_db — bảng listings, listing_images, listing_policies, listing_facilities, 	ags, saved_listings
- **Cache**: Redis cache cho listing queries (read-heavy)
- **Inter-service**: Gọi Identity Service qua FeignClient để lấy thông tin landlord

#### Social Service (:8083)
- **Công nghệ**: Spring Boot + WebSocket + Spring Kafka
- **Chức năng**: Review & Community, Roommate Matching (swipe/match), Chat (1-1/group realtime), Notification, Report
- **Database**: social_db — bảng eviews, eports, oommate_profiles, oommate_swipes, oommate_matches, conversations, messages, 
otifications
- **Inter-service**: Gọi cả Identity Service và Core Service qua FeignClient
- **Events**: Consume Kafka events cho notification dispatch

#### AI Service (:8000)
- **Công nghệ**: Python FastAPI + LangChain + LangGraph + Google Gemini API
- **Chức năng**: Agentic AI chatbot (search_agent, swipe_commentary), tool-calling (search_listings, get_listing_detail, compare_listings, search_roommates, get_compatibility, save_listing, initiate_chat, get_reviews)
- **Kiến trúc**: Agent-based với LangGraph — AI agent tự chọn tool phù hợp để trả lời câu hỏi tự nhiên của user

### 2.3 Giao Tiếp Giữa Các Service

#### Synchronous — OpenFeign + Resilience4j
Các service gọi nhau qua REST API nội bộ (/internal/**), sử dụng OpenFeign client với Circuit Breaker (Resilience4j).

**API Contract được định nghĩa rõ ràng** (file inter-service-api.md):

| Endpoint | Service | Mô tả |
|:---------|:--------|:------|
| GET /internal/users/{userId} | Identity → others | Lấy thông tin user profile |
| POST /internal/users/batch | Identity → others | Batch get nhiều user profiles |
| GET /internal/users/{userId}/exists | Identity → others | Kiểm tra user tồn tại |
| GET /internal/listings/{listingId} | Core → Social | Lấy thông tin listing |
| GET /internal/listings/{listingId}/exists | Core → Social | Kiểm tra listing tồn tại |

#### Asynchronous — Kafka (Redpanda)
Event-driven communication cho các tác vụ không cần response tức thì:
- USER_CREATED event: Identity → Social (tạo notification chào mừng)
- Listing events: Core → Social (trigger notification cho user đang theo dõi)

**Lỗi chuẩn hóa**: Tất cả service trả error theo format thống nhất với status, error, code, message, 	imestamp.

### 2.4 Database Architecture — Database per Service

`mermaid
graph LR
    subgraph "Identity Service"
        IS2[Identity Service] --- IDB2[("identity_db<br/>:5433<br/>• users<br/>• user_profiles")]
    end
    subgraph "Core Service"
        CS2[Core Service] --- CDB2[("core_db<br/>:5434<br/>• listings<br/>• listing_images<br/>• listing_policies<br/>• listing_facilities<br/>• tags, listing_tags<br/>• saved_listings")]
    end
    subgraph "Social Service"
        SS2[Social Service] --- SDB2[("social_db<br/>:5435<br/>• reviews, review_images<br/>• reports<br/>• roommate_profiles/swipes/matches<br/>• conversations, messages<br/>• notifications")]
    end
`

Mỗi service sở hữu database riêng biệt (Database per Service pattern). Không có cross-database joins — mọi dữ liệu cần từ service khác đều lấy qua API.

---

## 3. Quá Trình Monolith → Microservice

### 3.1 Phase 1 — Monolith-First (Repository SE361-ToToRo)

Toàn bộ hệ thống trong **một Spring Boot application duy nhất**, tổ chức code theo DDD packages:

`
com.totoro/
├── auth/           # Auth & User management
├── listing/        # Phòng trọ, policy, facility, tag
├── community/      # Bài viết cộng đồng
├── review/         # Review & rating
├── report/         # Báo cáo vi phạm
├── matching/       # Roommate profile, swipe, match
├── chat/           # Conversation, message
├── notification/   # Notification dispatch
├── location/       # Quản lý địa chỉ
├── user/           # User profile
├── common/         # Shared utilities
└── internal/       # Internal APIs
`

**Nguyên tắc thiết kế từ đầu để chuẩn bị migrate**:
- Module KHÔNG gọi trực tiếp Repository của module khác
- Module chỉ gọi qua **Service Interface** được expose
- Khi tách Microservice, chỉ đổi implementation — consumer code không cần sửa

`
❌ SAI:  reviewService → listingRepository.findById(id)
✅ ĐÚNG: reviewService → listingQueryService.existsById(id)
         // Phase 2: impl đổi thành FeignClient HTTP call
`

### 3.2 Phase 2 — Microservice Migration (Repository SE361-ToToRo-Microservice)

#### Chiến lược tách service

| Thứ tự | Service | Lý do ưu tiên |
|:-------|:--------|:-------------|
| 1 | Identity Service | Ít phụ thuộc nhất, nền tảng cho mọi service |
| 2 | Core Service | Core domain, nhiều read — cần cache riêng (Redis) |
| 3 | Social Service | Gộp Review + Matching + Chat + Notification |
| 4 | Gateway Service | Single entry point sau khi có ≥2 service |
| 5 | AI Service | Tách stack riêng (Python), scale độc lập |

#### Những thay đổi chính khi migrate

| Aspect | Monolith | Microservice |
|:-------|:---------|:-------------|
| Codebase | 1 Spring Boot app | 4 Spring Boot + 1 FastAPI |
| Database | 1 PostgreSQL shared | 3 PostgreSQL riêng biệt |
| Communication | Method call trong JVM | FeignClient HTTP + Kafka events |
| Authentication | Spring Security filter chain | Gateway JWT filter tập trung |
| Configuration | 1 application.properties | Mỗi service có config riêng |
| Deployment | 1 JAR file | 4 Docker containers + infra |
| Fault Tolerance | N/A | Circuit Breaker (Resilience4j) |
| Caching | Local cache | Redis distributed cache |

#### Monorepo Structure sau migrate

`
SE361-ToToRo-Microservice/
├── frontend/           # React + Vite SPA
├── gateway-service/    # API Gateway (Spring Cloud Gateway)
├── identity-service/   # Auth & User Service
├── core-service/       # Listing & Location Service
├── social-service/     # Review, Matching, Chat, Notification
├── ai-service/         # Python FastAPI + LangGraph
├── common/             # Shared DTOs, Exception handling
├── infra/              # Prometheus, Grafana configs
├── k8s/                # Kubernetes manifests
├── docker-compose.yml  # Infra only (DB, Kafka, Monitoring)
├── docker-compose.full.yml  # Full system
└── .github/workflows/  # CI/CD pipeline
`

---

## 4. Tech Stack

### 4.1 Bảng Tổng Hợp

| Tầng | Công nghệ | Version | Vai trò |
|:-----|:----------|:--------|:--------|
| **Frontend** | React + Vite + TypeScript | — | SPA, giao diện người dùng |
| **API Gateway** | Spring Cloud Gateway | Spring Boot 3.2.3 | Routing, JWT filter, CORS |
| **Backend Services** | Spring Boot + Spring Data JPA | 3.2.3, Java 17 | Business logic, REST API |
| **AI Service** | FastAPI + LangChain + LangGraph | Python 3.11+ | Agentic AI chatbot |
| **LLM** | Google Gemini API | — | AI reasoning, tool-calling |
| **Database** | PostgreSQL | 16 Alpine | RDBMS chính |
| **Cache** | Redis | 7 Alpine | Distributed cache, JWT blacklist |
| **Message Broker** | Redpanda (Kafka-compatible) | v23.2.19 | Async event-driven messaging |
| **File Storage** | Cloudinary | — | Upload & optimize ảnh |
| **Inter-service** | OpenFeign + Resilience4j | Spring Cloud 2023.0.0 | Sync HTTP calls + Circuit Breaker |
| **DB Migration** | Flyway | — | Schema versioning |
| **Realtime** | WebSocket (STOMP) | — | Chat & notification realtime |
| **API Docs** | SpringDoc OpenAPI (Swagger) | 2.3.0 | Auto-generated API documentation |
| **Containerization** | Docker + Docker Compose | — | Local dev & deployment |
| **Orchestration** | Kubernetes | — | Production deployment |
| **CI/CD** | GitHub Actions | — | Build, test, push, deploy |
| **Cloud** | Google Cloud Run + GAR | — | Serverless container hosting |
| **Cloud DB** | Neon PostgreSQL | — | Serverless DB for production |
| **Cloud Kafka** | Aiven Apache Kafka | — | Managed Kafka for production |
| **Frontend Hosting** | Vercel | — | Frontend deployment |
| **Monitoring** | Prometheus + Grafana | — | Metrics collection & visualization |
| **Tracing** | Jaeger + OpenTelemetry | — | Distributed tracing |
| **Security Scan** | Trivy | — | Docker image vulnerability scanning |

### 4.2 Dependency Highlights

**Identity Service**: Spring Security, Spring OAuth2 Client, JJWT, Spring Mail, Spring Kafka, Spring Data Redis, Flyway, Micrometer + OpenTelemetry

**Core Service**: OpenFeign, Resilience4j Circuit Breaker, Spring Kafka, Cloudinary SDK, Spring Data Redis, Flyway, Micrometer + OpenTelemetry

**Gateway Service**: Spring Cloud Gateway (WebFlux), JJWT (validation only), Micrometer + OpenTelemetry

**AI Service**: FastAPI, LangChain, LangGraph, langchain-google-genai, httpx, sse-starlette

---

## 5. Deployment & CI/CD

### 5.1 Docker — Multi-stage Build

Mỗi Java service sử dụng multi-stage Dockerfile tối ưu:

`dockerfile
# Stage 1: Build với Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY common/pom.xml common/
# ... copy all module POMs for dependency caching
RUN mvn dependency:go-offline -B -q || true
COPY common/src common/src
COPY core-service/src core-service/src
RUN mvn clean package -pl core-service -am -DskipTests -B -q

# Stage 2: Runtime — JRE Alpine siêu nhẹ
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser  # ← Non-root user cho bảo mật
COPY --from=build /build/core-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
`

**Điểm nổi bật**: JRE Alpine (image nhỏ ~200MB), non-root user, dependency caching.

### 5.2 Docker Compose — 2 Chế Độ

| Chế độ | File | Dùng khi |
|:-------|:-----|:---------|
| Infra only | docker-compose.yml | Dev local — chạy service từ IDE |
| Full system | docker-compose.full.yml | Demo — toàn bộ chạy container |

**Infra stack**: 3 PostgreSQL + Redis + Redpanda + Redpanda Console + Jaeger + Prometheus + Grafana

### 5.3 CI/CD Pipeline — GitHub Actions

`mermaid
graph LR
    subgraph "Trigger: Push/PR"
        A[Push to main/dev/feature/*<br/>or PR to main]
    end
    
    subgraph "Job 1: Build & Test"
        B[Setup JDK 21 Temurin] --> C[mvn clean install]
    end
    
    subgraph "Job 2: Docker Build & Push"
        D[Build JAR per service] --> E[Docker Build<br/>Multi-stage] --> F[Push to GAR<br/>:latest + :sha]
    end
    
    subgraph "Job 3: Security Scan"
        G[Trivy vulnerability scan<br/>CRITICAL + HIGH]
    end
    
    subgraph "Job 4: Deploy"
        H[Deploy to<br/>Google Cloud Run]
    end
    
    A --> B
    C -->|"main/dev only"| D
    F --> G
    F --> H
`

**4 Jobs trong pipeline** (dẫn chứng: .github/workflows/ci-cd.yml):

1. **Build & Test** (mọi branch): JDK 21, Maven cache, mvn clean install
2. **Build & Push Docker** (main/dev): Matrix strategy cho 4 service → push to Google Artifact Registry
3. **Security Scan** (main only): Trivy scanner cho CRITICAL/HIGH vulnerabilities
4. **Deploy to Cloud Run** (main only): Deploy 4 service lên GCP Cloud Run (asia-southeast1)

### 5.4 Production Deployment Architecture

`mermaid
graph TB
    subgraph "Vercel"
        FE["Frontend<br/>React SPA"]
    end
    
    subgraph "Google Cloud Run (asia-southeast1)"
        GW2["gateway-service"]
        IS3["identity-service"]
        CS3["core-service"]
        SS3["social-service"]
    end
    
    subgraph "Neon (Serverless PostgreSQL)"
        DB1[("identity_db")]
        DB2[("core_db")]
        DB3[("social_db")]
    end
    
    subgraph "Aiven"
        AK["Apache Kafka<br/>SASL_SSL + SCRAM-SHA-512"]
    end
    
    FE -->|"HTTPS"| GW2
    GW2 --> IS3
    GW2 --> CS3
    GW2 --> SS3
    IS3 --> DB1
    CS3 --> DB2
    SS3 --> DB3
    IS3 --> AK
    CS3 --> AK
    SS3 --> AK
`

**Managed Services cho Production**:
- **Database**: Neon PostgreSQL (serverless, 3 databases riêng biệt)
- **Kafka**: Aiven Apache Kafka (Always Free Tier, SASL_SSL + SCRAM-SHA-512)
- **Frontend**: Vercel (auto-deploy từ Git)
- **Backend**: Google Cloud Run (serverless containers, auto-scale)
- **Container Registry**: Google Artifact Registry (asia-southeast1)

### 5.5 Kubernetes (Sẵn sàng cho scale)

Thư mục k8s/ chứa manifests cho từng service:
`
k8s/
├── identity-service/
│   ├── identity-deployment.yaml    # 2 replicas, health checks
│   ├── identity-service.yaml       # ClusterIP Service
│   └── configmap-identity.yaml     # Environment config
├── core-service/
├── gateway-service/
├── social-service/
├── redis/
└── secrets-template.yaml           # K8s Secrets template
`

**Features**: Liveness/Readiness probes (/actuator/health), ConfigMap cho env vars, Secret cho credentials (JWT, OAuth, Mail), namespace 	otoro.

---

## 6. Observability & Monitoring

### 6.1 Three Pillars of Observability

`mermaid
graph TB
    subgraph "Services"
        S1["identity-service"]
        S2["core-service"]
        S3["social-service"]
        S4["gateway-service"]
    end
    
    subgraph "Metrics (Prometheus)"
        S1 -->|"/actuator/prometheus"| P["Prometheus<br/>:9090"]
        S2 -->|"/actuator/prometheus"| P
        S3 -->|"/actuator/prometheus"| P
        S4 -->|"/actuator/prometheus"| P
        P --> G["Grafana<br/>:3001"]
    end
    
    subgraph "Tracing (Jaeger)"
        S1 -->|"OTLP"| J["Jaeger<br/>:16686"]
        S2 -->|"OTLP"| J
        S3 -->|"OTLP"| J
        S4 -->|"OTLP"| J
    end
`

| Pillar | Tool | Port | Chức năng |
|:-------|:-----|:-----|:---------|
| **Metrics** | Prometheus | :9090 | Scrape metrics từ /actuator/prometheus mỗi 15s |
| **Visualization** | Grafana | :3001 | Dashboard trực quan (pre-configured datasource) |
| **Tracing** | Jaeger | :16686 | Distributed tracing qua OpenTelemetry OTLP |

### 6.2 Logging Pattern
Mỗi service sử dụng structured logging format với trace correlation:
`
%5p [service-name, traceId, spanId]
`
Cho phép trace một request từ Gateway → Identity → Core → Social.

### 6.3 Health Checks
Tất cả service expose /actuator/health với show-details: always, được dùng cho:
- Docker Compose healthcheck (dependency ordering)
- K8s livenessProbe + eadinessProbe
- Grafana UP/DOWN monitoring

---

## Phụ Lục: Sơ Đồ ERD Tổng Quan (19 bảng)

| # | Entity | Module | Service |
|:--|:-------|:-------|:--------|
| 1 | users | Auth | identity-service |
| 2 | user_profiles | Auth | identity-service |
| 3 | listings | Listing | core-service |
| 4 | listing_images | Listing | core-service |
| 5 | listing_policies | Listing | core-service |
| 6 | listing_facilities | Listing | core-service |
| 7 | tags | Listing | core-service |
| 8 | listing_tags | Listing | core-service |
| 9 | saved_listings | Listing | core-service |
| 10 | reviews | Community | social-service |
| 11 | review_images | Community | social-service |
| 12 | reports | Community | social-service |
| 13 | roommate_profiles | Matching | social-service |
| 14 | roommate_swipes | Matching | social-service |
| 15 | roommate_matches | Matching | social-service |
| 16 | conversations | Chat | social-service |
| 17 | conversation_members | Chat | social-service |
| 18 | messages | Chat | social-service |
| 19 | notifications | Notification | social-service |
