import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import listingService from '../../../services/listingService';
import type { ListingSummaryResponse } from '../../../types/listing';
import { useLandlordNav } from '../../../hooks/useLandlordNav';

export default function LandlordAnalyticsPage() {
  const { landlordUser, sideNav } = useLandlordNav('analytics');

  const [listings, setListings] = useState<ListingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listingService.getMyListings({ page: 0, size: 100 })
      .then(res => setListings(res.content))
      .catch(err => console.error('Failed to fetch listings:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter(l => (l as any).status === 'ACTIVE').length;
    const pending = listings.filter(l => (l as any).status === 'PENDING').length;
    const rejected = listings.filter(l => (l as any).status === 'REJECTED').length;
    const inactive = listings.filter(l => (l as any).status === 'INACTIVE').length;

    // Room type breakdown
    const roomTypes: Record<string, number> = {};
    listings.forEach(l => {
      const rt = l.roomType || 'Khác';
      roomTypes[rt] = (roomTypes[rt] || 0) + 1;
    });

    // Location breakdown
    const locations: Record<string, number> = {};
    listings.forEach(l => {
      const loc = l.city || 'Khác';
      locations[loc] = (locations[loc] || 0) + 1;
    });

    // Monthly trend
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = `Th ${month + 1}/${year}`;
      const count = listings.filter(l => {
        const c = new Date((l as any).createdAt);
        return c.getFullYear() === year && c.getMonth() === month;
      }).length;
      monthlyData.push({ label: monthLabel, shortLabel: `Th ${month + 1}`, value: count });
    }

    // Price range
    const prices = listings.map(l => l.priceRent).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return { total, active, pending, rejected, inactive, roomTypes, locations, monthlyData, avgPrice, minPrice, maxPrice };
  }, [listings]);

  const maxMonthly = Math.max(...stats.monthlyData.map(d => d.value), 1);

  const statusData = [
    { label: 'Hoạt động', value: stats.active, color: 'bg-primary', textColor: 'text-primary' },
    { label: 'Chờ duyệt', value: stats.pending, color: 'bg-secondary', textColor: 'text-secondary' },
    { label: 'Bị từ chối', value: stats.rejected, color: 'bg-error', textColor: 'text-error' },
    { label: 'Tạm ẩn', value: stats.inactive, color: 'bg-outline', textColor: 'text-outline' },
  ];

  const formatPrice = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}tr`;
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return v.toString();
  };

  return (
    <DashboardLayout sideNavProps={sideNav} user={landlordUser}>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
          Thống kê & Phân tích
        </h1>
        <p className="text-on-surface-variant font-body">
          Tổng quan hiệu suất tin đăng của bạn trên ToToRo.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-primary-container/30 border border-primary-container/50 rounded-2xl p-5">
              <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">Tổng tin</span>
              <p className="text-3xl font-headline font-extrabold mt-1 text-on-surface">{stats.total}</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-5">
              <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">Hoạt động</span>
              <p className="text-3xl font-headline font-extrabold mt-1 text-primary">{stats.active}</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-5">
              <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">Chờ duyệt</span>
              <p className="text-3xl font-headline font-extrabold mt-1 text-secondary">{stats.pending}</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-5">
              <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">Giá TB</span>
              <p className="text-3xl font-headline font-extrabold mt-1 text-on-surface">{formatPrice(stats.avgPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Monthly Trend Chart */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">trending_up</span>
                Tin đăng theo tháng
              </h3>
              <div className="flex items-end gap-3 h-[140px]">
                {stats.monthlyData.map((d, i) => {
                  const heightPercent = d.value > 0 ? Math.max((d.value / maxMonthly) * 100, 8) : 8;
                  const isEmpty = d.value === 0;
                  const isLast = i === stats.monthlyData.length - 1;
                  return (
                    <div key={i} className="group relative flex-1 h-full flex flex-col items-center justify-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isLast ? 'bg-primary' : isEmpty ? 'bg-outline-variant/20' : 'bg-surface-container hover:bg-primary-fixed-dim'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-outline mt-1.5 font-label">{d.shortLabel}</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-ambient">
                        {d.label}: {d.value} tin
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">donut_large</span>
                Phân bổ trạng thái
              </h3>
              {stats.total > 0 ? (
                <div className="space-y-4">
                  {/* Progress bars */}
                  {statusData.map(s => {
                    const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0;
                    return (
                      <div key={s.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold text-on-surface">{s.label}</span>
                          <span className={`text-sm font-bold ${s.textColor}`}>{s.value} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-2.5">
                          <div className={`${s.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Room Type Breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bed</span>
                Loại phòng
              </h3>
              {Object.keys(stats.roomTypes).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.roomTypes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                        <span className="text-sm font-bold text-on-surface">{type}</span>
                        <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">{count} tin</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
              )}
            </div>

            {/* District Breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Phân bổ khu vực
              </h3>
              {Object.keys(stats.locations).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.locations)
                    .sort(([, a], [, b]) => b - a)
                    .map(([loc, count]) => (
                      <div key={loc} className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
                        <span className="text-sm font-bold text-on-surface">{loc}</span>
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">{count} tin</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Price Insight */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              Phân tích giá
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase mb-1">Giá thấp nhất</p>
                <p className="text-2xl font-headline font-extrabold text-on-surface">{formatPrice(stats.minPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase mb-1">Giá trung bình</p>
                <p className="text-2xl font-headline font-extrabold text-primary">{formatPrice(stats.avgPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase mb-1">Giá cao nhất</p>
                <p className="text-2xl font-headline font-extrabold text-on-surface">{formatPrice(stats.maxPrice)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
