# 🔐 Identity Service

Identity Service chịu trách nhiệm quản lý đăng ký, đăng nhập, phân quyền người dùng (STUDENT, LANDLORD, ADMIN), và hồ sơ cá nhân (User Profile).

## ⚙️ Cấu Hình Cơ Bản
* **Cổng mặc định**: `8081`
* **Package gốc**: `com.totoro.identity`
* **Cơ sở dữ liệu**: `identity_db` (local port `5433` hoặc dự án `totoro-identity` trên Neon)

## 📋 Các Nghiệp Vụ Chính (Migrate từ Monolith)
1. Đăng ký & Đăng nhập truyền thống (Email + Mật khẩu mã hóa BCrypt).
2. Đăng nhập nhanh qua bên thứ ba (Google OAuth2).
3. Cấp phát và quản lý vòng đời của JWT Access Token & Refresh Token.
4. CRUD Profile người dùng (Avatar, Họ tên, trường đại học, số điện thoại).

## 🔗 Internal APIs Exposed (cho Core & Social gọi)
* `GET /internal/users/{userId}` -> Trả về DTO Profile chi tiết.
* `POST /internal/users/batch` -> Trả về Map của danh sách Profiles.
* `GET /internal/users/{userId}/exists` -> Trả về boolean kiểm tra sự tồn tại.

## 📡 Kafka Events Published
* Topic `user-updated` -> Gửi sự kiện khi người dùng cập nhật thông tin cá nhân.
