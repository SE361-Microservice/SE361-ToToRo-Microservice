import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../../layouts/StudentLayout';
import ListingCard from "../../../components/common/ListingCard";
import savedListingService from '../../../services/savedListingService';
import type { ListingSummaryResponse } from '../../../types/listing';
import useAuthStore from '../../../store/authStore';
import type { Listing } from '../../../types/listing';

function toListingCompat(summary: ListingSummaryResponse): Listing {
  return {
    id: String(summary.id),
    landlordId: '',
    title: summary.title,
    description: '',
    address: summary.address,
    city: summary.city,
    latitude: summary.latitude,
    longitude: summary.longitude,
    roomType: summary.roomType as Listing['roomType'],
    areaM2: summary.areaM2,
    priceRent: summary.priceRent,
    status: 'ACTIVE',
    isSharedOwner: false,
    maxOccupants: 0,
    createdAt: summary.createdAt,
    updatedAt: summary.createdAt,
    images: summary.coverImageUrl
      ? [{ id: '0', listingId: String(summary.id), url: summary.coverImageUrl, isCover: true, sortOrder: 0, createdAt: summary.createdAt }]
      : [],
    tags: summary.tags?.map(t => ({ id: String(t.id), name: t.name, slug: t.slug })) ?? [],
  };
}

export default function SavedListingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [savedListings, setSavedListings] = useState<ListingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navUser = isAuthenticated && user ? {
    name: user.fullName || user.email,
    avatar: user.avatarUrl || '',
    role: user.role
  } : undefined;

  useEffect(() => {
    const fetchSavedListings = async () => {
      setIsLoading(true);
      try {
        const response = await savedListingService.getSavedListings({ page: currentPage, size: 12 });
        setSavedListings(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to load saved listings', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSavedListings();
    } else {
      setIsLoading(false);
    }
  }, [currentPage, isAuthenticated]);

  return (
    <StudentLayout user={navUser}>
      <div className="px-4">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Trang chủ
            </button>
            <span>•</span>
            <span className="text-on-surface font-bold">Thông báo</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[32px]">favorite</span>
                Nhà trọ đã lưu
              </h1>
              <p className="text-on-surface-variant mt-1 text-sm">Xem lại các phòng trọ bạn đã thêm vào danh sách yêu thích</p>
            </div>
          </div>


        {!isAuthenticated ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">bookmark_border</span>
            <h2 className="text-xl font-bold font-headline mb-2 text-on-surface">Bạn chưa đăng nhập</h2>
            <p className="text-on-surface-variant mb-6">Vui lòng đăng nhập để xem danh sách phòng trọ đã lưu.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold hover:scale-105 transition-transform"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải danh sách...</span>
            </div>
          </div>
        ) : savedListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedListings.map(listing => (
                <div key={listing.id} className="relative group">
                  <ListingCard 
                    listing={toListingCompat(listing)} 
                    isSaved={true}
                    onToggleSave={async (id) => {
                      try {
                        await savedListingService.toggleSave(parseInt(id, 10));
                        setSavedListings(prev => prev.filter(l => l.id !== parseInt(id, 10)));
                      } catch (err) {
                        console.error('Failed to unsave listing', err);
                      }
                    }}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg font-bold border border-outline-variant disabled:opacity-50 hover:bg-surface-container transition-colors text-sm"
                >
                  Trước
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        currentPage === i 
                          ? 'bg-primary text-on-primary shadow-md' 
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg font-bold border border-outline-variant disabled:opacity-50 hover:bg-surface-container transition-colors text-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">favorite_border</span>
            <h2 className="text-xl font-bold font-headline mb-2 text-on-surface">Bạn chưa lưu phòng trọ nào</h2>
            <p className="text-on-surface-variant mb-6">Hãy lướt tìm những phòng trọ ưng ý và nhấn nút trái tim để lưu lại nhé.</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold hover:scale-105 transition-transform"
            >
              Tìm phòng ngay
            </button>
          </div>
        )}
        </div>
      </div>
    </StudentLayout>
  );
}
