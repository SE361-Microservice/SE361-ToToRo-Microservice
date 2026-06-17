# 🏠 Core Service

Core Service chịu trách nhiệm xử lý các logic cốt lõi liên quan đến phòng trọ (Listing), tìm kiếm nâng cao, bộ lọc, chính sách phòng trọ, lưu tin yêu thích, và định vị/bản đồ (Location).

## ⚙️ Cấu Hình Cơ Bản
* **Cổng mặc định**: `8082`
* **Package gốc**: `com.totoro.core`
* **Cơ sở dữ liệu**: `core_db` (local port `5434` hoặc dự án `totoro-core` trên Neon)

## 📋 Các Nghiệp Vụ Chính (Migrate từ Monolith)
1. Tạo/Sửa/Xóa tin đăng phòng trọ (Listing CRUD).
2. Lưu tin yêu thích (Saved Listings).
3. Quản lý chi tiết nội thất, tiện ích tòa nhà và chính sách quy định (Policies, Facilities).
4. Định vị tọa độ địa lý và tính toán khoảng cách đến các trường đại học (Location).

## 🔗 Client Calls (Gọi sang Identity Service)
Sử dụng **OpenFeign** (`UserServiceClient`) gọi trực tiếp tới `http://localhost:8081` để kiểm tra sự tồn tại của người dùng và lấy thông tin chủ trọ hiển thị kèm Listing.

## 📦 Event Sourcing / Outbox Pattern
* Bảng `outbox_event` dùng để đảm bảo tính toàn vẹn dữ liệu khi ghi vào DB và gửi message lên Kafka.
* Lịch trình `@Scheduled` quét định kỳ gửi event `listing-created` sang Kafka.
