import { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import useAuthStore from '../../../store/authStore';
import adminService from '../../../services/adminService';
import type { ListingSummaryResponse } from '../../../types/listing';

// ── Types ──────────────────────────────────────────────────
interface AnalyticsData {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  totalUsers: number;
  pendingReports: number;
  roomTypeBreakdown: { label: string; count: number; percent: number; color: string }[];
  locationDistribution: { name: string; count: number; percent: number }[];
  listingsInPeriod: number;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Phòng trọ',
  shared: 'Phòng chung',
  apartment: 'Căn hộ',
  studio: 'Studio',
};

const ROOM_TYPE_COLORS: string[] = [
  'bg-primary',
  'bg-secondary',
  'bg-primary-container',
  'bg-tertiary',
];

const DONUT_STROKE_COLORS: string[] = [
  '#406934',
  '#855500',
  '#c0f0ad',
  '#406845',
];

const AI_INSIGHTS = [
  {
    icon: 'trending_up',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    borderColor: 'border-primary',
    priority: 'Xu hướng',
    title: 'Phân tích nhu cầu thị trường',
    desc: 'Dựa trên phân bổ loại phòng hiện tại, hãy theo dõi loại phòng chiếm tỷ trọng cao nhất và khu vực có nhiều tin đăng nhất để định hướng kiểm duyệt.',
  },
  {
    icon: 'campaign',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
    borderColor: 'border-secondary',
    title: 'Tối ưu tỷ lệ duyệt',
    desc: 'Theo dõi tỷ lệ tin chờ duyệt so với tổng tin. Nếu tỷ lệ vượt 20%, cân nhắc tăng cường nhân sự kiểm duyệt để cải thiện trải nghiệm người đăng.',
  },
  {
    icon: 'shield',
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
    borderColor: 'border-error',
    priority: 'Cần chú ý',
    title: 'Giám sát vi phạm',
    desc: 'Kiểm tra số báo cáo vi phạm đang chờ xử lý. Giải quyết nhanh chóng giúp duy trì chất lượng nền tảng và niềm tin của người dùng.',
  },
];

// ── Month picker helpers ────────────────────────────────────
function getMonthOptions(): { label: string; year: number; month: number }[] {
  const options: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return options;
}

// ── Component ────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const { user: authUser, isAuthenticated } = useAuthStore();

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: true },
    ],
    breakpoint: 'lg',
  }), []);

  // ── State ──────────────────────────────────────────────
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(0); // index into monthOptions
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    rejectedListings: 0,
    totalUsers: 0,
    pendingReports: 0,
    roomTypeBreakdown: [],
    locationDistribution: [],
    listingsInPeriod: 0,
  });

  // ── Fetch all real data ────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch counts by status (size=1 just to get totalElements)
      const [pendingRes, activeRes, inactiveRes, rejectedRes, usersRes, reportsRes, allListingsRes] =
        await Promise.all([
          adminService.getAllListingsForAdmin('PENDING', 0, 1),
          adminService.getAllListingsForAdmin('ACTIVE', 0, 1),
          adminService.getAllListingsForAdmin('INACTIVE', 0, 1),
          adminService.getAllListingsForAdmin('REJECTED', 0, 1),
          adminService.getAllUsersForAdmin(0, 1),
          adminService.getPendingReports().catch(() => []),
          // Fetch ALL listings for breakdown analysis (up to 500)
          adminService.getAllListingsForAdmin(undefined, 0, 500),
        ]);

      const allListings: ListingSummaryResponse[] = allListingsRes.content;
      const totalListings = pendingRes.totalElements + activeRes.totalElements +
                            inactiveRes.totalElements + rejectedRes.totalElements;

      // Filter by selected month/year
      const { year, month } = monthOptions[selectedMonth];
      const filteredListings = allListings.filter(l => {
        if (!l.createdAt) return false;
        const d = new Date(l.createdAt);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      // Room type breakdown (from ALL listings)
      const roomCounts: Record<string, number> = {};
      allListings.forEach(l => {
        const rt = l.roomType || 'other';
        roomCounts[rt] = (roomCounts[rt] || 0) + 1;
      });
      const roomTypeBreakdown = Object.entries(roomCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([type, count], i) => ({
          label: ROOM_TYPE_LABELS[type] || type,
          count,
          percent: totalListings > 0 ? Math.round((count / totalListings) * 100) : 0,
          color: ROOM_TYPE_COLORS[i % ROOM_TYPE_COLORS.length],
        }));

      // Location distribution (from ALL listings)
      const locationCounts: Record<string, number> = {};
      allListings.forEach(l => {
        const loc = l.city || 'Khác';
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });
      const locationDistribution = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, count]) => ({
          name,
          count,
          percent: totalListings > 0 ? Math.round((count / totalListings) * 100) : 0,
        }));

      setData({
        totalListings,
        activeListings: activeRes.totalElements,
        pendingListings: pendingRes.totalElements,
        rejectedListings: rejectedRes.totalElements,
        totalUsers: usersRes.totalElements,
        pendingReports: Array.isArray(reportsRes) ? reportsRes.length : 0,
        roomTypeBreakdown,
        locationDistribution,
        listingsInPeriod: filteredListings.length,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, monthOptions]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const activePct = data.totalListings > 0
    ? Math.round((data.activeListings / data.totalListings) * 100) : 0;

  return (
    <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            Phân tích & Thống kê
          </h1>
          <p className="text-on-surface-variant font-body">
            Tổng quan hiệu suất và xu hướng của hệ thống
          </p>
        </div>
        {/* Month Picker */}
        <div className="relative">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center bg-surface-container px-4 py-2.5 rounded-full text-sm font-bold text-primary gap-2 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {monthOptions[selectedMonth].label}
            <span className="material-symbols-outlined text-[18px] ml-1">expand_more</span>
          </button>
          {showMonthPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(55,50,34,0.15)] border border-outline-variant/10 py-2 w-56 max-h-80 overflow-y-auto">
                {monthOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedMonth(idx); setShowMonthPicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      idx === selectedMonth
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-on-surface-variant">Đang tải dữ liệu phân tích...</span>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {[
              { label: 'Tổng tin đăng', value: data.totalListings, icon: 'home_work', color: 'text-primary' },
              { label: 'Đang hoạt động', value: data.activeListings, icon: 'check_circle', color: 'text-primary' },
              { label: 'Chờ duyệt', value: data.pendingListings, icon: 'pending', color: 'text-secondary' },
              { label: 'Tổng người dùng', value: data.totalUsers, icon: 'group', color: 'text-primary' },
              { label: 'Báo cáo chờ xử lý', value: data.pendingReports, icon: 'flag', color: 'text-error' },
              { label: 'Tin trong tháng', value: data.listingsInPeriod, icon: 'calendar_month', color: 'text-secondary' },
            ].map(m => (
              <div key={m.label} className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_8px_24px_rgba(55,50,34,0.04)]">
                <div className="flex items-center justify-between mb-3">
                  <span className={`material-symbols-outlined text-[20px] ${m.color}`}>{m.icon}</span>
                </div>
                <p className="text-2xl font-headline font-extrabold text-on-surface">
                  {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-6 mb-10">
            {/* Status Breakdown Bar */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(55,50,34,0.06)]">
              <h3 className="font-headline font-bold text-lg mb-2">Phân bổ trạng thái tin đăng</h3>
              <p className="text-xs text-on-surface-variant font-medium mb-8">Dữ liệu thời gian thực từ hệ thống</p>

              {/* Stacked bar visualization */}
              <div className="space-y-6">
                {[
                  { label: 'Hoạt động', count: data.activeListings, color: 'bg-primary', textColor: 'text-primary' },
                  { label: 'Chờ duyệt', count: data.pendingListings, color: 'bg-secondary', textColor: 'text-secondary' },
                  { label: 'Bị từ chối', count: data.rejectedListings, color: 'bg-error', textColor: 'text-error' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className={`font-bold ${s.textColor}`}>{s.label}</span>
                      <span className="text-on-surface-variant font-medium">
                        {s.count} tin • {data.totalListings > 0 ? Math.round((s.count / data.totalListings) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full transition-all duration-700`}
                        style={{ width: `${data.totalListings > 0 ? (s.count / data.totalListings) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall progress */}
              <div className="mt-8 p-4 bg-surface-container rounded-xl">
                <div className="flex justify-between text-sm font-bold text-on-surface-variant mb-2">
                  <span>Tỷ lệ hoạt động</span>
                  <span>{activePct}%</span>
                </div>
                <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full transition-all duration-700"
                    style={{ width: `${activePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Room Type Distribution - Donut */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-highest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(55,50,34,0.06)]">
              <h3 className="font-headline font-bold text-lg mb-8">Phân bổ loại phòng</h3>
              {data.roomTypeBreakdown.length > 0 ? (
                <>
                  <div className="relative flex justify-center py-4">
                    <svg className="w-48 h-48 transform -rotate-90">
                      {(() => {
                        let offset = 0;
                        const radius = 80;
                        const circumference = 2 * Math.PI * radius;
                        return data.roomTypeBreakdown.map((item, i) => {
                          const dashArray = (item.percent / 100) * circumference;
                          offset += item.percent;
                          return (
                            <circle
                              key={item.label}
                              cx="96" cy="96" r={radius}
                              fill="transparent"
                              stroke={DONUT_STROKE_COLORS[i % DONUT_STROKE_COLORS.length]}
                              strokeWidth="28"
                              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                              strokeDashoffset={-((offset - item.percent) / 100) * circumference}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-on-surface-variant uppercase">Tổng cộng</span>
                      <span className="text-xl font-headline font-extrabold text-on-surface">{data.totalListings}</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {data.roomTypeBreakdown.map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm font-medium">{item.label} ({item.percent}%)</span>
                        <span className="text-sm font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-on-surface-variant text-sm">
                  Chưa có dữ liệu tin đăng
                </div>
              )}
            </div>
          </div>

          {/* Location Distribution */}
          <div className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_rgba(55,50,34,0.06)]">
              <h3 className="font-headline font-bold text-lg mb-6">Phân bổ theo Tỉnh/Thành</h3>
              {data.locationDistribution.length > 0 ? (
                <div className="space-y-4">
                  {data.locationDistribution.map((loc) => (
                    <div key={loc.name}>
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="font-bold text-on-surface">{loc.name}</span>
                        <span className="text-on-surface-variant font-medium">{loc.count} tin • {loc.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full transition-all duration-700"
                          style={{ width: `${loc.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-on-surface-variant text-sm">
                  Chưa có dữ liệu khu vực
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-xl font-headline font-extrabold">Gợi ý từ AI</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {AI_INSIGHTS.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`bg-surface-container-lowest rounded-2xl p-6 border-l-4 ${insight.borderColor} shadow-[0_8px_24px_rgba(55,50,34,0.04)] flex gap-4 items-start`}
                  >
                    <div className={`p-2.5 rounded-xl ${insight.iconBg} flex-shrink-0`}>
                      <span className={`material-symbols-outlined ${insight.iconColor}`}>{insight.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-headline font-bold text-on-surface">{insight.title}</h4>
                        {insight.priority && (
                          <span className="text-[9px] font-black bg-primary text-on-primary px-2 py-0.5 rounded uppercase tracking-wider">
                            {insight.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div className="bg-primary rounded-2xl p-8 text-on-primary shadow-[0_12px_32px_rgba(55,50,34,0.12)] relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-primary-dim rounded-full opacity-40" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-headline font-extrabold mb-2">Tổng quan hệ thống</h3>
                <p className="text-sm opacity-90 max-w-xl leading-relaxed">
                  Hệ thống đang hoạt động với {data.totalUsers.toLocaleString()} người dùng và {data.totalListings} tin đăng.
                  Tỷ lệ hoạt động đạt {activePct}%.
                  {data.pendingReports > 0 && ` Có ${data.pendingReports} báo cáo vi phạm đang chờ xử lý.`}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center min-w-[80px]">
                  <span className="block text-2xl font-headline font-extrabold">{data.activeListings}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Hoạt động</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center min-w-[80px]">
                  <span className="block text-2xl font-headline font-extrabold">{data.pendingListings}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Chờ duyệt</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
