import type { Conversation, MessageResponse, Message } from '../../../types/chat';
import clsx from 'clsx';

type TabFilter = 'all' | 'direct' | 'group';

interface Props {
  conversations: Conversation[];
  selectedId: number | null;
  searchQuery: string;
  tabFilter: TabFilter;
  totalUnread: number;
  onSelect: (id: number) => void;
  onSearchChange: (q: string) => void;
  onTabChange: (tab: TabFilter) => void;
  getName: (c: Conversation) => string;
  getAvatar: (c: Conversation) => string;
  isOnline: (c: Conversation) => boolean;
  onCreateGroup?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  return `${days} ngày`;
}

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'direct', label: 'Cá nhân' },
  { key: 'group', label: 'Nhóm' },
];

function getLastMessagePreview(msg?: Message | MessageResponse | null): string {
  if (!msg) return '';
  if (msg.messageType === 'system') return `📋 ${msg.content}`;
  if (msg.messageType === 'image') return '📷 Đã gửi một ảnh';
  if (msg.content) {
    try {
      const parsed = JSON.parse(msg.content);
      if (parsed?.type === 'listing_card') {
        const textPreview = parsed.title || parsed.text;
        return textPreview ? `🏘 ${textPreview}` : '🏘 Đã đính kèm một phòng trọ';
      }
    } catch { /* not JSON */ }
  }
  return msg.content || '';
}

export default function ConversationList({
  conversations,
  selectedId,
  searchQuery,
  tabFilter,
  onSelect,
  onSearchChange,
  onTabChange,
  getName,
  getAvatar,
  isOnline,
  onCreateGroup,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface">Tin nhắn</h2>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
              title="Tạo nhóm chat"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              Tạo nhóm
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-surface-container-highest border-none rounded-full focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline/60"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-high p-1 rounded-full mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={clsx(
                'flex-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                tabFilter === tab.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-outline hover:text-on-surface',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {conversations.length === 0 && (
          <div className="text-center py-12 text-outline text-sm">
            <span className="material-symbols-outlined text-4xl mb-2 block">forum</span>
            Không tìm thấy cuộc trò chuyện
          </div>
        )}

        {conversations.map(conv => {
          const isActive = conv.id === selectedId;
          const avatar = getAvatar(conv);
          const name = getName(conv);
          const online = isOnline(conv);
          const lastMsg = conv.lastMessage;
          const lastMsgPreview = getLastMessagePreview(lastMsg);

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={clsx(
                'w-full p-3.5 rounded-xl flex gap-3.5 cursor-pointer transition-all text-left',
                isActive
                  ? 'bg-surface-container-lowest border-2 border-primary/20 shadow-sm'
                  : 'hover:bg-surface-container border-2 border-transparent',
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conv.type === 'GROUP' ? (
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                  </div>
                ) : (
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                )}
                {online && conv.type === 'DIRECT' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={clsx('font-bold text-sm truncate', conv.unreadCount > 0 ? 'text-on-surface' : 'text-on-surface/80')}>
                    {name}
                  </h3>
                  {lastMsg && (
                    <span className="text-[10px] text-outline flex-shrink-0 ml-2">{timeAgo(lastMsg.createdAt)}</span>
                  )}
                </div>

                {conv.type === 'GROUP' && (
                  <p className="text-[10px] text-outline">{conv.members.length} thành viên</p>
                )}

                <div className="flex items-center justify-between mt-0.5">
                  <p className={clsx(
                    'text-xs truncate',
                    conv.unreadCount > 0 ? 'text-on-surface-variant font-medium' : 'text-outline',
                  )}>
                    {lastMsgPreview}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
