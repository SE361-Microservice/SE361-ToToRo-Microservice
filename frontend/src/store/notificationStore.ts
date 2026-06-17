import { create } from 'zustand';
import type { Notification, NotificationResponse } from '../types/notification';

function mapToNotification(dto: NotificationResponse): Notification {
  return {
    id: dto.id.toString(),
    userId: '',
    type: dto.type as Notification['type'],
    title: dto.title,
    body: dto.body || undefined,
    refType: (dto.refType as Notification['refType']) || undefined,
    refId: dto.refId ? dto.refId.toString() : undefined,
    isRead: dto.isRead,
    createdAt: dto.createdAt,
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  initialized: boolean;

  // Actions
  setNotifications: (dtos: NotificationResponse[]) => void;
  setUnreadCount: (count: number) => void;
  addNotification: (dto: NotificationResponse) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  initialized: false,

  setNotifications: (dtos) =>
    set({
      notifications: dtos.map(mapToNotification),
      initialized: true,
    }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  addNotification: (dto) =>
    set((state) => {
      // Prevent duplicates
      if (state.notifications.some((n) => n.id === dto.id.toString())) {
        return state;
      }

      // Aggregate: replace existing unread message notification for same conversation
      if (dto.type === 'NEW_MESSAGE' && dto.refType === 'conversation' && dto.refId) {
        const existingIndex = state.notifications.findIndex(
          (n) => n.type === 'NEW_MESSAGE' && n.refType === 'conversation' && n.refId === dto.refId?.toString() && !n.isRead
        );
        if (existingIndex !== -1) {
          const updated = [...state.notifications];
          updated.splice(existingIndex, 1);
          return {
            notifications: [mapToNotification(dto), ...updated],
            unreadCount: state.unreadCount, // count doesn't change
          };
        }
      }

      return {
        notifications: [mapToNotification(dto), ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const wasUnread = state.notifications.find((n) => n.id === id && !n.isRead);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  clear: () =>
    set({
      notifications: [],
      unreadCount: 0,
      initialized: false,
    }),
}));

export { mapToNotification };
export default useNotificationStore;
