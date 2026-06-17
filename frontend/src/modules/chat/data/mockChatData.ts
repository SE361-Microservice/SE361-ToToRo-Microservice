import type { ChatUser, Conversation, Message, CompatibilityInfo } from '../../../types/chat';

// ── Mock Users ──────────────────────────────────────────────────────
export const CURRENT_USER: ChatUser = {
  id: 1,
  name: 'Minh Tuấn',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
  isOnline: true,
  role: 'student',
  school: 'RMIT University',
  verifiedBadge: 'Verified Student',
};

export const MOCK_USERS: ChatUser[] = [
  CURRENT_USER,
  {
    id: 2,
    name: 'Khánh Linh',
    avatar: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop',
    isOnline: true,
    role: 'student',
    school: 'RMIT University',
    verifiedBadge: 'Verified Student',
  },
  {
    id: 3,
    name: 'Anh Đức',
    avatar: 'https://images.unsplash.com/photo-1502672260266-1c1f517403ce?w=800&auto=format&fit=crop',
    isOnline: false,
    role: 'student',
    school: 'UIT',
  },
  {
    id: 4,
    name: 'Bảo Trâm',
    avatar: 'https://images.unsplash.com/photo-1502672260266-1c1f517403ce?w=800&auto=format&fit=crop',
    isOnline: true,
    role: 'student',
    school: 'FPT University',
    verifiedBadge: 'Verified Student',
  },
  {
    id: 5,
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop',
    isOnline: true,
    role: 'landlord',
  },
  {
    id: 6,
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop',
    isOnline: false,
    role: 'landlord',
  },
];

// ── Compatibility data ──────────────────────────────────────────────
export const MOCK_COMPATIBILITY: Record<string, CompatibilityInfo> = {
  '1-2': { score: 95, sharedTraits: ['Dậy sớm', 'Thích nấu ăn', 'Yên tĩnh'] },
  '1-3': { score: 88, sharedTraits: ['Gym', 'Không hút thuốc'] },
  '1-4': { score: 92, sharedTraits: ['Sạch sẽ', 'Dậy sớm', 'Thích đọc sách'] },
};

// ── Mock Messages ───────────────────────────────────────────────────
export const MOCK_MESSAGES: Record<number, Message[]> = {
  // Conversation 1: Minh Tuấn ↔ Khánh Linh
  1: [
    { id: 101, conversationId: 1, senderId: 2, content: 'Chào Tuấn! Mình vừa xem qua hồ sơ của bạn. Thật trùng hợp là mình cũng học RMIT và đang tìm nhà khu vực Quận 7.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T09:41:00Z' },
    { id: 102, conversationId: 1, senderId: 1, content: 'Chào Linh nhé! Rất vui được biết bạn. Khu Quận 7 thì mình đang nhắm mấy căn hộ gần sông cho thoáng. Bạn có ngại việc dậy sớm không? Vì mình thường hay tập gym lúc 6h sáng.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T09:45:00Z' },
    { id: 103, conversationId: 1, senderId: 2, content: 'Không sao nè, mình cũng dậy sớm để chuẩn bị đồ ăn sáng. Mình khá chú trọng việc giữ vệ sinh chung, đặc biệt là khu bếp. Bạn thấy sao?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T09:48:00Z' },
    { id: 104, conversationId: 1, senderId: 2, content: 'Hay là cuối tuần này mình hẹn nhau ở một quán cà phê khu Crescent Mall để trao đổi kỹ hơn về thói quen sinh hoạt và xem có "hợp cạ" không nhé? 😊', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T09:48:30Z' },
    { id: 105, conversationId: 1, senderId: 1, content: 'Ý hay đó Linh! Sáng Thứ Bảy lúc 10h được không bạn? Mình biết một quán khá yên tĩnh ở đường Tôn Dật Tiên.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T09:50:00Z' },
  ],
  // Conversation 2: Minh Tuấn ↔ Anh Đức
  2: [
    { id: 201, conversationId: 2, senderId: 3, content: 'Chào bạn, mình thấy profile bạn cũng thích tập gym. Bạn hay tập ở đâu?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-11T14:00:00Z' },
    { id: 202, conversationId: 2, senderId: 1, content: 'Chào Đức! Mình hay tập ở California Fitness Q7. Bạn cũng ở khu đó hả?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-11T14:05:00Z' },
    { id: 203, conversationId: 2, senderId: 3, content: 'Bạn có thường xuyên nấu ăn không? Mình hay order ngoài, nên cần bạn cùng phòng thoải mái với cả hai cách.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-11T14:10:00Z' },
  ],
  // Conversation 3: Minh Tuấn ↔ Bảo Trâm
  3: [
    { id: 301, conversationId: 3, senderId: 4, content: 'Chào Minh Tuấn! Mình thấy bạn cũng đang tìm phòng khu Q7. Mình tìm được một căn 2 phòng ngủ giá tốt, bạn muốn xem thử không?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T20:30:00Z' },
    { id: 302, conversationId: 3, senderId: 1, content: 'Chào Trâm! Nghe hay đó, cho mình xin thêm thông tin nhé!', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T20:35:00Z' },
  ],
  // Conversation 4: Minh Tuấn ↔ Chủ trọ Nguyễn Văn An (about listing)
  4: [
    { id: 401, conversationId: 4, senderId: 1, content: 'Chào anh An, em muốn hỏi thêm về phòng Studio ở Quận 7 ạ. Phòng còn trống không anh?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T10:00:00Z' },
    { id: 402, conversationId: 4, senderId: 5, content: 'Chào em Tuấn! Phòng vẫn còn trống nhé. Em muốn hẹn đến xem phòng không? Anh rảnh chiều thứ 7 tuần này.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T10:15:00Z' },
    { id: 403, conversationId: 4, senderId: 1, content: 'Dạ chiều thứ 7 lúc 3h được không anh? Em sẽ đi cùng 1 bạn nữa để cùng xem ạ.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T10:20:00Z' },
    { id: 404, conversationId: 4, senderId: 5, content: 'Được em, 3h chiều thứ 7 nhé. Anh sẽ gửi link Google Maps cho em!', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-12T10:25:00Z' },
  ],
  // Conversation 5: Group — Nhóm ghép phòng Q7
  5: [
    { id: 501, conversationId: 5, senderId: 0, content: 'Minh Tuấn đã tạo nhóm "Ghép phòng Q7 - Tháng 7"', messageType: 'system', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T08:00:00Z' },
    { id: 502, conversationId: 5, senderId: 0, content: 'Khánh Linh đã tham gia nhóm', messageType: 'system', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T08:05:00Z' },
    { id: 503, conversationId: 5, senderId: 0, content: 'Bảo Trâm đã tham gia nhóm', messageType: 'system', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T08:10:00Z' },
    { id: 504, conversationId: 5, senderId: 1, content: 'Chào mọi người! Mình tạo nhóm này để mình tiện bàn bạc việc ghép phòng nhé. Mọi người góp ý xem khu nào phù hợp.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T08:15:00Z' },
    { id: 505, conversationId: 5, senderId: 2, content: 'Chào mọi người! Mình vote khu Phú Mỹ Hưng, gần trường lại có nhiều tiện ích.', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T09:00:00Z' },
    { id: 506, conversationId: 5, senderId: 4, content: 'Mình cũng thích khu đó! Giá thuê khoảng bao nhiêu một tháng chia cho 3 người nhỉ?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-10T09:30:00Z' },
  ],
  // Conversation 6: Group — Nhóm trọ 123 Nguyễn Văn Linh
  6: [
    { id: 601, conversationId: 6, senderId: 0, content: 'Nguyễn Văn An đã tạo nhóm "Phòng 201 - 123 NVL"', messageType: 'system', mediaUrl: null, isDeleted: false, createdAt: '2025-06-08T11:00:00Z' },
    { id: 602, conversationId: 6, senderId: 5, content: 'Chào các bạn, đây là nhóm chat dành cho phòng 201. Mọi vấn đề về phòng các bạn trao đổi ở đây nhé!', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-08T11:05:00Z' },
    { id: 603, conversationId: 6, senderId: 1, content: 'Dạ anh, em nhận phòng ngày nào ạ?', messageType: 'text', mediaUrl: null, isDeleted: false, createdAt: '2025-06-08T11:15:00Z' },
  ],
};

// ── Mock Conversations ──────────────────────────────────────────────
const u = (id: number) => MOCK_USERS.find(u => u.id === id)!;

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    type: 'DIRECT',
    name: null,
    createdBy: 2,
    relatedListingId: null,
    createdAt: '2025-06-12T09:40:00Z',
    members: [
      { userId: 1, user: u(1), role: 'member', joinedAt: '2025-06-12T09:40:00Z', lastReadAt: '2025-06-12T09:50:00Z' },
      { userId: 2, user: u(2), role: 'member', joinedAt: '2025-06-12T09:40:00Z', lastReadAt: '2025-06-12T09:48:30Z' },
    ],
    lastMessage: MOCK_MESSAGES[1][MOCK_MESSAGES[1].length - 1],
    unreadCount: 0,
  },
  {
    id: 2,
    type: 'DIRECT',
    name: null,
    createdBy: 3,
    relatedListingId: null,
    createdAt: '2025-06-11T14:00:00Z',
    members: [
      { userId: 1, user: u(1), role: 'member', joinedAt: '2025-06-11T14:00:00Z', lastReadAt: '2025-06-11T14:05:00Z' },
      { userId: 3, user: u(3), role: 'member', joinedAt: '2025-06-11T14:00:00Z', lastReadAt: null },
    ],
    lastMessage: MOCK_MESSAGES[2][MOCK_MESSAGES[2].length - 1],
    unreadCount: 1,
  },
  {
    id: 3,
    type: 'DIRECT',
    name: null,
    createdBy: 4,
    relatedListingId: null,
    createdAt: '2025-06-10T20:30:00Z',
    members: [
      { userId: 1, user: u(1), role: 'member', joinedAt: '2025-06-10T20:30:00Z', lastReadAt: '2025-06-10T20:35:00Z' },
      { userId: 4, user: u(4), role: 'member', joinedAt: '2025-06-10T20:30:00Z', lastReadAt: null },
    ],
    lastMessage: MOCK_MESSAGES[3][MOCK_MESSAGES[3].length - 1],
    unreadCount: 0,
  },
  {
    id: 4,
    type: 'DIRECT',
    name: null,
    createdBy: 1,
    relatedListingId: 1,
    createdAt: '2025-06-12T10:00:00Z',
    members: [
      { userId: 1, user: u(1), role: 'member', joinedAt: '2025-06-12T10:00:00Z', lastReadAt: '2025-06-12T10:25:00Z' },
      { userId: 5, user: u(5), role: 'member', joinedAt: '2025-06-12T10:00:00Z', lastReadAt: '2025-06-12T10:20:00Z' },
    ],
    lastMessage: MOCK_MESSAGES[4][MOCK_MESSAGES[4].length - 1],
    unreadCount: 0,
  },
  {
    id: 5,
    type: 'GROUP',
    name: 'Ghép phòng Q7 - Tháng 7',
    createdBy: 1,
    relatedListingId: null,
    createdAt: '2025-06-10T08:00:00Z',
    members: [
      { userId: 1, user: u(1), role: 'admin', joinedAt: '2025-06-10T08:00:00Z', lastReadAt: '2025-06-10T09:30:00Z' },
      { userId: 2, user: u(2), role: 'member', joinedAt: '2025-06-10T08:05:00Z', lastReadAt: '2025-06-10T09:00:00Z' },
      { userId: 4, user: u(4), role: 'member', joinedAt: '2025-06-10T08:10:00Z', lastReadAt: null },
    ],
    lastMessage: MOCK_MESSAGES[5][MOCK_MESSAGES[5].length - 1],
    unreadCount: 2,
  },
  {
    id: 6,
    type: 'GROUP',
    name: 'Phòng 201 - 123 NVL',
    createdBy: 5,
    relatedListingId: 1,
    createdAt: '2025-06-08T11:00:00Z',
    members: [
      { userId: 5, user: u(5), role: 'admin', joinedAt: '2025-06-08T11:00:00Z', lastReadAt: '2025-06-08T11:15:00Z' },
      { userId: 1, user: u(1), role: 'member', joinedAt: '2025-06-08T11:00:00Z', lastReadAt: '2025-06-08T11:15:00Z' },
    ],
    lastMessage: MOCK_MESSAGES[6][MOCK_MESSAGES[6].length - 1],
    unreadCount: 0,
  },
];

// ── Auto-reply pool (for mock WebSocket) ────────────────────────────
export const AUTO_REPLIES = [
  'Được bạn, mình cũng nghĩ vậy!',
  'Nghe hay đó, để mình suy nghĩ thêm nhé.',
  'OK, vậy mình hẹn gặp sau nhé! 👋',
  'Mình đồng ý, khi nào tiện thì mình trao đổi thêm.',
  'Cảm ơn bạn đã chia sẻ thông tin!',
  'Mình sẽ check lại và báo sau nhé.',
  'Tuyệt vời! Mình rất mong được hợp tác 🙌',
];
