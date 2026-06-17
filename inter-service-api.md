# 📄 Inter-Service API Contract

Tài liệu này định nghĩa API contract cho việc giao tiếp nội bộ giữa các service (Internal Communication) và các chuẩn chung về định dạng dữ liệu, xử lý lỗi.

---

## 1. Nguyên Tắc Thiết Kế Chung
* **Giao thức**: HTTP/REST (sử dụng OpenFeign hoặc RestClient).
* **Định dạng dữ liệu**: JSON (UTF-8).
* **Bảo mật nội bộ**: Các API bắt đầu bằng `/internal/**` được cấu hình bypass qua Gateway đối với client ngoài, chỉ cho phép các service trong mạng nội bộ Docker/K8s gọi trực tiếp với nhau (Hoặc sử dụng một Shared Header/Secret `X-Internal-Token` để xác thực nếu đi qua public).
* **Timeout**: Mặc định connection timeout là `2000ms`, read timeout là `5000ms`.

---

## 2. API Contract từ Identity Service (`identity-service` :8081)

`identity-service` cung cấp thông tin người dùng và quyền truy cập cho `core-service` và `social-service`.

### 2.1 Lấy thông tin Profile chi tiết của một User
* **Endpoint**: `GET /internal/users/{userId}`
* **Headers**: `Accept: application/json`
* **Response (Success - 200 OK)**:
  ```json
  {
    "id": 1,
    "email": "student@hcmut.edu.vn",
    "fullName": "Nguyen Van A",
    "phone": "0987654321",
    "avatarUrl": "https://res.cloudinary.com/totoro/image/upload/avatar.jpg",
    "bio": "Sinh vien nam 3 tim ban ghep phong gan truong.",
    "university": "Đại học Bách Khoa",
    "role": "STUDENT"
  }
  ```
* **Response (Not Found - 404 Not Found)**:
  ```json
  {
    "status": 404,
    "error": "NOT_FOUND",
    "code": "USER_NOT_FOUND",
    "message": "User with id 1 was not found",
    "timestamp": "2026-06-17T12:00:00Z"
  }
  ```

### 2.2 Lấy danh sách Profile theo nhiều User ID (Batch Get)
* **Endpoint**: `POST /internal/users/batch`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  [1, 2, 3]
  ```
* **Response (Success - 200 OK)**:
  Trả về một Map với Key là `userId` (dạng chuỗi trong JSON, tự động deserialize thành Long trong Java) và Value là profile chi tiết.
  ```json
  {
    "1": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "avatarUrl": "https://res.cloudinary.com/totoro/avatar1.jpg",
      "role": "STUDENT"
    },
    "2": {
      "id": 2,
      "fullName": "Tran Thi B",
      "avatarUrl": "https://res.cloudinary.com/totoro/avatar2.jpg",
      "role": "STUDENT"
    }
  }
  ```

### 2.3 Kiểm tra User tồn tại
* **Endpoint**: `GET /internal/users/{userId}/exists`
* **Response (Success - 200 OK)**:
  ```json
  true
  ```
  *(hoặc `false` nếu không tồn tại)*

---

## 3. API Contract từ Core Service (`core-service` :8082)

`core-service` cung cấp thông tin về Listing (tin đăng phòng trọ) cho `social-service` để làm các tính năng như Reviews, Community, Reports, và Notifications.

### 3.1 Lấy thông tin Listing chi tiết
* **Endpoint**: `GET /internal/listings/{listingId}`
* **Response (Success - 200 OK)**:
  ```json
  {
    "id": 100,
    "landlordId": 12,
    "title": "Phòng trọ cao cấp 25m2 có gác lửng",
    "priceRent": 3500000,
    "address": "268 Lý Thường Kiệt, Quận 10, TP.HCM",
    "status": "ACTIVE"
  }
  ```
* **Response (Not Found - 404)**:
  ```json
  {
    "status": 404,
    "error": "NOT_FOUND",
    "code": "LISTING_NOT_FOUND",
    "message": "Listing with id 100 was not found",
    "timestamp": "2026-06-17T12:00:00Z"
  }
  ```

### 3.2 Kiểm tra Listing tồn tại
* **Endpoint**: `GET /internal/listings/{listingId}/exists`
* **Response (Success - 200 OK)**:
  ```json
  true
  ```

---

## 4. Định Dạng Lỗi Chuẩn (Standard Error Format)

Tất cả các service khi xảy ra lỗi phải trả về HTTP status tương ứng kèm theo body JSON định dạng thống nhất:

```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "code": "VALIDATION_FAILED",
  "message": "Thông tin đầu vào không hợp lệ",
  "timestamp": "2026-06-17T05:58:31Z",
  "path": "/api/auth/register",
  "details": [
    {
      "field": "email",
      "issue": "Email không đúng định dạng"
    }
  ]
}
```

### Danh sách mã lỗi (Error Codes) chung:

| HTTP Status | Error Code | Mô tả |
| :--- | :--- | :--- |
| 400 | `INVALID_INPUT` | Tham số gửi lên không đúng định dạng hoặc thiếu |
| 401 | `UNAUTHORIZED` | Token không hợp lệ, hết hạn hoặc không được cung cấp |
| 403 | `FORBIDDEN` | Người dùng không có quyền truy cập tài nguyên |
| 404 | `USER_NOT_FOUND` | Không tìm thấy User ID tương ứng |
| 404 | `LISTING_NOT_FOUND` | Không tìm thấy Listing tương ứng |
| 409 | `DUPLICATE_RESOURCE` | Tài nguyên đã tồn tại (ví dụ: email đã đăng ký) |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi không xác định hệ thống |
| 503 | `SERVICE_UNAVAILABLE` | Service đích bị down hoặc nghẽn (Circuit Breaker kích hoạt) |
