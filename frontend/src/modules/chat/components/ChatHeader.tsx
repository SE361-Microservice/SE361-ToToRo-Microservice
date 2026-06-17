import type { Conversation, ChatUser } from '../../../types/chat';

interface Props {
  conversation: Conversation;
  otherUser: ChatUser | null;
  onBack?: () => void;
  onInfoClick?: () => void;
}

export default function ChatHeader({ conversation, otherUser, onBack, onInfoClick }: Props) {
  const isGroup = conversation.type === 'GROUP';
  const name = isGroup ? conversation.name : otherUser?.name ?? 'Unknown';
  const avatar = isGroup ? null : otherUser?.avatar;
  const isOnline = otherUser?.isOnline ?? false;

  return (
    <header className="px-5 py-4 bg-surface flex items-center justify-between border-b border-outline-variant/10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        {onBack && (
          <button onClick={onBack} className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors -ml-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}

        {/* Avatar */}
        {isGroup ? (
          <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
        ) : (
          <img src={avatar ?? ''} alt={name ?? ''} className="w-11 h-11 rounded-full object-cover" />
        )}

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-on-surface">{name}</h2>
            {otherUser?.verifiedBadge && (
              <span className="bg-primary-container text-on-primary-container text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {otherUser.verifiedBadge}
              </span>
            )}
            {otherUser?.role === 'landlord' && (
              <span className="bg-secondary-container text-on-secondary-container text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Chủ trọ
              </span>
            )}
          </div>
          {isGroup ? (
            <p className="text-[11px] text-outline">{conversation.members.length} thành viên</p>
          ) : (
            <p className={`text-[11px] flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-outline'}`}>
              {isOnline && <span className="w-1.5 h-1.5 bg-green-600 rounded-full inline-block" />}
              {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="hidden md:flex gap-2">
        {isGroup && onInfoClick && (
          <button
            onClick={onInfoClick}
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            title="Thông tin nhóm"
          >
            <span className="material-symbols-outlined text-lg">info</span>
          </button>
        )}
        <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-lg">call</span>
        </button>
        <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-lg">more_vert</span>
        </button>
      </div>
    </header>
  );
}
