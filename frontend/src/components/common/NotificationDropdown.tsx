import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Notification } from '../../types/notification';
import { NOTIFICATION_META } from '../../types/notification';
import type { NotificationTab } from '../../modules/notification/hooks/useNotifications';

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

function formatNotificationBody(body?: string): string {
  if (!body) return '';
  if (body.includes('"type":"listing_card"') || body.includes("'type':'listing_card'") || body.includes('"listingId"')) {
    try {
      const parsed = JSON.parse(body);
      const textPreview = parsed.title || parsed.text;
      return textPreview ? `🏘 ${textPreview}` : '🏘 Đã đính kèm một phòng trọ';
    } catch {
      return '🏘 Đã đính kèm một phòng trọ';
    }
  }
  return body;
}

function getNotificationHref(n: Notification): string {
  switch (n.refType) {
    case 'listing': return `/listings/${n.refId}`;
    case 'match': return '/matching';
    case 'message': return `/messages/${n.refId}`;
    case 'review': return `/listings/${n.refId}`;
    default: return '/notifications';
  }
}

interface NotificationDropdownProps {
  groups: { label: string; items: Notification[] }[];
  unreadCount: number;
  activeTab: NotificationTab;
  onTabChange: (tab: NotificationTab) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  groups,
  unreadCount,
  activeTab,
  onTabChange,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: NotificationDropdownProps) {
  return (
    <>
      {/* Dropdown panel */}
      <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 z-[100] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            Thông báo
            {unreadCount > 0 && (
              <span className="bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs font-bold text-primary hover:text-primary-dim transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-5 pt-2 border-b border-outline-variant/10">
          {(['all', 'unread'] as NotificationTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-bold transition-colors relative',
                activeTab === tab
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {tab === 'all' ? 'Tất cả' : 'Chưa đọc'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto search-scrollbar">
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.label}>
                {/* Time group label */}
                <div className="px-5 py-2.5 text-[11px] font-extrabold text-on-surface uppercase tracking-wider bg-surface-container-high/80 border-b border-t border-outline-variant/10 first:border-t-0 shadow-sm">
                  {group.label}
                </div>

                {/* Items */}
                {group.items.map(n => {
                  const meta = NOTIFICATION_META[n.type];
                  return (
                    <Link
                      key={n.id}
                      to={getNotificationHref(n)}
                      onClick={() => { onMarkRead(n.id); onClose(); }}
                      className={clsx(
                        'flex gap-3 px-5 py-3.5 transition-colors hover:bg-surface-container-low group/noti relative',
                        !n.isRead && 'bg-primary-container/5'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}
                      >
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ color: meta.color }}
                        >
                          {meta.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-sm leading-snug',
                          !n.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant'
                        )}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                            {formatNotificationBody(n.body)}
                          </p>
                        )}
                        <p className={clsx(
                          'text-[11px] mt-1',
                          !n.isRead ? 'text-primary font-bold' : 'text-outline'
                        )}>
                          {getTimeAgo(new Date(n.createdAt))}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 self-center" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">notifications_off</span>
              <p className="text-sm font-bold text-on-surface-variant">
                {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <Link
          to="/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 px-5 py-3 border-t border-outline-variant/10 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors"
        >
          Xem tất cả thông báo
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </>
  );
}
