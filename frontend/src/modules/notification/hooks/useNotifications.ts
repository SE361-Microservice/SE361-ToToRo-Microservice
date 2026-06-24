import { useMemo, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { NotificationResponse } from '../../../types/notification';
import notificationService from '../../../services/notificationService';
import { tokenStorage } from '../../../services/apiClient';
import useNotificationStore from '../../../store/notificationStore';
import useAuthStore from '../../../store/authStore';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let isInitializing = false;
let stompClientInstance: Client | null = null;
let activeToken: string | null = null;

export type NotificationTab = 'all' | 'unread';

interface TimeGroup {
  label: string;
  items: ReturnType<typeof useNotificationStore.getState>['notifications'];
}

function getTimeGroupLabel(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays <= 7) return 'Tuần trước';
  return 'Trước đó';
}

import { useState } from 'react';

export default function useNotifications() {
  const { notifications, unreadCount, initialized, setNotifications, setUnreadCount, addNotification, markAsRead: storeMarkAsRead, markAllAsRead: storeMarkAllAsRead, clear: storeClear } = useNotificationStore(
    useShallow((s) => ({
      notifications: s.notifications,
      unreadCount: s.unreadCount,
      initialized: s.initialized,
      setNotifications: s.setNotifications,
      setUnreadCount: s.setUnreadCount,
      addNotification: s.addNotification,
      markAsRead: s.markAsRead,
      markAllAsRead: s.markAllAsRead,
      clear: s.clear,
    }))
  );
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const accessToken = useAuthStore(state => state.accessToken);

  // 1. Handle token change / logout
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (stompClientInstance && activeToken !== token) {
      stompClientInstance.deactivate();
      stompClientInstance = null;
      activeToken = null;
    }
    if (!token || activeToken !== token) {
      storeClear();
      isInitializing = false;
    }
  }, [accessToken, storeClear]);

  // 2. Fetch initial API data (only once globally per user session)
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    if (initialized || isInitializing) return;
    
    isInitializing = true;
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications(0, 50);
        setNotifications(res.content as NotificationResponse[]);
        const countRes = await notificationService.getUnreadCount();
        setUnreadCount(countRes.count);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        isInitializing = false;
      }
    };
    fetchNotifications();
  }, [initialized, setNotifications, setUnreadCount, accessToken]);

  // 3. Setup STOMP WebSocket for real-time notifications (only once per user session)
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    if (stompClientInstance && activeToken === token) return; // Already connected

    if (stompClientInstance) {
      stompClientInstance.deactivate();
      stompClientInstance = null;
    }

    const getWsBaseUrl = () => {
      let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
      }
      return baseUrl;
    };

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${getWsBaseUrl()}/ws?token=${token}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe('/user/queue/notifications', (message) => {
        try {
          const dto: NotificationResponse = JSON.parse(message.body);
          addNotification(dto);
        } catch (err) {
          console.error('Error parsing real-time notification:', err);
        }
      });
    };

    stompClientInstance = stompClient;
    activeToken = token;
    stompClient.activate();
    
    return () => {
      // Keep connection alive across hook unmounts, only clean up on user switch/logout
    };
  }, [addNotification, accessToken]);

  const filteredNotifications = useMemo(
    () => activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications,
    [notifications, activeTab]
  );

  const groupedNotifications = useMemo((): TimeGroup[] => {
    const groups = new Map<string, typeof notifications>();
    const order = ['Hôm nay', 'Hôm qua', 'Tuần trước', 'Trước đó'];
    filteredNotifications.forEach((n) => {
      const label = getTimeGroupLabel(new Date(n.createdAt));
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(n);
    });
    return order.filter((l) => groups.has(l)).map((l) => ({ label: l, items: groups.get(l)! }));
  }, [filteredNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    storeMarkAsRead(id);
    try { await notificationService.markAsRead(Number(id)); }
    catch (err) { console.error('Failed to mark as read:', err); }
  }, [storeMarkAsRead]);

  const markAllAsRead = useCallback(async () => {
    storeMarkAllAsRead();
    try { await notificationService.markAllAsRead(); }
    catch (err) { console.error('Failed to mark all as read:', err); }
  }, [storeMarkAllAsRead]);

  return {
    notifications: filteredNotifications,
    groupedNotifications,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  };
}
