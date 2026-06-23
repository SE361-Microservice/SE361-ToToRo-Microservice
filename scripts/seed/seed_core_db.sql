-- seed_core_db.sql - Seed 30 listings with diverse statuses, policies, facilities, and tags
BEGIN;

TRUNCATE listings, tags, listing_tags, listing_policies, listing_facilities, listing_images, saved_listings CASCADE;

-- Seed Tags
INSERT INTO tags (id, name, slug) VALUES
(1, 'Gần trường học', 'gan-truong-hoc'),
(2, 'Cho nuôi thú cưng', 'cho-nuoi-thu-cung'),
(3, 'Có ban công', 'co-ban-cong'),
(4, 'Giờ giấc tự do', 'gio-giac-tu-do'),
(5, 'Máy giặt riêng', 'may-giat-rieng'),
(6, 'Giá rẻ sinh viên', 'gia-re-sinh-vien'),
(7, 'An ninh 24/7', 'an-ninh-247'),
(8, 'Full nội thất', 'full-noi-that');

-- Seed 30 Listings (assigned to landlords with IDs 2 to 11)
-- Statuses: PENDING, ACTIVE, INACTIVE, REJECTED
INSERT INTO listings (id, title, description, address, district, city, latitude, longitude, room_type, area_m2, price_rent, price_electricity, price_water, price_management, price_parking, status, is_shared_owner, max_occupants, available_from, landlord_id, created_at, updated_at) VALUES
(1, 'Phòng trọ tiện nghi gần ĐHQG', 'Phòng thoáng mát rộng rãi, an ninh tốt, gần ĐHQG HCM.', '12 Đường số 5, Linh Trung', 'Thủ Đức', 'Hồ Chí Minh', 10.8712, 106.7901, 'SINGLE', 20.00, 2500000, 3500, 15000, 50000, 100000, 'ACTIVE', false, 2, '2026-06-01', 2, NOW() - INTERVAL '30 days', NOW()),
(2, 'Căn hộ Studio mini Quận 10', 'Căn hộ dịch vụ tiện nghi đầy đủ nội thất, giờ giấc tự do.', '456 Tô Hiến Thành, Phường 14', 'Quận 10', 'Hồ Chí Minh', 10.7765, 106.6621, 'STUDIO', 30.00, 5500000, 4000, 20000, 100000, 150000, 'ACTIVE', true, 3, '2026-06-10', 2, NOW() - INTERVAL '29 days', NOW()),
(3, 'Phòng trọ giá rẻ cho SV Bách Khoa', 'Phòng trọ sinh viên bình dân giá rẻ gần ĐH Bách Khoa.', '78/9 Lý Thường Kiệt', 'Quận 10', 'Hồ Chí Minh', 10.7731, 106.6598, 'SINGLE', 15.00, 1800000, 3200, 12000, 30000, 80000, 'ACTIVE', false, 2, '2026-06-05', 3, NOW() - INTERVAL '28 days', NOW()),
(4, 'Phòng gác lửng thoáng mát Bình Thạnh', 'Phòng rộng rãi có gác lửng đúc sạch sẽ, khu an ninh.', '120 Điện Biên Phủ, Phường 15', 'Bình Thạnh', 'Hồ Chí Minh', 10.7995, 106.7082, 'MEZZANINE', 25.00, 3200000, 3500, 15000, 50000, 100000, 'ACTIVE', false, 3, '2026-06-15', 3, NOW() - INTERVAL '27 days', NOW()),
(5, 'Căn hộ chung cư mini Quận 7', 'Căn hộ mini lầu cao, view đẹp, bảo vệ 24/7.', '789 Huỳnh Tấn Phát', 'Quận 7', 'Hồ Chí Minh', 10.7325, 106.7321, 'ENTIRE_APARTMENT', 35.00, 6000000, 3800, 18000, 150000, 120000, 'ACTIVE', true, 4, '2026-06-20', 4, NOW() - INTERVAL '26 days', NOW()),
(6, 'Phòng trọ ghép gần ĐH Tôn Đức Thắng', 'Tìm người ở ghép phòng nam rộng rãi đầy đủ đồ dùng.', '15 Nguyễn Hữu Thọ', 'Quận 7', 'Hồ Chí Minh', 10.7320, 106.6985, 'SHARED', 22.00, 1500000, 3500, 15000, 40000, 90000, 'ACTIVE', false, 4, '2026-06-01', 4, NOW() - INTERVAL '25 days', NOW()),
(7, 'Phòng trọ cao cấp Tân Bình', 'Phòng sạch sẽ yên tĩnh thích hợp cho người đi làm.', '30 Cộng Hòa, Phường 4', 'Tân Bình', 'Hồ Chí Minh', 10.8012, 106.6521, 'SINGLE', 28.00, 4000000, 3500, 15000, 60000, 100000, 'ACTIVE', false, 2, '2026-06-05', 5, NOW() - INTERVAL '24 days', NOW()),
(8, 'Nhà nguyên căn nhỏ Phú Nhuận', 'Nhà nguyên căn 1 trệt 1 lầu hẻm xe hơi yên tĩnh.', '55 Nguyễn Kiệm', 'Phú Nhuận', 'Hồ Chí Minh', 10.8095, 106.6795, 'ENTIRE_HOUSE', 60.00, 12000000, 3000, 10000, 0, 0, 'ACTIVE', false, 6, '2026-06-01', 5, NOW() - INTERVAL '23 days', NOW()),
(9, 'Phòng trọ có ban công Gò Vấp', 'Phòng trọ có ban công phơi đồ thoáng mát, camera an ninh.', '320 Quang Trung, Phường 10', 'Gò Vấp', 'Hồ Chí Minh', 10.8354, 106.6624, 'SINGLE', 18.00, 2200000, 3500, 15000, 30000, 70000, 'ACTIVE', false, 2, '2026-06-12', 6, NOW() - INTERVAL '22 days', NOW()),
(10, 'Căn hộ Studio dịch vụ Quận 3', 'Căn hộ mới xây đầy đủ tiện nghi nội thất cao cấp.', '150 Lê Văn Sỹ, Phường 10', 'Quận 3', 'Hồ Chí Minh', 10.7915, 106.6745, 'STUDIO', 32.00, 7500000, 4000, 20000, 200000, 150000, 'ACTIVE', true, 2, '2026-06-01', 6, NOW() - INTERVAL '21 days', NOW()),
(11, 'Phòng trọ gần ĐH Sư Phạm Kỹ Thuật', 'Phòng rộng thoáng mát có bếp nấu ăn riêng.', '5 Võ Văn Ngân', 'Thủ Đức', 'Hồ Chí Minh', 10.8512, 106.7721, 'SINGLE', 20.00, 2800000, 3500, 15000, 50000, 80000, 'ACTIVE', false, 2, '2026-06-01', 7, NOW() - INTERVAL '20 days', NOW()),
(12, 'Phòng trọ mini giá rẻ Thủ Đức', 'Phòng phù hợp sinh viên học sinh ở 1-2 người.', '45 Kha Vạn Cân', 'Thủ Đức', 'Hồ Chí Minh', 10.8542, 106.7585, 'SINGLE', 12.00, 1600000, 3200, 12000, 30000, 60000, 'ACTIVE', false, 2, '2026-06-10', 7, NOW() - INTERVAL '19 days', NOW()),
(13, 'Căn hộ dịch vụ tiện nghi Quận 1', 'Căn hộ trung tâm Q.1 sang trọng tiện đi lại làm việc.', '99 Nguyễn Trãi, Bến Thành', 'Quận 1', 'Hồ Chí Minh', 10.7712, 106.6901, 'STUDIO', 45.00, 15000000, 4500, 25000, 300000, 250000, 'ACTIVE', true, 2, '2026-06-01', 8, NOW() - INTERVAL '18 days', NOW()),
(14, 'Phòng trọ có gác sạch sẽ Quận 8', 'Khu phòng trọ mới sơn lại, có camera giám sát cửa.', '88 Hưng Phú', 'Quận 8', 'Hồ Chí Minh', 10.7485, 106.6712, 'MEZZANINE', 22.00, 2700000, 3500, 15000, 40000, 80000, 'ACTIVE', false, 3, '2026-06-15', 8, NOW() - INTERVAL '17 days', NOW()),
(15, 'Nhà nguyên căn 2 lầu Bình Tân', 'Nhà nguyên căn phù hợp hộ gia đình nhỏ ở lâu dài.', '12 Đường số 1A', 'Bình Tân', 'Hồ Chí Minh', 10.7412, 106.6021, 'ENTIRE_HOUSE', 80.00, 8500000, 3000, 10000, 0, 0, 'ACTIVE', false, 5, '2026-06-01', 9, NOW() - INTERVAL '16 days', NOW()),
(16, 'Phòng trọ giá tốt Tân Phú', 'Phòng trọ sạch sẽ có wc riêng, gần chợ.', '34 Lũy Bán Bích', 'Tân Phú', 'Hồ Chí Minh', 10.7785, 106.6231, 'SINGLE', 18.00, 2300000, 3500, 15000, 30000, 80000, 'ACTIVE', false, 2, '2026-06-05', 9, NOW() - INTERVAL '15 days', NOW()),
(17, 'Phòng trọ tiện nghi Hóc Môn', 'Phòng rộng mát mẻ yên tĩnh, an ninh cực tốt.', '50 Quốc Lộ 22', 'Hóc Môn', 'Hồ Chí Minh', 10.8812, 106.5921, 'SINGLE', 25.00, 1500000, 3000, 10000, 20000, 50000, 'ACTIVE', false, 3, '2026-06-01', 10, NOW() - INTERVAL '14 days', NOW()),
(18, 'Căn hộ chung cư mini Quận 12', 'Chung cư mini an ninh, giờ giấc tự do phù hợp SV.', '12 Lê Văn Khương', 'Quận 12', 'Hồ Chí Minh', 10.8652, 106.6621, 'ENTIRE_APARTMENT', 40.00, 4200000, 3500, 15000, 80000, 100000, 'ACTIVE', true, 3, '2026-06-15', 10, NOW() - INTERVAL '13 days', NOW()),
(19, 'Phòng trọ PENDING 1', 'Phòng trọ đang chờ duyệt.', '123 Cách Mạng Tháng 8', 'Quận 3', 'Hồ Chí Minh', 10.7812, 106.6781, 'SINGLE', 20.00, 3000000, 3500, 15000, 50000, 80000, 'PENDING', false, 2, '2026-07-01', 11, NOW() - INTERVAL '2 days', NOW()),
(20, 'Phòng trọ PENDING 2', 'Phòng trọ đang chờ duyệt khu Thủ Đức.', '88 Võ Văn Ngân', 'Thủ Đức', 'Hồ Chí Minh', 10.8521, 106.7712, 'SINGLE', 18.00, 2500000, 3500, 15000, 40000, 70000, 'PENDING', false, 2, '2026-07-01', 2, NOW() - INTERVAL '2 days', NOW()),
(21, 'Căn hộ PENDING 3', 'Căn hộ chung cư mini chờ duyệt.', '100 Nguyễn Văn Linh', 'Quận 7', 'Hồ Chí Minh', 10.7285, 106.7112, 'ENTIRE_APARTMENT', 35.00, 5000000, 3500, 15000, 80000, 100000, 'PENDING', true, 3, '2026-07-01', 3, NOW() - INTERVAL '2 days', NOW()),
(22, 'Phòng trọ PENDING 4', 'Phòng trọ gác lửng đang chờ duyệt.', '33 Phan Xích Long', 'Phú Nhuận', 'Hồ Chí Minh', 10.7981, 106.6872, 'MEZZANINE', 22.00, 3500000, 3500, 15000, 50000, 100000, 'PENDING', false, 2, '2026-07-01', 4, NOW() - INTERVAL '1 days', NOW()),
(23, 'Phòng trọ PENDING 5', 'Phòng trọ giá rẻ đang chờ duyệt.', '55 Thống Nhất', 'Gò Vấp', 'Hồ Chí Minh', 10.8412, 106.6712, 'SINGLE', 15.00, 1900000, 3200, 12000, 30000, 60000, 'PENDING', false, 2, '2026-07-01', 5, NOW() - INTERVAL '1 days', NOW()),
(24, 'Phòng trọ INACTIVE 1', 'Phòng trọ tạm ngưng cho thuê.', '20 Lê Duẩn', 'Quận 1', 'Hồ Chí Minh', 10.7812, 106.6981, 'SINGLE', 25.00, 4500000, 3500, 15000, 50000, 100000, 'INACTIVE', false, 2, '2026-05-01', 6, NOW() - INTERVAL '40 days', NOW()),
(25, 'Phòng trọ INACTIVE 2', 'Phòng trọ tạm ngưng cho thuê do sửa chữa.', '33 Nguyễn Văn Cừ', 'Quận 5', 'Hồ Chí Minh', 10.7581, 106.6781, 'SINGLE', 20.00, 3000000, 3500, 15000, 40000, 80000, 'INACTIVE', false, 2, '2026-05-15', 7, NOW() - INTERVAL '35 days', NOW()),
(26, 'Căn hộ INACTIVE 3', 'Căn hộ studio ngưng hoạt động.', '80 Hoàng Diệu', 'Quận 4', 'Hồ Chí Minh', 10.7612, 106.7021, 'STUDIO', 30.00, 5500000, 3800, 18000, 100000, 120000, 'INACTIVE', true, 2, '2026-05-01', 8, NOW() - INTERVAL '45 days', NOW()),
(27, 'Phòng trọ INACTIVE 4', 'Phòng trọ ngưng hoạt động khu Bình Thạnh.', '10 Bạch Đằng', 'Bình Thạnh', 'Hồ Chí Minh', 10.8012, 106.7081, 'SINGLE', 18.00, 2200000, 3500, 15000, 30000, 70000, 'INACTIVE', false, 2, '2026-05-01', 9, NOW() - INTERVAL '50 days', NOW()),
(28, 'Phòng trọ REJECTED 1', 'Phòng trọ bị từ chối duyệt do địa chỉ sai.', '999 Xa Lộ Hà Nội', 'Thủ Đức', 'Hồ Chí Minh', 10.8512, 106.8021, 'SINGLE', 20.00, 2500000, 3500, 15000, 50000, 80000, 'REJECTED', false, 2, '2026-06-01', 10, NOW() - INTERVAL '15 days', NOW()),
(29, 'Phòng trọ REJECTED 2', 'Phòng trọ bị từ chối duyệt do giá quá cao.', '1 Điện Biên Phủ', 'Quận 1', 'Hồ Chí Minh', 10.7812, 106.7012, 'SINGLE', 30.00, 20000000, 4000, 20000, 100000, 150000, 'REJECTED', false, 2, '2026-06-01', 11, NOW() - INTERVAL '12 days', NOW()),
(30, 'Phòng trọ REJECTED 3', 'Phòng trọ bị từ chối duyệt do thiếu giấy tờ.', '45 Nguyễn Chí Thanh', 'Quận 5', 'Hồ Chí Minh', 10.7581, 106.6645, 'SINGLE', 18.00, 2800000, 3500, 15000, 40000, 80000, 'REJECTED', false, 2, '2026-06-01', 2, NOW() - INTERVAL '10 days', NOW());

-- Seed Listing Policies (using newly added columns in V3)
INSERT INTO listing_policies (id, listing_id, deposit_months, contract_type, allows_residence_reg, checkin_time, checkout_time, allows_guests, allows_pets, allows_cooking, referral_policy, other_rules) VALUES
(1, 1, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, 'Khách giới thiệu được giảm 100k tháng đầu.', 'Không làm ồn sau 22h.'),
(2, 2, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Giữ gìn vệ sinh chung, không tụ tập đông người.'),
(3, 3, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Khóa cổng xe sau 23h.'),
(4, 4, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Không để xe bừa bãi.'),
(5, 5, 2, 'YEARLY', true, '14:00:00', '12:00:00', true, true, true, 'Hợp đồng 1 năm tặng 1 tháng wifi.', 'Đăng ký thông tin khách tạm trú.'),
(6, 6, 1, 'MONTHLY', false, '12:00:00', '12:00:00', false, false, true, NULL, 'Giờ giấc tự do nhưng cần giữ trật tự.'),
(7, 7, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Không nuôi chó mèo.'),
(8, 8, 3, 'YEARLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Tự quản lý tài sản cá nhân.'),
(9, 9, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Hạn chế bạn bè ngủ lại quá 2 đêm/tuần.'),
(10, 10, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Tôn trọng không gian chung.'),
(11, 11, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Không hút thuốc trong phòng.'),
(12, 12, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, false, NULL, 'Không nấu ăn bằng gas (chỉ dùng bếp điện).'),
(13, 13, 3, 'YEARLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Khai báo tạm trú đầy đủ.'),
(14, 14, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Để xe đúng vị trí quy định.'),
(15, 15, 2, 'YEARLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Sử dụng đúng mục đích thuê nhà ở.'),
(16, 16, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Đóng cửa cổng trước 23h30.'),
(17, 17, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Không tụ tập cờ bạc, rượu chè.'),
(18, 18, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Bảo quản tốt cơ sở vật chất.'),
(19, 19, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(20, 20, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(21, 21, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Quy định nội bộ.'),
(22, 22, 1, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(23, 23, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(24, 24, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(25, 25, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(26, 26, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, true, true, NULL, 'Quy định nội bộ.'),
(27, 27, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(28, 28, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(29, 29, 2, 'MONTHLY', true, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.'),
(30, 30, 1, 'MONTHLY', false, '14:00:00', '12:00:00', true, false, true, NULL, 'Quy định nội bộ.');

-- Seed Listing Facilities (using columns in V4)
INSERT INTO listing_facilities (id, listing_id, facility_type, name, is_included, note) VALUES
(1, 1, 'WIFI', 'Internet tốc độ cao', true, 'Đã bao gồm trong giá phòng'),
(2, 1, 'AC', 'Máy lạnh Inverter', true, NULL),
(3, 1, 'BED', 'Giường nệm', true, NULL),
(4, 2, 'AC', 'Máy lạnh', true, NULL),
(5, 2, 'BED', 'Giường tủ gỗ cao cấp', true, NULL),
(6, 2, 'KITCHEN', 'Bếp nấu ăn riêng', true, NULL),
(7, 3, 'WIFI', 'Wifi dùng chung', true, 'Cước chia đều đầu người'),
(8, 4, 'BED', 'Giường ngủ gác lửng', true, NULL),
(9, 4, 'AC', 'Máy lạnh Daikin', true, NULL),
(10, 5, 'SECURITY', 'Bảo vệ camera giám sát', true, 'Phí quản lý bao gồm bảo vệ'),
(11, 7, 'AC', 'Điều hòa không khí', true, NULL),
(12, 9, 'BALCONY', 'Ban công đón gió', true, NULL),
(13, 10, 'BED', 'Giường nệm cao cấp', true, NULL),
(14, 11, 'KITCHEN', 'Khu vực bếp nấu', true, NULL),
(15, 13, 'WIFI', 'Internet cáp quang', true, NULL),
(16, 13, 'AC', 'Máy lạnh 2 HP', true, NULL),
(17, 13, 'BED', 'Giường nệm King size', true, NULL),
(18, 13, 'FRIDGE', 'Tủ lạnh LG', true, NULL),
(19, 15, 'GARAGE', 'Sân để xe máy rộng', true, NULL),
(20, 18, 'AC', 'Điều hòa', true, NULL);

-- Seed Listing Images (using columns in V4)
INSERT INTO listing_images (id, listing_id, url, is_cover, sort_order, created_at) VALUES
(1, 1, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', true, 0, NOW()),
(2, 1, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c', false, 1, NOW()),
(3, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', true, 0, NOW()),
(4, 3, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', true, 0, NOW()),
(5, 4, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', true, 0, NOW()),
(6, 5, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9', true, 0, NOW()),
(7, 7, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', true, 0, NOW()),
(8, 9, 'https://images.unsplash.com/photo-1484154218962-a197022b5858', true, 0, NOW()),
(9, 10, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36', true, 0, NOW()),
(10, 11, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', true, 0, NOW()),
(11, 13, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', true, 0, NOW()),
(12, 15, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', true, 0, NOW()),
(13, 17, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', true, 0, NOW()),
(14, 18, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', true, 0, NOW());

-- Seed Listing Tags mapping
INSERT INTO listing_tags (listing_id, tag_id) VALUES
(1, 1), (1, 6),
(2, 3), (2, 4), (2, 8),
(3, 1), (3, 6),
(4, 4), (4, 5),
(5, 7), (5, 8),
(6, 6),
(7, 7),
(9, 3), (9, 7),
(10, 4), (10, 8),
(11, 1), (11, 4),
(12, 6),
(13, 3), (13, 4), (13, 7), (13, 8),
(15, 2),
(18, 4), (18, 6);

-- Seed Saved Listings (users 12 to 30)
INSERT INTO saved_listings (id, user_id, listing_id, created_at) VALUES
(1, 12, 1, NOW()),
(2, 12, 2, NOW()),
(3, 13, 1, NOW()),
(4, 13, 3, NOW()),
(5, 14, 2, NOW()),
(6, 15, 5, NOW()),
(7, 16, 1, NOW()),
(8, 17, 7, NOW()),
(9, 18, 10, NOW()),
(10, 19, 9, NOW()),
(11, 20, 11, NOW()),
(12, 21, 13, NOW()),
(13, 22, 1, NOW()),
(14, 23, 2, NOW()),
(15, 24, 3, NOW());

SELECT setval('listings_id_seq', 30);
SELECT setval('tags_id_seq', 8);
SELECT setval('listing_policies_id_seq', 30);
SELECT setval('listing_facilities_id_seq', 20);
SELECT setval('listing_images_id_seq', 14);
SELECT setval('saved_listings_id_seq', 15);

COMMIT;
