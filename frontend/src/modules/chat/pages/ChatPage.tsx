import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TopNavBar from '../../../components/common/TopNavBar';
import SideNav from '../../../components/common/SideNav';
import type { NavLink } from '../../../components/common/TopNavBar';
import BottomNav from '../../../components/common/BottomNav';
import { useChat } from '../hooks/useChat';
import ConversationList from '../components/ConversationList';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import ChatEmptyState from '../components/ChatEmptyState';
import CreateGroupModal from '../components/CreateGroupModal';
import CompatibilityBadge from '../components/CompatibilityBadge';
import { MOCK_COMPATIBILITY } from '../data/mockChatData';
import useAuthStore from '../../../store/authStore';
import chatService from '../../../services/chatService';
import { useLandlordNav } from '../../../hooks/useLandlordNav';
import { useToast } from '../../../hooks/useToast';

interface ChatPageProps {
  variant: 'student' | 'landlord';
}

// ── Date separator helper ───────────────────────────────────────────
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Student nav config ──────────────────────────────────────────────

const studentNavLinks: NavLink[] = [
  { label: 'Trang chủ', href: '/home' },
  { label: 'Tìm phòng', href: '/search' },
  { label: 'Matchmates', href: '/matching' },
  { label: 'Cộng đồng', href: '/community' },
  { label: 'Tin nhắn', href: '/messages', active: true },
];

const studentBottomNavItems = [
  { icon: 'home', label: 'Trang chủ', href: '/home' },
  { icon: 'search', label: 'Tìm phòng', href: '/search' },
  { icon: 'group_add', label: 'Match', href: '/matching' },
  { icon: 'forum', label: 'Tin nhắn', href: '/messages' },
  { icon: 'account_circle', label: 'Tài khoản', href: '/profile' },
];

// ── Chat content (shared) ───────────────────────────────────────────
function ChatContent({
  showChat,
  conversations,
  selectedId,
  searchQuery,
  tabFilter,
  totalUnread,
  selectedConversation,
  compatInfo,
  groupedMessages,
  typingInConv,
  currentUser,
  messagesEndRef,
  selectConversation,
  setSearchQuery,
  setTabFilter,
  sendMessage,
  getOtherUser,
  getConversationName,
  getConversationAvatar,
  isOtherOnline,
  onCreateGroup,
}: any) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversation List sidebar */}
      <aside className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-outline-variant/10 bg-surface-container-low flex-shrink-0`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          searchQuery={searchQuery}
          tabFilter={tabFilter}
          totalUnread={totalUnread}
          onSelect={selectConversation}
          onSearchChange={setSearchQuery}
          onTabChange={setTabFilter}
          getName={getConversationName}
          getAvatar={getConversationAvatar}
          isOnline={isOtherOnline}
          onCreateGroup={onCreateGroup}
        />
      </aside>

      {/* Chat area */}
      <section className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              otherUser={getOtherUser(selectedConversation)}
              onBack={() => selectConversation(null)}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-surface-container-low/30">
              {/* Compatibility badge (student-to-student) */}
              {compatInfo && <CompatibilityBadge info={compatInfo} />}

              {groupedMessages.map((group: any, gi: number) => (
                <div key={gi} className="space-y-4">
                  {/* Date separator */}
                  <div className="text-center py-2">
                    <span className="text-[10px] text-outline uppercase tracking-[0.15em] font-bold bg-surface-container-high px-4 py-1 rounded-full">
                      {formatDateLabel(group.date)}
                    </span>
                  </div>

                  {/* Messages */}
                  {group.msgs.map((msg: any, mi: number) => {
                    const isOwn = msg.senderId === currentUser.id;
                    const member = selectedConversation.members.find((m: any) => m.userId === msg.senderId);
                    const sender = member ? member.user : null;
                    const prevMsg = mi > 0 ? group.msgs[mi - 1] : null;
                    const nextMsg = mi < group.msgs.length - 1 ? group.msgs[mi + 1] : null;
                    const showAvatar = !isOwn && (prevMsg?.senderId !== msg.senderId || prevMsg?.messageType === 'system');
                    const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || nextMsg.messageType === 'system';

                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={isOwn}
                        sender={sender}
                        showAvatar={showAvatar}
                        isLastInGroup={isLastInGroup}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Typing indicator */}
              {typingInConv.length > 0 && (
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="w-7 h-7" />
                  <div className="bg-surface-container-highest text-on-surface-variant px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={sendMessage} />
          </>
        ) : (
          <ChatEmptyState />
        )}
      </section>
    </div>
  );
}

// ── Main ChatPage ───────────────────────────────────────────────────
export default function ChatPage({ variant }: ChatPageProps) {
  const toast = useToast();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth store for dynamic user data
  const { user: authUser, isAuthenticated } = useAuthStore();
  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    role: authUser.role === 'LANDLORD' ? 'Chủ nhà' : 'Sinh viên',
    avatar: authUser.avatarUrl || '',
  } : { name: 'Người dùng', role: 'Sinh viên', avatar: '' };

  // Landlord nav user — dynamic from authStore instead of hardcoded
  const landlordNavUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    role: 'Chủ nhà',
    avatar: authUser.avatarUrl || '',
  } : { name: 'Chủ nhà', role: 'Chủ nhà', avatar: '' };

  const {
    isLoading,
    conversations,
    allConversations,
    messages,
    selectedId,
    selectedConversation,
    searchQuery,
    tabFilter,
    totalUnread,
    typingUsers,
    currentUser,
    setSearchQuery,
    setTabFilter,
    selectConversation,
    sendMessage,
    getOtherUser,
    getConversationName,
    getConversationAvatar,
    isOtherOnline,
    refetchConversations,
  } = useChat();

  // Auto-select from URL param
  useEffect(() => {
    if (conversationId) {
      selectConversation(Number(conversationId));
    }
  }, [conversationId, selectConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group creation modal state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const handleCreateGroup = async (name: string, memberIds: number[]) => {
    setIsCreatingGroup(true);
    try {
      const newConv = await chatService.createConversation({
        type: 'GROUP',
        name,
        memberIds,
      });
      await refetchConversations();
      selectConversation(newConv.id);
      setShowCreateGroup(false);
      toast.success('Đã tạo nhóm thành công!');
    } catch (err) {
      console.error('Failed to create group', err);
      toast.error('Có lỗi xảy ra khi tạo nhóm.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Compatibility info for selected conv
  const compatInfo = useMemo(() => {
    if (!selectedConversation || selectedConversation.type !== 'DIRECT') return null;
    const other = getOtherUser(selectedConversation);
    if (!other || (other.role !== 'student' && other.role !== 'USER')) return null;
    if (!currentUser) return null;
    const key1 = `${currentUser.id}-${other.id}`;
    const key2 = `${other.id}-${currentUser.id}`;
    return MOCK_COMPATIBILITY[key1] ?? MOCK_COMPATIBILITY[key2] ?? null;
  }, [selectedConversation, getOtherUser, currentUser?.id]);

  // Typing indicator for selected conv
  const typingInConv = selectedId ? (typingUsers[selectedId] ?? []) : [];

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: typeof messages }[] = [];
    let currentDate = '';
    messages.forEach(msg => {
      const d = new Date(msg.createdAt).toDateString();
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: msg.createdAt, msgs: [msg] });
      } else {
        groups[groups.length - 1].msgs.push(msg);
      }
    });
    return groups;
  }, [messages]);

  // Mobile: show chat or list
  const showChat = selectedId !== null;

  // ── Sidebar collapse/resize state (landlord) ─────────────
  const SIDEBAR_MIN_WIDTH = 220;
  const SIDEBAR_MAX_WIDTH = 400;
  const SIDEBAR_COLLAPSED_WIDTH = 80;
  const DEFAULT_SIDEBAR_WIDTH = 280;

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('totoro-sidebar-width');
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('totoro-sidebar-collapsed');
    return saved === 'true';
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem('totoro-sidebar-width', sidebarWidth.toString());
    localStorage.setItem('totoro-sidebar-collapsed', isCollapsed.toString());
  }, [sidebarWidth, isCollapsed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (isCollapsed) setIsCollapsed(false);
  }, [isCollapsed]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < SIDEBAR_MIN_WIDTH) newWidth = SIDEBAR_MIN_WIDTH;
      if (newWidth > SIDEBAR_MAX_WIDTH) newWidth = SIDEBAR_MAX_WIDTH;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const currentSidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth;

  // Landlord sidebar config — from shared hook
  const { sideNav: landlordSideNav } = useLandlordNav('messages');

  // Shared chat content props
  const chatContentProps = {
    showChat,
    conversations,
    selectedId,
    searchQuery,
    tabFilter,
    totalUnread,
    selectedConversation,
    messages,
    compatInfo,
    groupedMessages,
    typingInConv,
    currentUser,
    messagesEndRef,
    selectConversation,
    setSearchQuery,
    setTabFilter,
    sendMessage,
    getOtherUser,
    getConversationName,
    getConversationAvatar,
    isOtherOnline,
    onCreateGroup: () => setShowCreateGroup(true),
  };

  // ── SKELETON LOADING ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-surface flex flex-col md:flex-row overflow-hidden font-body text-on-surface">
        {/* Mock TopNavBar */}
        <div className="h-16 bg-surface-container-low border-b border-outline-variant/20 absolute top-0 w-full z-10 hidden md:block">
          <div className="flex h-full items-center px-6 gap-4">
            <div className="w-24 h-6 bg-surface-container-highest rounded animate-pulse" />
          </div>
        </div>

        {/* Mock Sidebar (if landlord variant, approximated) */}
        {variant === 'landlord' && (
          <div className="hidden md:flex w-[280px] h-full pt-16 bg-surface-container border-r border-outline-variant/10 flex-col gap-4 p-4">
             <div className="w-full h-10 bg-surface-container-highest rounded-lg animate-pulse" />
             <div className="w-3/4 h-6 bg-surface-container-highest rounded mt-4 animate-pulse" />
             <div className="w-1/2 h-6 bg-surface-container-highest rounded animate-pulse" />
          </div>
        )}

        <div className="flex-1 flex flex-col h-full pt-0 md:pt-16">
          <div className="flex-1 flex overflow-hidden bg-surface">
            {/* Mock Conversation List */}
            <div className="w-full md:w-96 border-r border-outline-variant/10 p-5 flex flex-col gap-4">
              <div className="w-1/3 h-8 bg-surface-container-highest rounded animate-pulse mb-2" />
              <div className="w-full h-10 bg-surface-container-highest rounded-full animate-pulse mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="w-16 h-8 bg-surface-container-highest rounded-full animate-pulse" />
                <div className="w-16 h-8 bg-surface-container-highest rounded-full animate-pulse" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest animate-pulse shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-2/3 h-4 bg-surface-container-highest rounded animate-pulse" />
                    <div className="w-1/2 h-3 bg-surface-container-highest rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Mock Chat Area */}
            <div className="hidden md:flex flex-1 flex-col bg-surface-container-lowest">
              <div className="h-[72px] border-b border-outline-variant/10 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest animate-pulse" />
                <div className="w-1/4 h-5 bg-surface-container-highest rounded animate-pulse" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-end gap-6">
                <div className="self-start w-1/3 h-12 bg-surface-container-highest rounded-2xl animate-pulse" />
                <div className="self-start w-1/2 h-16 bg-surface-container-highest rounded-2xl animate-pulse" />
                <div className="self-end w-1/3 h-12 bg-primary/20 rounded-2xl animate-pulse" />
              </div>
              <div className="p-4 border-t border-outline-variant/10">
                <div className="w-full h-12 bg-surface-container-highest rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Create Group Modal (shared for both variants) ─────────
  const groupModal = showCreateGroup && (
    <CreateGroupModal
      conversations={allConversations}
      currentUserId={currentUser?.id ?? 0}
      isCreating={isCreatingGroup}
      onClose={() => { setShowCreateGroup(false); }}
      onCreate={handleCreateGroup}
    />
  );

  // ── LANDLORD VARIANT ──────────────────────────────────────
  if (variant === 'landlord') {
    return (
      <div
        className="h-screen flex flex-col bg-background text-on-background font-body"
        style={{ '--sidebar-width': `${currentSidebarWidth}px` } as React.CSSProperties}
      >
        <TopNavBar variant="dashboard" user={landlordNavUser} />

        <div className="flex flex-1 pt-16 overflow-hidden">
          {/* Landlord Sidebar with collapse/resize */}
          <SideNav
            {...landlordSideNav}
            width={currentSidebarWidth}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onResizeStart={handleMouseDown}
            isDragging={isDragging}
          />

          {/* Chat content */}
          <div className={`flex flex-1 flex-col overflow-hidden md:ml-[var(--sidebar-width)] transition-[margin] ease-out ${!isDragging ? 'duration-300' : 'duration-0'}`}>
            <ChatContent {...chatContentProps} />
          </div>
        </div>

        {groupModal}
      </div>
    );
  }

  // ── STUDENT VARIANT ───────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-background text-on-background font-body">
      <TopNavBar 
        variant="student" 
        navLinks={studentNavLinks} 
        user={navUser} 
        extraActions={authUser?.role === 'USER' ? [{ icon: 'bookmark', label: 'Nhà trọ đã lưu', onClick: () => window.location.assign('/saved') }] : undefined} 
      />

      <div className="flex flex-1 pt-16 overflow-hidden">
        <ChatContent {...chatContentProps} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav items={studentBottomNavItems} shape="pill" />

      {groupModal}
    </div>
  );
}
