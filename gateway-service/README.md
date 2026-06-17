# 🌉 Gateway Service

Gateway Service là cổng vào duy nhất (Single Entry Point) cho toàn bộ hệ thống Totoro Microservices. Nó sử dụng **Spring Cloud Gateway** để tiếp nhận, kiểm tra bảo mật và điều phối các yêu cầu từ Client đến các service phía dưới.

## ⚙️ Cấu Hình Cơ Bản
* **Cổng mặc định**: `8080`
* **Package gốc**: `com.totoro.gateway`

## 📋 Các Nhiệm Vụ Chính
1. **Routing Rules**: Ánh xạ các URI patterns đến các port của các microservices tương ứng.
2. **JWT Authentication Filter**:
   * Kiểm tra token JWT trong header `Authorization: Bearer <token>` của các request.
   * Nếu hợp lệ, tự động giải mã lấy `userId` và chèn vào header mới `X-User-Id` để forward cho downstream services. Điều này giúp các service phía sau không cần tốn thời gian xác thực lại token.
3. **CORS Configuration**: Cho phép các tên miền Frontend (React chạy ở localhost hoặc production domain) gọi API thông qua Gateway mà không bị lỗi chính sách nguồn gốc.
4. **Resilience4j Circuit Breaker**: Theo dõi trạng thái hoạt động của các service (ví dụ: identity, core) và trả về fallback nhanh chóng nếu service đó bị nghẽn hoặc sập.

## 🔀 Route Mapping Rules
* Path `/api/auth/**` & `/api/users/**` ➔ `identity-service` (`http://localhost:8081`)
* Path `/api/listings/**` & `/api/locations/**` ➔ `core-service` (`http://localhost:8082`)
* Path `/api/chat/**` & `/api/matching/**` & `/api/community/**` & `/api/notifications/**` ➔ `social-service` (`http://localhost:8083`)
