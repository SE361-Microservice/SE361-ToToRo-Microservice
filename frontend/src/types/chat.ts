// ── Chat module types ───────────────────────────────────────────────
// Maps to DB tables: conversations, conversation_members, messages

export type ConversationType = 'DIRECT' | 'GROUP';
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MemberRole = 'admin' | 'member';
export type UserRole = 'student' | 'landlord' | 'USER' | 'LANDLORD';

export interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  role: UserRole;
  school?: string;         // for students
  verifiedBadge?: string;  // e.g. "Verified Student"
}

export interface ConversationMember {
  userId: number;
  user: ChatUser;
  role: MemberRole;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  messageType: MessageType;
  mediaUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: ConversationType;
  name: string | null;         // Group name only
  createdBy: number;
  relatedListingId: number | null;
  createdAt: string;
  members: ConversationMember[];
  // Derived / computed
  lastMessage: Message | null;
  unreadCount: number;
}

// ── Compatibility info (for matched students) ───────────────────────
export interface CompatibilityInfo {
  score: number;           // 0–100
  sharedTraits: string[];  // e.g. ["Dậy sớm", "Yên tĩnh"]
}

// ── WebSocket event types ───────────────────────────────────────────
export interface WsNewMessage {
  type: 'new_message';
  payload: Message;
}

export interface WsTyping {
  type: 'typing';
  payload: { conversationId: number; userId: number };
}

export interface WsRead {
  type: 'read';
  payload: { conversationId: number; userId: number; readAt: string };
}

export type WsEvent = WsNewMessage | WsTyping | WsRead;

// ── Backend API DTOs ────────────────────────────────────────────────

export interface CreateConversationRequest {
  type: ConversationType;
  name?: string;
  memberIds: number[];
}

export interface MemberProfileDto {
  id: number;        // backend sends `id`, not `userId`
  name: string;      // backend sends `name`, not `fullName`
  avatar: string | null;  // backend sends `avatar`, not `avatarUrl`
  email: string;
}

export interface ConversationResponse {
  id: number;
  type: ConversationType;
  name: string | null;
  createdById: number;
  members: MemberProfileDto[];
  lastMessage?: MessageResponse;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRequest {
  content?: string;
  messageType?: string;  // TEXT, IMAGE, FILE
  mediaUrl?: string;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderEmail: string;
  content: string | null;
  messageType: string | null;
  mediaUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /conversations/{id}/members — mirrors BE AddMemberRequest */
export interface AddMemberRequest {
  userId: number;
  isAdmin?: boolean;
}
