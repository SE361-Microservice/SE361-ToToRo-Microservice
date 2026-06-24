import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import listingService from '../../../services/listingService';
import type { ListingSummaryResponse } from '../../../types/listing';
import type { PageResponse } from '../../../types/api';
import { useLandlordNav } from '../../../hooks/useLandlordNav';

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

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { landlordUser, sideNav } = useLandlordNav('listings');

  const [listings, setListings] = useState<ListingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchListings = (pageNum: number) => {
    setIsLoading(true);
    listingService.getMyListings({ page: pageNum, size: 10 })
      .then((res: PageResponse<ListingSummaryResponse>) => {
        setListings(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(err => console.error('Failed to fetch my listings:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchListings(page); }, [page]);

  const activeCount = listings.filter(l => (l as any).status === 'ACTIVE').length;
  const pendingCount = listings.filter(l => (l as any).status === 'PENDING').length;

  return (
    <DashboardLayout sideNavProps={sideNav} user={landlordUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            Tin đăng của tôi
          </h1>
          <p className="text-on-surface-variant font-body italic">
            Quản lý phòng trọ và kết nối với sinh viên
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/listings/new')}
          className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-6 py-3 rounded-xl font-headline font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Đăng tin mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary-container/30 p-6 rounded-2xl border border-primary-container/50">
          <span className="text-xs font-label font-bold tracking-widest text-primary uppercase">Tổng tin đăng</span>
          <p className="text-3xl font-headline font-extrabold mt-1 text-on-primary-container">{totalElements} phòng</p>
        </div>
        <div className="bg-surface-container p-6 rounded-2xl">
          <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant uppercase">Đang hoạt động</span>
          <p className="text-3xl font-headline font-extrabold mt-1">{activeCount}</p>
        </div>
        <div className="bg-secondary-container/30 p-6 rounded-2xl border border-secondary-container/50">
          <span className="text-xs font-label font-bold tracking-widest text-secondary uppercase">Chờ duyệt</span>
          <p className="text-3xl font-headline font-extrabold mt-1 text-on-secondary-container">{pendingCount}</p>
        </div>
      </div>

      {/* Listings Table */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-6 py-4 text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
          <div className="col-span-5">Chi tiết phòng</div>
          <div className="col-span-2">Giá / Trạng thái</div>
          <div className="col-span-2">Ngày đăng</div>
          <div className="col-span-1">Lượt xem</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải tin đăng...</span>
            </div>
          </div>
        )}

        {/* Listing Rows */}
        {!isLoading && listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(55,50,34,0.06)] p-4 md:p-6 transition-transform hover:-translate-y-1 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6">
              {/* Property Details */}
              <div className="md:col-span-5 flex items-center gap-4 md:gap-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
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
                    className="font-headline font-bold text-lg text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    {listing.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-center mt-1 truncate">
                    <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                  </p>
                </div>
              </div>

              {/* Price / Status */}
              <div className="md:col-span-2 flex justify-between md:block items-start mt-3 md:mt-0">
                <div>
                  <p className="font-headline font-extrabold text-primary">{listing.priceRent?.toLocaleString()}đ</p>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${statusColors[listing.status] || statusColors.ACTIVE}`}>
                    {statusLabels[listing.status] || 'Hoạt động'}
                  </span>
                </div>
                {listing.status === 'REJECTED' && (listing as any).rejectionReason && (
                  <p className="text-xs text-error font-body mt-1 italic max-w-[200px]" title={(listing as any).rejectionReason}>
                    Lý do: {(listing as any).rejectionReason}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="md:col-span-2 hidden md:block">
                <p className="text-sm font-medium text-on-surface-variant">
                  {new Date(listing.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>

              {/* Views */}
              <div className="md:col-span-1 hidden md:block">
                <p className="text-sm font-bold flex items-center">
                  <span className="material-symbols-outlined text-sm mr-1 opacity-40">visibility</span>
                  {listing.viewCount?.toLocaleString() ?? 0}
                </p>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex justify-end items-center gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/20 md:border-t-0">
                <button
                  onClick={() => navigate(`/dashboard/listings/${listing.id}/edit`)}
                  className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                  title="Chỉnh sửa"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  onClick={() => navigate(`/listings/${listing.id}`)}
                  className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                  title="Xem chi tiết"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
                <button
                  className="p-2 hover:bg-error/10 rounded-full text-error transition-colors"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty */}
        {!isLoading && listings.length === 0 && (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">home_work</span>
            <p className="font-headline font-bold text-xl text-on-surface mb-2">Bạn chưa có tin đăng nào</p>
            <p className="text-on-surface-variant mb-6">Bắt đầu đăng phòng trọ để kết nối với sinh viên</p>
            <button
              onClick={() => navigate('/dashboard/listings/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Đăng tin đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-outline-variant/20 pt-8">
          <p className="text-sm font-body text-on-surface-variant">
            Hiển thị {listings.length} / {totalElements} tin đăng
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
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
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

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-8 right-8 z-40">
        <button
          onClick={() => navigate('/dashboard/listings/new')}
          className="w-16 h-16 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </DashboardLayout>
  );
}
