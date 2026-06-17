import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SideNavProps } from '../components/common/SideNav';
import useAuthStore from '../store/authStore';

type LandlordPage = 'overview' | 'listings' | 'messages' | 'analytics' | 'profile';

export function useLandlordNav(activePage: LandlordPage) {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const landlordUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Chủ nhà',
    role: 'Chủ nhà',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const sideNav: SideNavProps = useMemo(() => ({
    header: { title: 'Chủ nhà', subtitle: 'Quản lý tài sản' },
    breakpoint: 'lg' as const,
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/dashboard', active: activePage === 'overview' },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/dashboard/listings', active: activePage === 'listings' },
      { icon: 'chat', label: 'Tin nhắn', href: '/dashboard/messages', active: activePage === 'messages' },
      { icon: 'bar_chart', label: 'Thống kê', href: '/dashboard/analytics', active: activePage === 'analytics' }
    ],
    bottomCTA: { icon: 'add', label: 'Đăng tin mới', onClick: () => navigate('/dashboard/listings/new') },
  }), [activePage, navigate]);

  return { landlordUser, sideNav };
}
