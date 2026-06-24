import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useMemo } from 'react';
import StudentLayout from '../../../layouts/StudentLayout';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import useNotifications from '../hooks/useNotifications';
import useAuthStore from '../../../store/authStore';
import { useLandlordNav } from '../../../hooks/useLandlordNav';
import type { NotificationTab } from '../hooks/useNotifications';
import type { Notification } from '../../../types/notification';
import { NOTIFICATION_META } from '../../../types/notification';

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
  try {
    const parsed = JSON.parse(body);
    if (parsed?.type === 'listing_card') {
      const textPreview = parsed.title || parsed.text;
      return textPreview ? `🏘 ${textPreview}` : '🏘 Đã đính kèm một phòng trọ';
    }
  } catch { /* not JSON */ }
  return body;
}

function getNotificationHref(n: Notification): string {
  switch (n.refType) {
    case 'listing': return `/listings/${n.refId}`;
    case 'match': return '/matching';
    case 'message': return `/messages/${n.refId}`;
    case 'review': return `/listings/${n.refId}`;
    default: return '#';
  }
}

function NotificationsContent() {
  const navigate = useNavigate();
  const {
    groupedNotifications,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { user: authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'ADMIN';
  const isLandlord = authUser?.role === 'LANDLORD';

  const backUrl = isAdmin ? '/admin' : isLandlord ? '/dashboard' : '/home';
  const backLabel = isAdmin ? 'Quay lại Admin' : isLandlord ? 'Quay lại Bảng điều khiển' : 'Trang chủ';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <button
          onClick={() => navigate(backUrl)}
          className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {backLabel}
        </button>
        <span>•</span>
        <span className="text-on-surface font-bold">Thông báo</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[32px]">notifications</span>
          Thông báo
          {unreadCount > 0 && (
            <span className="bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary-container text-sm font-bold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 bg-surface-container-low rounded-full p-1 w-fit">
        {(['all', 'unread'] as NotificationTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer',
              activeTab === tab
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {tab === 'all' ? 'Tất cả' : 'Chưa đọc'}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {groupedNotifications.length > 0 ? (
          groupedNotifications.map(group => (
            <div key={group.label}>
              {/* Time group header */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-outline-variant/20" />
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-2">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-outline-variant/20" />
              </div>

              {/* Items */}
              <div className="space-y-1">
                {group.items.map(n => {
                  const meta = NOTIFICATION_META[n.type];
                  return (
                    <Link
                      key={n.id}
                      to={getNotificationHref(n)}
                      onClick={() => markAsRead(n.id)}
                      className={clsx(
                        'flex gap-4 p-4 rounded-2xl transition-all duration-200 group/noti',
                        !n.isRead
                          ? 'bg-primary-container/10 hover:bg-primary-container/20 border border-primary/10'
                          : 'hover:bg-surface-container border border-transparent'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/noti:scale-105"
                        style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ color: meta.color }}
                        >
                          {meta.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-[15px] leading-snug',
                          !n.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant'
                        )}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                            {formatNotificationBody(n.body)}
                          </p>
                        )}
                        <p className={clsx(
                          'text-xs mt-1.5 flex items-center gap-1',
                          !n.isRead ? 'text-primary font-bold' : 'text-outline'
                        )}>
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {getTimeAgo(new Date(n.createdAt))}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!n.isRead && (
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-5xl text-outline">notifications_off</span>
            </div>
            <p className="font-headline font-bold text-xl text-on-surface mb-1">
              {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </p>
            <p className="text-sm text-on-surface-variant">
              {activeTab === 'unread'
                ? 'Tuyệt vời! Bạn đã đọc hết tất cả thông báo.'
                : 'Thông báo sẽ xuất hiện khi có hoạt động mới.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user: authUser, isAuthenticated } = useAuthStore();
  const isAdmin = authUser?.role === 'ADMIN';
  const isLandlord = authUser?.role === 'LANDLORD';

  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const { sideNav: landlordSideNav, landlordUser } = useLandlordNav('overview' as any);

  if (isAdmin) {
    return (
      <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
        <NotificationsContent />
      </DashboardLayout>
    );
  }

  if (isLandlord) {
    return (
      <DashboardLayout sideNavProps={landlordSideNav} user={landlordUser}>
        <NotificationsContent />
      </DashboardLayout>
    );
  }

  return (
    <StudentLayout user={navUser}>
      <div className="px-4">
        <NotificationsContent />
      </div>
    </StudentLayout>
  );
}
