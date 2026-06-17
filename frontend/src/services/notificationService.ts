import apiClient from './apiClient';
import type { NotificationResponse, UnreadCountResponse } from '../types/notification';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export const notificationService = {
  getNotifications: async (page: number = 0, size: number = 20): Promise<PageResponse<NotificationResponse>> => {
    const response = await apiClient.get<PageResponse<NotificationResponse>>('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.patch<{ count: number }>('/notifications/read-all');
    return response.data.count;
  },
};

export default notificationService;
