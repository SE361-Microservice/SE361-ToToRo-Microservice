export type NotificationType =
  | 'NEW_LISTING_MATCH'
  | 'ROOMMATE_MATCH'
  | 'NEW_MESSAGE'
  | 'REVIEW_REPLY'
  | 'LISTING_REJECTED';

export type RefType = 'listing' | 'match' | 'message' | 'review' | 'conversation';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  refType?: RefType;
  refId?: string;
  isRead: boolean;
  createdAt: string;
}

// Icon + color mapping for each notification type
export const NOTIFICATION_META: Record<NotificationType, { icon: string; color: string }> = {
  NEW_LISTING_MATCH: { icon: 'home', color: 'var(--color-primary)' },
  ROOMMATE_MATCH:    { icon: 'group_add', color: 'var(--color-tertiary)' },
  NEW_MESSAGE:       { icon: 'chat', color: 'var(--color-secondary)' },
  REVIEW_REPLY:      { icon: 'reply', color: 'var(--color-primary)' },
  LISTING_REJECTED:  { icon: 'block', color: 'var(--color-error)' },
};

// ── Backend API DTOs ────────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  type: string;
  title: string;
  body: string | null;
  refType: string | null;
  refId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
