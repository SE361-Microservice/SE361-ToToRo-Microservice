# 💬 Social Service

Social Service quản lý tất cả các tính năng có tính tương tác xã hội cao giữa các người dùng bao gồm Nhận xét phòng trọ (Review), Báo cáo vi phạm (Report), Ghép phòng (Roommate Matching), Trò chuyện trực tuyến (Chat), và Hệ thống Thông báo (Notification).

## ⚙️ Cấu Hình Cơ Bản
* **Cổng mặc định**: `8083`
* **Package gốc**: `com.totoro.social`
* **Cơ sở dữ liệu**: `social_db` (local port `5435` hoặc dự án `totoro-social` trên Neon)

## 📋 Các Nghiệp Vụ Chính (Migrate từ Monolith)
1. Đánh giá chất lượng và phản hồi từ chủ trọ (Review & Comments).
2. Viết bài, bình luận và hỏi đáp trong cộng đồng khu vực (Community posts, Comments).
3. Đề xuất ghép phòng bằng AI và giao diện quẹt thẻ roommate (Roommate Profile, Swipe, Match).
4. Chat thời gian thực qua WebSocket & STOMP (Chat 1-1, Group Chat).
5. Gửi thông báo hệ thống qua email và in-app realtime (Notification).

## 📡 Kafka Consumers & Idempotency
* **Consumer** lắng nghe topic `listing-created` từ `core-service` để tự động tạo thông báo gửi tới những người theo dõi khu vực phòng đó.
* Sử dụng bảng `processed_event` làm cơ chế kiểm tra Idempotency tránh trùng lặp thông báo.
* Lắng nghe topic `user-updated` để đồng bộ tên & avatar vào bảng `user_cache` của Social Service, giúp hiển thị nhanh thông tin mà không cần gọi REST API sang Identity Service.
