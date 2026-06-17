import DashboardLayout from '../../../layouts/DashboardLayout';
import BentoCard from '../../../components/common/BentoCard';
import DataRow from '../../../components/common/DataRow';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import listingService from '../../../services/listingService';
import chatService from '../../../services/chatService';
import type { ListingSummaryResponse } from '../../../types/listing';
import { useLandlordNav } from '../../../hooks/useLandlordNav';

export default function LandlordDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { landlordUser, sideNav } = useLandlordNav('overview');

  // Fetch my listings from API
  const [myListings, setMyListings] = useState<ListingSummaryResponse[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [totalListings, setTotalListings] = useState(0);
  const [recentInquiries, setRecentInquiries] = useState<Array<{id: number; avatar: string; name: string; subtext: string; status: string; statusColor: 'primary' | 'outline'; time: string}>>([]);

  useEffect(() => {
    listingService.getMyListings({ page: 0, size: 10 })
      .then(res => {
        setMyListings(res.content);
        setTotalListings(res.totalElements);
      })
      .catch(err => console.error('Failed to fetch my listings:', err))
      .finally(() => setListingsLoading(false));

    // Fetch recent conversations as inquiries
    chatService.getMyConversations()
      .then(conversations => {
        const inquiryList = conversations.slice(0, 3).map(conv => ({
          id: conv.id,
          avatar: conv.members?.[0]?.avatar || '',
          name: conv.members?.[0]?.name || conv.name || 'Người dùng',
          subtext: conv.type === 'DIRECT' ? 'Tin nhắn riêng' : (conv.name || 'Nhóm chat'),
          status: 'Mới',
          statusColor: 'primary' as 'primary' | 'outline',
          time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        }));
        setRecentInquiries(inquiryList);
      })
      .catch(err => console.error('Failed to fetch conversations:', err));
  }, []);

  const activeCount = myListings.filter(l => (l as any).status === 'ACTIVE').length;
  const pendingCount = myListings.filter(l => (l as any).status === 'PENDING').length;

  const metrics = useMemo(() => [
    { icon: 'home_work', value: listingsLoading ? '...' : totalListings, label: 'Tổng tin đăng', bg: 'default' as const },
    { icon: 'check_circle', value: listingsLoading ? '...' : activeCount, label: 'Đang hoạt động', bg: 'primary-container' as const },
    { icon: 'pending', value: listingsLoading ? '...' : pendingCount, label: 'Chờ duyệt', bg: 'secondary-container' as const },
  ], [totalListings, activeCount, pendingCount, listingsLoading]);

  // Build chart data from listings by month
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `Th ${d.getMonth() + 1}`;
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = myListings.filter(l => {
        const created = new Date((l as any).createdAt);
        return created.getFullYear() === year && created.getMonth() === month;
      }).length;
      data.push({ label: monthLabel, value: count });
    }
    return data;
  }, [myListings]);

  const maxChartVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <DashboardLayout sideNavProps={sideNav} user={landlordUser}>
      <header className="mb-10">
        <p className="text-xs font-label uppercase tracking-widest text-outline mb-2">{t('landlord.header.label')}</p>
        <h1 className="font-headline text-4xl font-extrabold text-on-background">
          {new Date().getHours() < 12 ? 'Chào buổi sáng' : new Date().getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'}, {landlordUser.name.split(' ').pop() || landlordUser.name} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">{t('landlord.header.desc')}</p>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {metrics.map((m) => (
          <BentoCard key={m.label} variant="metric" bg={m.bg} icon={m.icon} value={m.value} title={m.label} />
        ))}
      </section>

      {/* Chart + Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-lg p-6 shadow-ambient">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-outline">Hoạt động</p>
              <h3 className="font-headline text-xl font-bold mt-1">Tin đăng theo tháng</h3>
            </div>
          </div>
          <div className="flex items-end gap-2 h-[120px]">
            {chartData.map((d, i) => {
              const heightPercent = d.value > 0 ? Math.max((d.value / maxChartVal) * 100, 8) : 8;
              const isEmpty = d.value === 0;
              const isCurrentMonth = i === chartData.length - 1;
              return (
                <div key={i} className="group relative flex-1 h-full flex flex-col items-center justify-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isCurrentMonth
                        ? 'bg-primary'
                        : isEmpty
                          ? 'bg-outline-variant/20'
                          : 'bg-surface-container hover:bg-primary-fixed-dim'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-outline mt-1.5 font-label">{d.label}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-ambient">
                    {d.label}: {d.value} tin đăng
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-5 pt-5 border-t border-outline-variant/20">
            <span className="text-sm text-on-surface-variant">Tổng: <strong className="text-on-background">{totalListings} tin</strong></span>
            <Button variant="ghost" size="sm" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/dashboard/analytics')}>Xem chi tiết</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-primary-container rounded-lg p-5 shadow-ambient flex flex-col gap-3">
            <span className="material-symbols-outlined text-on-primary-container">rocket_launch</span>
            <h4 className="font-headline font-bold text-on-primary-container">{t('landlord.tips.boostTitle')}</h4>
            <p className="text-xs text-on-primary-container/80 font-body">{t('landlord.tips.boostDesc')}</p>
            <Button variant="primary" size="sm">{t('landlord.btn.upgrade')}</Button>
          </div>
          <div className="bg-surface-container rounded-lg p-5 shadow-ambient flex flex-col gap-3 flex-1">
            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
            <h4 className="font-headline font-bold text-on-background text-sm">{t('landlord.tips.totoroTitle')}</h4>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              {t('landlord.tips.totoroDesc1')}<strong>{t('landlord.tips.totoroDesc2')}</strong>{t('landlord.tips.totoroDesc3')}
            </p>
          </div>
        </div>
      </section>

      {/* Inquiries */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-headline text-xl font-bold text-on-background">{t('landlord.inquiries.title')}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/messages')}>Xem tất cả</Button>
        </div>
        <div className="flex flex-col gap-3">
          {recentInquiries.length > 0 ? recentInquiries.map((inq) => (
            <DataRow
              key={inq.id}
              variant="inquiry"
              avatar={inq.avatar}
              name={inq.name}
              subtext={inq.subtext}
              status={inq.status}
              statusColor={inq.statusColor}
              time={inq.time}
              actions={<IconButton icon="more_vert" label="Thêm tùy chọn" />}
            />
          )) : (
            <div className="py-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl text-outline mb-2 block">chat_bubble_outline</span>
              <p className="text-sm">Chưa có yêu cầu nào</p>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
