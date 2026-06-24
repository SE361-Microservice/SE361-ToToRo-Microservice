import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import useAuthStore from '../../../store/authStore';
import adminService from '../../../services/adminService';
import type { ListingSummaryResponse, ListingStatus } from '../../../types/listing';
import type { PageResponse } from '../../../types/api';
import Modal from '../../../components/core/Modal';
import { useToast } from '../../../hooks/useToast';

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ẩn',
  REJECTED: 'Bị từ chối',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-secondary-container text-on-secondary-container',
  ACTIVE: 'bg-primary-container text-on-primary-container',
  INACTIVE: 'bg-surface-container-highest text-on-surface-variant',
  REJECTED: 'bg-error-container text-on-error-container',
};

const FILTER_OPTIONS: { label: string; value: ListingStatus | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Hoạt động', value: 'ACTIVE' },
  { label: 'Tạm ẩn', value: 'INACTIVE' },
  { label: 'Bị từ chối', value: 'REJECTED' },
];

export default function AdminListingsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const [listings, setListings] = useState<ListingSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | ''>('');
  const [stats, setStats] = useState<Record<string, number>>({});

  // Action modal
  const [selectedListing, setSelectedListing] = useState<ListingSummaryResponse | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchListings = (pageNum: number, status?: ListingStatus | '') => {
    setIsLoading(true);
    adminService.getAllListingsForAdmin(status || undefined, pageNum, 20)
      .then((res: PageResponse<ListingSummaryResponse>) => {
        setListings(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(err => console.error('Failed to fetch listings:', err))
      .finally(() => setIsLoading(false));
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminService.getListingStats();
      setStats({
        PENDING: statsData.PENDING || 0,
        ACTIVE: statsData.ACTIVE || 0,
        INACTIVE: statsData.INACTIVE || 0,
        REJECTED: statsData.REJECTED || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => { 
    fetchListings(page, statusFilter); 
    fetchStats();
  }, [page, statusFilter]);

  const handleAction = async () => {
    if (!selectedListing || !actionType) return;
    if (actionType === 'reject' && !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối.');
      return;
    }
    setIsActing(true);
    try {
      if (actionType === 'approve') {
        await adminService.activateListing(selectedListing.id);
        toast.success('Duyệt tin đăng thành công.');
      } else {
        await adminService.rejectListing(selectedListing.id, rejectReason.trim());
        toast.success('Từ chối tin đăng thành công.');
      }
      fetchListings(page, statusFilter);
      setSelectedListing(null);
      setActionType(null);
      setRejectReason('');
    } catch (err) {
      console.error(`Failed to ${actionType} listing:`, err);
      toast.error(`Có lỗi xảy ra khi ${actionType === 'approve' ? 'duyệt' : 'từ chối'} tin đăng.`);
    } finally {
      setIsActing(false);
    }
  };

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: true },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  return (
    <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            Quản lý tin đăng
          </h1>
          <p className="text-on-surface-variant font-body">
            {totalElements} tin đăng trên toàn hệ thống
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1.5 rounded-2xl">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                statusFilter === opt.value
                  ? 'bg-surface-container-lowest shadow-sm text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {FILTER_OPTIONS.filter(o => o.value !== '').map((opt) => (
          <div key={opt.value} className={`p-5 rounded-2xl ${opt.value === 'PENDING' ? 'bg-secondary-container/30 border border-secondary-container/50' : 'bg-surface-container'}`}>
            <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">{opt.label}</span>
            <p className="text-2xl font-headline font-extrabold mt-1">
              {stats[opt.value as string] !== undefined ? stats[opt.value as string] : '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 px-6 py-4 text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
          <div className="col-span-5">Tin đăng</div>
          <div className="col-span-2">Giá / Loại</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-1">Ngày tạo</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Rows */}
        {!isLoading && listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(55,50,34,0.06)] p-4 md:p-6 transition-transform hover:-translate-y-0.5 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6">
              {/* Listing info */}
              <div className="col-span-5 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                  {listing.coverImageUrl ? (
                    <img src={listing.coverImageUrl} className="w-full h-full object-cover" alt={listing.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-3xl">image</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-headline font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    {listing.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-center mt-1 truncate">
                    <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                    {listing.address}{listing.district ? `, ${listing.district}` : ''}{listing.city ? `, ${listing.city}` : ''}
                  </p>
                </div>
              </div>

              {/* Price / Type */}
              <div className="col-span-2">
                <p className="font-headline font-extrabold text-primary">{listing.priceRent?.toLocaleString()}đ</p>
                <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{listing.roomType}</p>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[listing.status] || statusColors.ACTIVE}`}>
                  {statusLabels[listing.status] || 'Hoạt động'}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-1">
                <p className="text-xs font-medium text-on-surface-variant">
                  {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end items-center gap-2 border-t md:border-none pt-3 md:pt-0 mt-3 md:mt-0 flex-wrap">
                <button
                  onClick={() => navigate(`/listings/${listing.id}`, { state: { fromAdmin: true } })}
                  className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer"
                  title="Xem chi tiết"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
                {listing.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setActionType('approve');
                      }}
                      className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors cursor-pointer"
                      title="Duyệt"
                    >
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setActionType('reject');
                      }}
                      className="p-2 hover:bg-error/10 rounded-full text-error transition-colors cursor-pointer"
                      title="Từ chối"
                    >
                      <span className="material-symbols-outlined text-[20px]">cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty */}
        {!isLoading && listings.length === 0 && (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-4xl text-outline mb-3 block">home_work</span>
            <p className="font-headline font-bold text-lg text-on-surface">Không có tin đăng nào</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {statusFilter ? `Không tìm thấy tin đăng với trạng thái "${statusLabels[statusFilter]}"` : 'Hệ thống chưa có tin đăng nào'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-outline-variant/20 pt-8">
          <p className="text-sm font-body text-on-surface-variant">
            Trang {page + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page < 3 ? i : page - 2 + i;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${
                    pageNum === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Approve/Reject Confirmation Modal */}
      <Modal
        isOpen={!!selectedListing && !!actionType}
        onClose={() => { setSelectedListing(null); setActionType(null); setRejectReason(''); }}
        title={actionType === 'approve' ? 'Duyệt tin đăng' : 'Từ chối tin đăng'}
      >
        <div className="p-6">
          {selectedListing && (
            <>
              <div className="flex items-center gap-4 mb-6 p-4 bg-surface-container rounded-2xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-high">
                  {selectedListing.coverImageUrl ? (
                    <img src={selectedListing.coverImageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-headline font-bold">{selectedListing.title}</p>
                  <p className="text-sm text-on-surface-variant">{selectedListing.address}</p>
                </div>
              </div>

              <p className="text-sm text-on-surface-variant mb-6">
                {actionType === 'approve'
                  ? 'Bạn có chắc muốn duyệt tin đăng này? Tin sẽ xuất hiện công khai trên hệ thống.'
                  : 'Bạn có chắc muốn từ chối tin đăng này? Tin sẽ bị ẩn khỏi hệ thống.'
                }
              </p>

              {actionType === 'reject' && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    Lý do từ chối <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối (ví dụ: Thông tin không chính xác, hình ảnh mờ...)"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant focus:border-primary focus:outline-none resize-none h-24 text-sm text-on-surface font-body transition-colors"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setSelectedListing(null); setActionType(null); setRejectReason(''); }}
                  className="px-4 py-2 font-bold text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAction}
                  disabled={isActing || (actionType === 'reject' && !rejectReason.trim())}
                  className={`px-6 py-2 font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg ${
                    actionType === 'approve'
                      ? 'bg-primary text-on-primary shadow-primary/20 hover:opacity-90'
                      : 'bg-error text-on-error shadow-error/20 hover:opacity-90'
                  }`}
                >
                  {isActing && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  {actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
