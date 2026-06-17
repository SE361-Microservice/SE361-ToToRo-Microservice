import type { Message, ChatUser } from '../../../types/chat';
import ListingAttachmentCard from '../../../components/common/ListingAttachmentCard';
import clsx from 'clsx';

interface Props {
  message: Message;
  isOwn: boolean;
  sender?: ChatUser | null;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/** Try to parse a listing_card JSON message */
function tryParseListingCard(content: string | null) {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === 'listing_card' && parsed.listingId) return parsed;
  } catch { /* not JSON */ }
  return null;
}

export default function MessageBubble({ message, isOwn, sender, showAvatar = false, isLastInGroup = true }: Props) {
  // System message
  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center py-1">
        <span className="text-[10px] text-outline bg-surface-container-high px-4 py-1.5 rounded-full font-medium italic">
          {message.content}
        </span>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={clsx('flex gap-3 max-w-[85%]', isOwn && 'flex-row-reverse ml-auto')}>
        <div className={clsx(
          'p-3 rounded-xl italic text-sm opacity-60',
          isOwn ? 'bg-surface-container text-outline' : 'bg-surface-container text-outline',
        )}>
          <span className="material-symbols-outlined text-sm align-middle mr-1">block</span>
          Tin nhắn đã được thu hồi
        </div>
      </div>
    );
  }

  const listingCard = tryParseListingCard(message.content);

  return (
    <div className={clsx('flex gap-2.5', isOwn ? 'flex-row-reverse ml-auto' : '', 'max-w-[85%]')}>
      {/* Avatar (received only) */}
      {!isOwn && (
        <div className="flex-shrink-0 self-end mb-5">
          {showAvatar && sender ? (
            <img src={sender.avatar} alt={sender.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7" /> 
          )}
        </div>
      )}

      <div className={clsx('space-y-1 flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name (group, received only) */}
        {!isOwn && showAvatar && sender && (
          <p className="text-[10px] font-bold text-on-surface-variant ml-1">{sender.name}</p>
        )}

        {/* Bubble */}
        {message.messageType === 'image' && message.mediaUrl ? (
          <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img 
              src={message.mediaUrl} 
              alt="Sent image" 
              className={clsx(
                'rounded-2xl max-w-[280px] max-h-[280px] object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity',
                isOwn ? 'rounded-br-md' : 'rounded-bl-md',
              )}
            />
          </a>
        ) : listingCard ? (
          <div className="w-[280px]">
            <ListingAttachmentCard
              listingId={listingCard.listingId}
              title={listingCard.title}
              address={listingCard.address}
              coverImage={listingCard.coverImage}
              price={listingCard.price}
              compact
            />
          </div>
        ) : (
          <div className={clsx(
            'p-3.5 shadow-sm text-sm leading-relaxed',
            isOwn
              ? 'bg-primary text-on-primary rounded-2xl rounded-br-md'
              : 'bg-surface-container-highest text-on-surface rounded-2xl rounded-bl-md',
          )}>
            <p>{message.content}</p>
          </div>
        )}

        {/* Time + read status */}
        {isLastInGroup && (
          <p className={clsx('text-[10px] text-outline', isOwn ? 'mr-1' : 'ml-1')}>
            {formatTime(message.createdAt)}
            {isOwn && <span className="ml-1 opacity-70">• Đã gửi</span>}
          </p>
        )}
      </div>
    </div>
  );
}
