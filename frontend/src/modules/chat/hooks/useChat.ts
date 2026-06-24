import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Conversation, Message, ConversationResponse, MessageResponse } from '../../../types/chat';
import useAuthStore from '../../../store/authStore';
import chatService, { presenceService } from '../../../services/chatService';

type TabFilter = 'all' | 'direct' | 'group';

function mapConversation(dto: ConversationResponse, _currentUserId: number, onlineUsers: Set<number>): Conversation {
  return {
    id: dto.id,
    type: dto.type,
    name: dto.name,
    createdBy: dto.createdById,
    relatedListingId: null,
    createdAt: dto.createdAt,
    members: (dto.members || []).map(m => ({
      userId: m.id,
      user: {
        id: m.id,
        name: m.name || m.email || 'Người dùng',
        avatar: m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + m.id,
        isOnline: onlineUsers.has(m.id),
        role: 'student'
      },
      role: m.id === dto.createdById ? 'admin' : 'member',
      joinedAt: dto.createdAt,
      lastReadAt: null,
    })),
    lastMessage: dto.lastMessage ? mapMessage(dto.lastMessage) : null,
    unreadCount: 0, // Mocked for now, until backend provides it
  };
}

function mapMessage(dto: MessageResponse): Message {
  const type = (dto.messageType || 'TEXT').toLowerCase();
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    senderId: dto.senderId,
    content: dto.content ?? '',
    messageType: type === 'image' ? 'image' : type === 'file' ? 'file' : 'text',
    mediaUrl: dto.mediaUrl ?? null,
    isDeleted: dto.isDeleted,
    createdAt: dto.createdAt,
  };
}

export function useChat() {
  const { user: currentUserProfile } = useAuthStore();
  // Use the real database ID from the auth profile — NOT a hash of the email
  const currentUserId = currentUserProfile?.id ?? 0;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<number, Message[]>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [typingUsers, _setTypingUsers] = useState<Record<number, number[]>>({});

  // Ref to access selectedId inside WebSocket callbacks without stale closures
  const selectedIdRef = useRef<number | null>(null);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch initial conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const [dtos, onlineIds] = await Promise.all([
        chatService.getMyConversations(),
        presenceService.getOnlineUsers()
      ]);
      const onlineSet = new Set(onlineIds);
      setConversations(dtos.map(d => mapConversation(d, currentUserId, onlineSet)));
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const msgs = await chatService.getMessages(convId);
      const mappedMsgs = msgs.map(mapMessage);
      
      setMessagesMap(prev => ({
        ...prev,
        [convId]: mappedMsgs
      }));

      // Update last message in conversation
      if (mappedMsgs.length > 0) {
        setConversations(prev => prev.map(c => 
          c.id === convId ? { ...c, lastMessage: mappedMsgs[mappedMsgs.length - 1] } : c
        ));
      }
    } catch (err) {
      console.error(`Failed to fetch messages for conv ${convId}:`, err);
    }
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

  // WebSocket Connection — subscribe to ALL conversations for real-time updates
  useEffect(() => {
    if (conversations.length === 0) return;

    const token = localStorage.getItem('totoro_access_token');
    if (!token) return;

    let stompClient: any = null;
    let cancelled = false;

    Promise.all([
      import('@stomp/stompjs'),
      import('sockjs-client'),
    ]).then(([{ Client }, { default: SockJS }]) => {
      if (cancelled) return;

      const getWsBaseUrl = () => {
        let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        if (baseUrl.endsWith('/api')) {
          baseUrl = baseUrl.slice(0, -4);
        }
        return baseUrl;
      };

      const client = new Client({
        webSocketFactory: () => new SockJS(`${getWsBaseUrl()}/ws?token=${token}`),
        debug: () => {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        // Subscribe to presence updates
        client.subscribe('/topic/presence', (message) => {
          if (!message.body) return;
          const payload = JSON.parse(message.body);
          const uId = payload.userId;
          const isOnline = payload.online;

          setConversations(prev => prev.map(c => ({
            ...c,
            members: c.members.map(m => m.userId === uId ? { ...m, user: { ...m.user, isOnline } } : m)
          })));
        });

        // Subscribe to every conversation topic
        conversations.forEach(conv => {
          client.subscribe(`/topic/conversations/${conv.id}`, (message) => {
            if (!message.body) return;
            const newMsgDto = JSON.parse(message.body);
            const mappedMsg = mapMessage(newMsgDto);
            const convId = conv.id;

            // Update messages list (only if this conv is currently selected)
            if (selectedIdRef.current === convId) {
              setMessagesMap(prev => {
                const list = prev[convId] ?? [];
                if (list.some(m => m.id === mappedMsg.id)) return prev;
                const filteredList = mappedMsg.senderId === currentUserId
                  ? list.filter(m => m.id > 0)
                  : list;
                return { ...prev, [convId]: [...filteredList, mappedMsg] };
              });
            }

            // Always update lastMessage & unread count for this conversation
            setConversations(prev => prev.map(c => {
              if (c.id !== convId) return c;
              // Don't increment unread if we're looking at this conversation right now
              const isViewing = selectedIdRef.current === convId;
              return {
                ...c,
                lastMessage: mappedMsg,
                unreadCount: (!isViewing && mappedMsg.senderId !== currentUserId)
                  ? c.unreadCount + 1
                  : c.unreadCount,
              };
            }));
          });
        });
      };

      client.activate();
      stompClient = client;
    });

    return () => {
      cancelled = true;
      if (stompClient) {
        stompClient.deactivate();
      }
    };
    // Re-subscribe when the list of conversations changes (e.g., new group created)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.map(c => c.id).join(','), currentUserId]);

  // Total unread across all conversations
  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  // Selected conversation object
  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  // Messages for selected conversation
  const messages = useMemo(
    () => (selectedId ? messagesMap[selectedId] ?? [] : []),
    [messagesMap, selectedId],
  );

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (tabFilter === 'direct') list = list.filter(c => c.type === 'DIRECT');
    if (tabFilter === 'group') list = list.filter(c => c.type === 'GROUP');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => {
        if (c.name?.toLowerCase().includes(q)) return true;
        return c.members.some(m => m.user.name.toLowerCase().includes(q));
      });
    }
    // Sort: unread first, then by last message time
    return [...list].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      const aTime = a.lastMessage?.createdAt ?? a.createdAt;
      const bTime = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [conversations, tabFilter, searchQuery]);

  // Select conversation + mark as read
  const selectConversation = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id) {
      setConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      );
    }
  }, []);

  // Send text message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' = 'text') => {
    if (!selectedId || !content.trim()) return;

    // Optimistic update: add a temp message with negative ID so it shows instantly
    const tempId = -(Date.now());
    const tempMsg: Message = {
      id: tempId,
      conversationId: selectedId,
      senderId: currentUserId,
      content: content.trim(),
      messageType: type,
      mediaUrl: type === 'image' ? content.trim() : null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    setMessagesMap(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), tempMsg],
    }));

    try {
      const req: any = { content: content.trim() };
      if (type === 'image') {
        req.messageType = 'IMAGE';
        req.mediaUrl = content.trim();
      }
      await chatService.sendMessage(selectedId, req);

      // Re-fetch to replace temp message with real one
      fetchMessages(selectedId);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on error
      setMessagesMap(prev => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).filter(m => m.id !== tempId),
      }));
    }
  }, [selectedId, currentUserId, fetchMessages]);

  // Get the "other" user for DIRECT conversations
  const getOtherUser = useCallback((conv: Conversation) => {
    return conv.members.find(m => m.userId !== currentUserId)?.user ?? null;
  }, [currentUserId]);

  // Get display name for conversation
  const getConversationName = useCallback((conv: Conversation) => {
    if (conv.type === 'GROUP') return conv.name ?? 'Nhóm chat';
    const other = getOtherUser(conv);
    return other?.name ?? 'Unknown';
  }, [getOtherUser]);

  // Get avatar for conversation
  const getConversationAvatar = useCallback((conv: Conversation) => {
    if (conv.type === 'DIRECT') return getOtherUser(conv)?.avatar ?? '';
    // For group, return first member avatar
    return conv.members[0]?.user.avatar ?? '';
  }, [getOtherUser]);

  // Is the other user online (DIRECT only)
  const isOtherOnline = useCallback((conv: Conversation) => {
    if (conv.type !== 'DIRECT') return false;
    return getOtherUser(conv)?.isOnline ?? false;
  }, [getOtherUser]);

  return {
    isLoading,
    conversations: filteredConversations,
    allConversations: conversations,
    messages,
    selectedId,
    selectedConversation,
    searchQuery,
    tabFilter,
    totalUnread,
    typingUsers,
    currentUser: currentUserProfile ? {
      id: currentUserId,
      name: currentUserProfile.fullName || currentUserProfile.email,
      avatar: currentUserProfile.avatarUrl ?? '',
      role: currentUserProfile.role.toLowerCase() as any,
      isOnline: true
    } : null,
    setSearchQuery,
    setTabFilter,
    selectConversation,
    sendMessage,
    getOtherUser,
    getConversationName,
    getConversationAvatar,
    isOtherOnline,
    refetchConversations: fetchConversations,
  };
}
