-- seed_identity_db.sql - Seed 30 users (1 ADMIN, 10 LANDLORD, 19 USER)
-- Password for ALL users: Test@1234

BEGIN;

TRUNCATE users CASCADE;

-- BCrypt hash of "Test@1234"
-- $2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK

INSERT INTO users (id, email, password_hash, role, provider, is_verified, is_blocked, created_at, updated_at) VALUES
(1,  'admin@totoro.com',      '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'ADMIN',    'LOCAL', true,  false, NOW() - INTERVAL '90 days', NOW()),
(2,  'landlord1@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '85 days', NOW()),
(3,  'landlord2@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '80 days', NOW()),
(4,  'landlord3@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '75 days', NOW()),
(5,  'landlord4@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '70 days', NOW()),
(6,  'landlord5@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '65 days', NOW()),
(7,  'landlord6@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '60 days', NOW()),
(8,  'landlord7@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '55 days', NOW()),
(9,  'landlord8@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '50 days', NOW()),
(10, 'landlord9@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '45 days', NOW()),
(11, 'landlord10@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'LANDLORD', 'LOCAL', true,  false, NOW() - INTERVAL '40 days', NOW()),
(12, 'user1@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '38 days', NOW()),
(13, 'user2@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '36 days', NOW()),
(14, 'user3@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '34 days', NOW()),
(15, 'user4@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '32 days', NOW()),
(16, 'user5@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '30 days', NOW()),
(17, 'user6@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '28 days', NOW()),
(18, 'user7@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '26 days', NOW()),
(19, 'user8@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '24 days', NOW()),
(20, 'user9@totoro.com',  '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '22 days', NOW()),
(21, 'user10@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '20 days', NOW()),
(22, 'user11@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '18 days', NOW()),
(23, 'user12@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '16 days', NOW()),
(24, 'user13@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '14 days', NOW()),
(25, 'user14@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '12 days', NOW()),
(26, 'user15@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  false, NOW() - INTERVAL '10 days', NOW()),
(27, 'user16@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', true,  true,  NOW() - INTERVAL '8 days',  NOW()),
(28, 'user17@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', false, false, NOW() - INTERVAL '6 days',  NOW()),
(29, 'user18@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', false, false, NOW() - INTERVAL '4 days',  NOW()),
(30, 'user19@totoro.com', '$2a$10$f1q5FYVTnOL4x6LZuYzzdeszF9CtCObFnLXquiZwZS9O63J3GAqRK', 'USER', 'LOCAL', false, false, NOW() - INTERVAL '2 days',  NOW());

INSERT INTO user_profiles (id, user_id, full_name, phone, avatar_url, bio, university) VALUES
(1,  1,  'Nguyen Quan Tri',    '0900000001', NULL, 'Admin he thong ToToRo',                    'UIT'),
(2,  2,  'Tran Van Hung',      '0900000002', NULL, 'Chu tro 10 nam kinh nghiem tai Q.10',      NULL),
(3,  3,  'Le Thi Mai',         '0900000003', NULL, 'Cho thue phong tro gia re khu Thu Duc',    NULL),
(4,  4,  'Pham Duc Thang',     '0900000004', NULL, 'Chu nha tai Phu Nhuan, phong moi xay',     NULL),
(5,  5,  'Hoang Thi Lan',      '0900000005', NULL, 'Cho thue can ho mini Binh Thanh',          NULL),
(6,  6,  'Ngo Van Tai',        '0900000006', NULL, 'Phong tro sinh vien gia tot',              NULL),
(7,  7,  'Do Minh Tuan',       '0900000007', NULL, 'Chu tro khu Tan Binh, gan san bay',        NULL),
(8,  8,  'Vu Thi Huong',       '0900000008', NULL, 'Cho thue phong Go Vap, Phu Nhuan',        NULL),
(9,  9,  'Bui Quoc Dung',      '0900000009', NULL, 'Phong cho thue khu Q.7, Q.8',             NULL),
(10, 10, 'Dinh Thi Yen',       '0900000010', NULL, 'Can ho dich vu cao cap Q.1, Q.3',         NULL),
(11, 11, 'Ly Van Phong',       '0900000011', NULL, 'Phong tro gia re cho sinh vien',           NULL),
(12, 12, 'Nguyen Van An',      '0911000001', NULL, 'Sinh vien nam 3 UIT, tim phong Q.Thu Duc', 'UIT'),
(13, 13, 'Tran Thi Binh',      '0911000002', NULL, 'Sinh vien HCMUT, can phong gan truong',    'HCMUT'),
(14, 14, 'Le Hoang Cuong',     '0911000003', NULL, 'SV FPT, thich phong co wifi manh',         'FPT'),
(15, 15, 'Pham Thi Dung',      '0911000004', NULL, 'Sinh vien UEH nam 2',                     'UEH'),
(16, 16, 'Hoang Minh Duc',     '0911000005', NULL, 'SV HCMUS, tim phong gia re',               'HCMUS'),
(17, 17, 'Ngo Thi Vy',         '0911000006', NULL, 'Sinh vien HUTECH, can ban o ghep',         'HUTECH'),
(18, 18, 'Do Quoc Huy',        '0911000007', NULL, 'SV RMIT, budget 5-8 trieu',                'RMIT'),
(19, 19, 'Vu Thi Kim',         '0911000008', NULL, 'Sinh vien TDT, tim phong Go Vap',         'TDT'),
(20, 20, 'Bui Van Long',       '0911000009', NULL, 'SV UIT nam cuoi, can phong yen tinh',      'UIT'),
(21, 21, 'Dinh Thanh Mai',     '0911000010', NULL, 'Sinh vien HCMUT, tim phong Binh Thanh',    'HCMUT'),
(22, 22, 'Ly Thi Ngoc',        '0911000011', NULL, 'SV FPT, thich phong co bep',               'FPT'),
(23, 23, 'Phan Van Phuc',      '0911000012', NULL, 'Sinh vien UEH Q.3',                       'UEH'),
(24, 24, 'Truong Thi Quynh',   '0911000013', NULL, 'SV HCMUS, can phong sach se',              'HCMUS'),
(25, 25, 'Cao Duc Tam',        '0911000014', NULL, 'Sinh vien HUTECH nam 3',                  'HUTECH'),
(26, 26, 'Duong Thi Uyen',     '0911000015', NULL, 'SV RMIT, tim studio cao cap',              'RMIT'),
(27, 27, 'Ho Van Vinh',        '0911000016', NULL, 'Tai khoan bi khoa',                       'TDT'),
(28, 28, 'Luong Thi Xuan',     '0911000017', NULL, 'Chua xac minh email',                     'UIT'),
(29, 29, 'Mai Quoc Bao',       '0911000018', NULL, 'Chua xac minh email',                     'HCMUT'),
(30, 30, 'To Thi Cam',         '0911000019', NULL, 'Chua xac minh email',                     'FPT');

SELECT setval('users_id_seq', 30);
SELECT setval('user_profiles_id_seq', 30);

COMMIT;
