-- seed_social_db.sql - Seed caches, reviews, reports, chat, roommate matching, community, and notifications in social_db
BEGIN;

TRUNCATE user_cache, listing_cache, reviews, review_images, review_sources, review_upvotes, reports, conversations, conversation_members, messages, community_posts, community_comments, community_likes, roommate_profiles, roommate_swipes, roommate_matches, notifications CASCADE;

-- 1. Seed user_cache (Must match users seeded in identity_db)
INSERT INTO user_cache (id, email, full_name, avatar_url) VALUES
(1,  'admin@totoro.com',      'Nguyen Quan Tri',    NULL),
(2,  'landlord1@totoro.com',  'Tran Van Hung',      NULL),
(3,  'landlord2@totoro.com',  'Le Thi Mai',         NULL),
(4,  'landlord3@totoro.com',  'Pham Duc Thang',     NULL),
(5,  'landlord4@totoro.com',  'Hoang Thi Lan',      NULL),
(6,  'landlord5@totoro.com',  'Ngo Van Tai',        NULL),
(7,  'landlord6@totoro.com',  'Do Minh Tuan',       NULL),
(8,  'landlord7@totoro.com',  'Vu Thi Huong',       NULL),
(9,  'landlord8@totoro.com',  'Bui Quoc Dung',      NULL),
(10, 'landlord9@totoro.com',  'Dinh Thi Yen',       NULL),
(11, 'landlord10@totoro.com', 'Ly Van Phong',       NULL),
(12, 'user1@totoro.com',      'Nguyen Van An',      NULL),
(13, 'user2@totoro.com',      'Tran Thi Binh',      NULL),
(14, 'user3@totoro.com',      'Le Hoang Cuong',     NULL),
(15, 'user4@totoro.com',      'Pham Thi Dung',      NULL),
(16, 'user5@totoro.com',      'Hoang Minh Duc',     NULL),
(17, 'user6@totoro.com',      'Ngo Thi Vy',         NULL),
(18, 'user7@totoro.com',      'Do Quoc Huy',        NULL),
(19, 'user8@totoro.com',      'Vu Thi Kim',         NULL),
(20, 'user9@totoro.com',      'Bui Van Long',       NULL),
(21, 'user10@totoro.com',     'Dinh Thanh Mai',     NULL),
(22, 'user11@totoro.com',     'Ly Thi Ngoc',        NULL),
(23, 'user12@totoro.com',     'Phan Van Phuc',      NULL),
(24, 'user13@totoro.com',     'Truong Thi Quynh',   NULL),
(25, 'user14@totoro.com',     'Cao Duc Tam',        NULL),
(26, 'user15@totoro.com',     'Duong Thi Uyen',     NULL),
(27, 'user16@totoro.com',     'Ho Van Vinh',        NULL),
(28, 'user17@totoro.com',     'Luong Thi Xuan',     NULL),
(29, 'user18@totoro.com',     'Mai Quoc Bao',       NULL),
(30, 'user19@totoro.com',     'To Thi Cam',         NULL);

-- 2. Seed listing_cache (Must match listings seeded in core_db)
INSERT INTO listing_cache (id, title, address) VALUES
(1, 'Phòng trọ tiện nghi gần ĐHQG', '12 Đường số 5, Linh Trung'),
(2, 'Căn hộ Studio mini Quận 10', '456 Tô Hiến Thành, Phường 14'),
(3, 'Phòng trọ giá rẻ cho SV Bách Khoa', '78/9 Lý Thường Kiệt'),
(4, 'Phòng gác lửng thoáng mát Bình Thạnh', '120 Điện Biên Phủ, Phường 15'),
(5, 'Căn hộ chung cư mini Quận 7', '789 Huỳnh Tấn Phát'),
(6, 'Phòng trọ ghép gần ĐH Tôn Đức Thắng', '15 Nguyễn Hữu Thọ'),
(7, 'Phòng trọ cao cấp Tân Bình', '30 Cộng Hòa, Phường 4'),
(8, 'Nhà nguyên căn nhỏ Phú Nhuận', '55 Nguyễn Kiệm'),
(9, 'Phòng trọ có ban công Gò Vấp', '320 Quang Trung, Phường 10'),
(10, 'Căn hộ Studio dịch vụ Quận 3', '150 Lê Văn Sỹ, Phường 10'),
(11, 'Phòng trọ gần ĐH Sư Phạm Kỹ Thuật', '5 Võ Văn Ngân'),
(12, 'Phòng trọ mini giá rẻ Thủ Đức', '45 Kha Vạn Cân'),
(13, 'Căn hộ dịch vụ tiện nghi Quận 1', '99 Nguyễn Trãi, Bến Thành'),
(14, 'Phòng trọ có gác sạch sẽ Quận 8', '88 Hưng Phú'),
(15, 'Nhà nguyên căn 2 lầu Bình Tân', '12 Đường số 1A'),
(16, 'Phòng trọ giá tốt Tân Phú', '34 Lũy Bán Bích'),
(17, 'Phòng trọ tiện nghi Hóc Môn', '50 Quốc Lộ 22'),
(18, 'Căn hộ chung cư mini Quận 12', '12 Lê Văn Khương'),
(19, 'Phòng trọ PENDING 1', '123 Cách Mạng Tháng 8'),
(20, 'Phòng trọ PENDING 2', '88 Võ Văn Ngân'),
(21, 'Căn hộ PENDING 3', '100 Nguyễn Văn Linh'),
(22, 'Phòng trọ PENDING 4', '33 Phan Xích Long'),
(23, 'Phòng trọ PENDING 5', '55 Thống Nhất'),
(24, 'Phòng trọ INACTIVE 1', '20 Lê Duẩn'),
(25, 'Phòng trọ INACTIVE 2', '33 Nguyễn Văn Cừ'),
(26, 'Căn hộ INACTIVE 3', '80 Hoàng Diệu'),
(27, 'Phòng trọ INACTIVE 4', '10 Bạch Đằng'),
(28, 'Phòng trọ REJECTED 1', '999 Xa Lộ Hà Nội'),
(29, 'Phòng trọ REJECTED 2', '1 Điện Biên Phủ'),
(30, 'Phòng trọ REJECTED 3', '45 Nguyễn Chí Thanh');

-- 3. Seed Reviews (diversity of ratings, landlord replies, dates)
INSERT INTO reviews (id, listing_id, user_id, rating_overall, rating_cleanliness, rating_security, rating_landlord, rating_accuracy, content, upvote_count, landlord_reply_content, landlord_replied_at, created_at, updated_at) VALUES
(1, 1, 12, 5, 5, 5, 5, 5, 'Phòng trọ rất sạch sẽ, chủ nhà cực kỳ thân thiện và chu đáo!', 10, 'Cảm ơn cháu đã ủng hộ cô chú nhé!', NOW() - INTERVAL '15 days', NOW() - INTERVAL '16 days', NOW()),
(2, 1, 13, 4, 4, 5, 4, 4, 'Vị trí thuận lợi đi học, tuy nhiên phòng hơi nóng vào buổi trưa.', 5, 'Bác sẽ xem xét lắp thêm rèm chống nắng cho ban công cháu nhé.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '11 days', NOW()),
(3, 2, 14, 5, 5, 4, 5, 5, 'Căn hộ studio rất sang xịn mịn, nội thất đầy đủ và cao cấp.', 8, NULL, NULL, NOW() - INTERVAL '20 days', NOW()),
(4, 3, 12, 3, 3, 2, 4, 3, 'Giá rẻ nhưng khu vực này hơi ồn ào vào ban đêm, cổng ngõ hơi chật.', 3, 'Cảm ơn góp ý của cháu, bác sẽ trao đổi lại với tổ dân phố để đảm bảo an ninh.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '9 days', NOW()),
(5, 3, 13, 4, 3, 4, 4, 4, 'Hợp túi tiền sinh viên, đi bộ ra trường Bách Khoa rất tiện.', 2, NULL, NULL, NOW() - INTERVAL '5 days', NOW()),
(6, 4, 15, 4, 4, 4, 5, 4, 'Gác lửng cao, không bị đụng đầu, phòng thoáng mát có gió tự nhiên.', 4, NULL, NULL, NOW() - INTERVAL '12 days', NOW()),
(7, 5, 16, 5, 5, 5, 5, 5, 'Căn hộ chung cư mini tuyệt vời, an ninh bảo vệ trực 24/7 rất an tâm.', 12, 'Cảm ơn bạn đã đánh giá tốt về dịch vụ chung cư.', NOW() - INTERVAL '22 days', NOW() - INTERVAL '23 days', NOW()),
(8, 7, 17, 4, 4, 4, 4, 4, 'Phòng đẹp y hình, khu trọ yên tĩnh phù hợp cho việc học và làm việc.', 1, NULL, NULL, NOW() - INTERVAL '6 days', NOW()),
(9, 9, 18, 5, 5, 4, 5, 5, 'Ban công rộng thoáng phơi đồ rất nhanh khô, camera an ninh đầy đủ.', 6, 'Cảm ơn em đã chia sẻ đánh giá tích cực.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW()),
(10, 10, 19, 5, 5, 5, 5, 5, 'Dịch vụ cao cấp, giặt giũ dọn dẹp hàng tuần rất sạch sẽ chuyên nghiệp.', 9, 'Rất hân hạnh được phục vụ quý khách.', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days', NOW()),
(11, 11, 20, 4, 4, 3, 4, 4, 'Gần trường SPKT nên đi học tiện lợi lắm, phòng ốc ổn áp.', 2, NULL, NULL, NOW() - INTERVAL '4 days', NOW()),
(12, 13, 21, 5, 5, 5, 4, 5, 'Căn hộ Q1 trung tâm đắt xắt ra miếng, tiện nghi đầy đủ không thiếu thứ gì.', 15, NULL, NULL, NOW() - INTERVAL '25 days', NOW()),
(13, 15, 22, 4, 4, 4, 4, 4, 'Nhà nguyên căn rộng rãi cho gia đình ở thoải mái, giá hợp lý.', 0, NULL, NULL, NOW() - INTERVAL '3 days', NOW()),
(14, 18, 23, 4, 3, 4, 4, 4, 'Chung cư mini ổn trong tầm giá, giờ giấc thoải mái.', 3, NULL, NULL, NOW() - INTERVAL '1 days', NOW()),
(15, 6, 24, 2, 2, 3, 2, 3, 'Tìm người ở ghép nhưng các bạn chung phòng hay làm ồn và không vệ sinh chung.', 7, 'Bác sẽ nhắc nhở các bạn trong phòng trật tự và giữ vệ sinh hơn.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days', NOW());

-- 4. Seed Review Images
INSERT INTO review_images (id, review_id, image_url) VALUES
(1, 1, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'),
(2, 3, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
(3, 7, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9'),
(4, 10, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36'),
(5, 12, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750');

-- 5. Seed Review Upvotes
INSERT INTO review_upvotes (id, review_id, user_id) VALUES
(1, 1, 13), (2, 1, 14), (3, 1, 15),
(4, 3, 12), (5, 3, 13),
(6, 7, 12), (7, 7, 13), (8, 7, 14), (9, 7, 15),
(10, 10, 12), (11, 10, 18),
(12, 12, 13), (13, 12, 14), (14, 12, 15);

-- 6. Seed Reports (Diverse target types: LISTING, REVIEW, USER)
INSERT INTO reports (id, reporter_id, target_type, target_id, reason, description, status, resolved_by, resolved_note, resolved_at, created_at, updated_at) VALUES
(1, 12, 'LISTING', 30, 'SPAM_OR_SCAM', 'Tin đăng có dấu hiệu lừa đảo bắt đặt cọc trước khi xem phòng.', 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL '5 days', NOW()),
(2, 13, 'USER', 2, 'HARASSMENT', 'Chủ nhà gọi điện đe dọa đòi tăng tiền phòng không đúng hợp đồng.', 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL '3 days', NOW()),
(3, 14, 'REVIEW', 15, 'INAPPROPRIATE_CONTENT', 'Đánh giá mang tính công kích cá nhân, xúc phạm chủ phòng trọ.', 'RESOLVED', 1, 'Đã kiểm tra và ẩn bình luận vi phạm.', NOW() - INTERVAL '1 days', NOW() - INTERVAL '4 days', NOW()),
(4, 15, 'LISTING', 29, 'WRONG_INFORMATION', 'Giá phòng đăng 20 triệu nhưng thực tế báo giá 25 triệu.', 'RESOLVED', 1, 'Yêu cầu chủ nhà sửa đổi thông tin chính xác.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 days', NOW()),
(5, 16, 'LISTING', 1, 'WRONG_INFORMATION', 'Phòng trọ đã cho thuê nhưng vẫn để trạng thái ACTIVE.', 'PENDING', NULL, NULL, NULL, NOW() - INTERVAL '1 days', NOW());

-- 7. Seed Chat Conversations & Messages
INSERT INTO conversations (id, name, type) VALUES
(1, 'Tran Van Hung & Nguyen Van An', 'DIRECT'),
(2, 'Le Thi Mai & Tran Thi Binh', 'DIRECT'),
(3, 'Group Tro KTX UIT', 'GROUP');

INSERT INTO conversation_members (id, conversation_id, user_id, is_admin) VALUES
(1, 1, 2, false),
(2, 1, 12, false),
(3, 2, 3, false),
(4, 2, 13, false),
(5, 3, 2, true),
(6, 3, 12, false),
(7, 3, 13, false),
(8, 3, 14, false);

INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_read, created_at) VALUES
(1, 1, 12, 'Chào bác Hùng, cháu muốn hẹn chiều nay xem phòng trọ ID 1 được không ạ?', 'TEXT', true, NOW() - INTERVAL '2 hours'),
(2, 1, 2, 'Chào cháu, chiều nay khoảng 5h bác có nhà nhé. Đến thì gọi bác.', 'TEXT', true, NOW() - INTERVAL '1 hours 50 minutes'),
(3, 1, 12, 'Dạ vâng cháu cảm ơn bác, chiều cháu qua ạ.', 'TEXT', false, NOW() - INTERVAL '1 hours 40 minutes'),
(4, 2, 13, 'Cô Mai ơi, phòng ID 3 còn phòng trống không cô?', 'TEXT', true, NOW() - INTERVAL '1 days'),
(5, 2, 3, 'Còn 1 phòng tầng trệt nha con, con muốn qua coi lúc nào nhắn cô.', 'TEXT', true, NOW() - INTERVAL '23 hours'),
(6, 3, 2, 'Thông báo: Group trọ KTX UIT đã được tạo.', 'TEXT', true, NOW() - INTERVAL '3 days'),
(7, 3, 12, 'Chào mọi người nha.', 'TEXT', true, NOW() - INTERVAL '2 days');

-- 8. Seed Roommate Profiles & Swipes
INSERT INTO roommate_profiles (id, user_id, bio, lifestyle_habits, budget_min, budget_max, preferred_districts, is_active) VALUES
(1, 12, 'Nam sinh viên UIT nam 3, hiền lành sạch sẽ, không hút thuốc.', 'Sạch sẽ, Thức khuya, Yên tĩnh', 1500000, 2500000, 'Thủ Đức, Quận 9', true),
(2, 13, 'Nữ sinh viên Bách Khoa, thích nấu ăn, hòa đồng.', 'Nấu ăn, Ngăn nắp, Thích nuôi thú cưng', 2000000, 3000000, 'Quận 10, Quận 11', true),
(3, 14, 'Nam sinh viên FPT, thích chơi game, thoải mái.', 'Giờ giấc tự do, Chơi game, Thích giao lưu', 2500000, 4000000, 'Quận 9, Thủ Đức, Bình Thạnh', true),
(4, 15, 'Nữ sinh viên UEH, hướng nội, cần tìm bạn nữ yên tĩnh.', 'Yên tĩnh, Sạch sẽ, Không tụ tập', 1800000, 2800000, 'Quận 3, Quận 10, Quận 5', true),
(5, 16, 'Nam sinh viên HCMUS, học ngành CNTT, ít nói.', 'Yên tĩnh, Thức khuya, Gọn gàng', 1500000, 2200000, 'Quận 5, Quận 10', true);

INSERT INTO roommate_swipes (id, swiper_id, target_id, is_liked) VALUES
(1, 12, 14, true),
(2, 14, 12, true),
(3, 12, 16, true),
(4, 16, 12, false),
(5, 13, 15, true);

INSERT INTO roommate_matches (id, user1_id, user2_id) VALUES
(1, 12, 14);

-- 9. Seed Community Posts & Comments
INSERT INTO community_posts (id, user_id, content, image_url, likes_count, comments_count) VALUES
(1, 12, 'Có ai học UIT cần tìm bạn ở ghép khu vực Thủ Đức gần trọ Linh Trung không ạ?', NULL, 5, 2),
(2, 13, 'Góc cảnh giác: Cẩn thận với các phòng trọ yêu cầu chuyển khoản cọc giữ chỗ trước khi xem phòng ở quận 10 nhé các bạn!', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 25, 4),
(3, 14, 'Review phòng trọ siêu xịn sò khu vực Bình Thạnh cho ae sinh viên nè.', NULL, 12, 0);

INSERT INTO community_comments (id, post_id, user_id, content) VALUES
(1, 1, 14, 'Mình cũng đang tìm nè bạn ơi, ib trao đổi tí nhé!'),
(2, 1, 16, 'Mình ké 1 slot ở ghép khu này với.'),
(3, 2, 12, 'Đúng rồi, mình suýt bị lừa 1 lần ở đường Lý Thường Kiệt.'),
(4, 2, 15, 'Cảm ơn bạn đã cảnh báo cho mọi người biết nha.');

INSERT INTO community_likes (post_id, user_id) VALUES
(1, 13), (1, 14), (1, 15), (1, 16), (1, 20),
(2, 12), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19), (2, 20);

-- 10. Seed Notifications
INSERT INTO notifications (id, user_id, title, content, type, related_id, is_read) VALUES
(1, 12, 'Đánh giá được phản hồi', 'Chủ nhà Tran Van Hung đã trả lời đánh giá của bạn.', 'REVIEW_REPLY', 1, false),
(2, 14, 'Yêu cầu ở ghép mới', 'Bạn có một lượt ghép cặp Roommate thành công với Nguyen Van An!', 'ROOMMATE_MATCH', 1, false),
(3, 2, 'Yêu cầu xem phòng', 'Bạn nhận được tin nhắn mới từ Nguyen Van An liên quan đến phòng trọ.', 'CHAT_MESSAGE', 1, false);

SELECT setval('conversations_id_seq', 3);
SELECT setval('conversation_members_id_seq', 8);
SELECT setval('messages_id_seq', 7);
SELECT setval('community_posts_id_seq', 3);
SELECT setval('community_comments_id_seq', 4);
SELECT setval('roommate_profiles_id_seq', 5);
SELECT setval('roommate_swipes_id_seq', 5);
SELECT setval('roommate_matches_id_seq', 1);
SELECT setval('notifications_id_seq', 3);
SELECT setval('reviews_id_seq', 15);
SELECT setval('review_images_id_seq', 5);
SELECT setval('review_upvotes_id_seq', 14);
SELECT setval('reports_id_seq', 5);

COMMIT;
