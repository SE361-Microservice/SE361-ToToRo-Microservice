import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import listingService from '../../../services/listingService';
import savedListingService from '../../../services/savedListingService';
import reviewService from '../../../services/reviewService';
import reportService from '../../../services/reportService';
import chatService from '../../../services/chatService';
import type { ListingDetailResponse } from '../../../types/listing';
import type { ReviewResponse } from '../../../types/review';
import TopNavBar from '../../../components/common/TopNavBar';
import MapView from '../../../components/common/MapView';
import ReviewSection from '../components/ReviewSection';
import Modal from '../../../components/core/Modal';
import useAuthStore from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';

export default function ListingDetailPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin;
  
  const [listing, setListing] = useState<ListingDetailResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { user: authUser, isAuthenticated } = useAuthStore();
  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  const navLinks = isAuthenticated ? [
    { label: 'Trang chủ', href: '/home' },
    { label: 'Tìm phòng', href: '/search' },
    { label: 'Matchmates', href: '/matching' },
    { label: 'Cộng đồng', href: '/community' },
    { label: 'Tin nhắn', href: '/messages' },
  ] : [];

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    Promise.all([
      listingService.getById(Number(id)),
      // Only check saved status if user is logged in
      isAuthenticated 
        ? savedListingService.checkSaved(Number(id)).catch(() => ({ saved: false }))
        : Promise.resolve({ saved: false }),
      reviewService.getReviewsByListing(Number(id)).catch(() => [])
    ])
      .then(([listingData, savedData, reviewsData]) => {
        setListing(listingData);
        setIsSaved(savedData.saved);
        setReviews(reviewsData);
        
        // Tracking view count
        if (!fromAdmin && authUser?.id !== listingData.landlordId) {
          listingService.incrementViewCount(listingData.id).catch(console.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch listing:', err);
        setError('Không thể tải thông tin phòng. Vui lòng thử lại.');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleToggleSave = async () => {
    if (!listing || isSaving) return;
    
    setIsSaving(true);
    try {
      const res = await savedListingService.toggleSave(listing.id);
      setIsSaved(res.saved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
      // Optional: show a toast here if there's a toast system
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    if (!listing) return;
    try {
      const newReview = await reviewService.createReview({
        listingId: listing.id,
        ratingOverall: data.rating,
        content: data.comment,
        // Using overall rating for sub-ratings as a simple default
        ratingCleanliness: data.rating,
        ratingSecurity: data.rating,
        ratingLandlord: data.rating,
        ratingAccuracy: data.rating
      });
      setReviews(prev => [newReview, ...prev]);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const handleReportSubmit = async () => {
    if (!listing || !reportReason.trim()) return;
    setIsSubmittingReport(true);
    try {
      await reportService.createReport({
        targetType: 'LISTING',
        targetId: listing.id,
        reason: reportReason.trim()
      });
      setIsReportModalOpen(false);
      setReportReason('');
      toast.success('Đã gửi báo cáo thành công. Cảm ơn bạn đã đóng góp!');
    } catch (err) {
      console.error('Failed to submit report:', err);
      toast.error('Có lỗi xảy ra khi gửi báo cáo.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-background font-body">
        <TopNavBar variant={isAuthenticated ? "student" : "guest"} user={navUser} navLinks={navLinks} extraActions={isAuthenticated && authUser?.role === 'STUDENT' ? [{ icon: 'bookmark', label: 'Nhà trọ đã lưu', onClick: () => window.location.assign('/saved') }] : undefined} />
        <main className="pt-[72px] pb-24 max-w-7xl mx-auto px-4 md:px-8">
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải thông tin phòng...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background text-on-background font-body">
        <TopNavBar variant={isAuthenticated ? "student" : "guest"} user={navUser} navLinks={navLinks} extraActions={isAuthenticated && authUser?.role === 'STUDENT' ? [{ icon: 'bookmark', label: 'Nhà trọ đã lưu', onClick: () => window.location.assign('/saved') }] : undefined} />
        <main className="pt-[72px] pb-24 max-w-7xl mx-auto px-4 md:px-8">
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-error/50 mb-3 block">error</span>
            <p className="font-headline font-bold text-lg text-on-surface mb-1">{error || 'Không tìm thấy phòng'}</p>
            <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/search')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              {fromAdmin ? 'Quay lại Admin' : 'Quay lại'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const allImages = listing.images || [];
  const coverImageObj = allImages.find(img => img.isCover) || allImages[0];
  const otherImagesObj = allImages.filter(img => img.id !== coverImageObj?.id);

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <TopNavBar variant={isAuthenticated ? (authUser?.role === 'ADMIN' ? 'dashboard' : 'student') : "guest"} user={navUser} navLinks={navLinks} extraActions={isAuthenticated && authUser?.role === 'STUDENT' ? [{ icon: 'bookmark', label: 'Nhà trọ đã lưu', onClick: () => window.location.assign('/saved') }] : undefined} />

      <main className="pt-[72px] pb-24 max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 mt-4">
          <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/search')} className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {fromAdmin ? 'Quay lại Admin' : 'Quay lại'}
          </button>
          <span>•</span>
        </div>

        {/* Rejection Alert */}
        {listing.status === 'REJECTED' && authUser?.id === listing.landlordId && (
          <div className="mb-8 p-6 bg-error-container/20 text-on-error-container rounded-3xl border border-error/20 flex gap-4 items-start shadow-lg shadow-error/5 animate-fade-in">
            <span className="material-symbols-outlined text-error text-3xl flex-shrink-0">error</span>
            <div>
              <h3 className="font-headline font-bold text-lg text-error mb-1">Tin đăng bị từ chối duyệt</h3>
              <p className="text-sm font-body opacity-95 mb-2">
                Tin đăng này đã bị Quản trị viên từ chối hiển thị công khai trên hệ thống.
              </p>
              {listing.rejectionReason && (
                <div className="bg-surface-container-lowest/80 p-4 rounded-xl mt-3 border border-error/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Lý do từ chối:</p>
                  <p className="text-sm text-on-surface font-body whitespace-pre-wrap">{listing.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-full uppercase tracking-widest leading-none">
                {listing.roomType === 'studio' ? 'Studio' : listing.roomType === 'apartment' ? 'Căn hộ' : 'Phòng trọ'}
              </span>
              <span className="text-on-surface-variant text-sm flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {listing.viewCount?.toLocaleString() || 0} lượt xem
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
              {listing.title}
            </h1>
            <p className="text-on-surface-variant flex items-center gap-1.5 text-lg">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`flex-1 md:flex-none p-3 rounded-full border-2 border-outline-variant text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors font-bold group ${isSaved ? 'bg-error-container text-on-error-container border-error/20' : ''}`}
            >
              <span className={`material-symbols-outlined transition-colors ${isSaved ? 'text-error' : 'group-hover:text-error'}`}>
                {isSaved ? 'favorite' : 'favorite_border'}
              </span>
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </button>
            <button className="flex-1 md:flex-none p-3 rounded-full border-2 border-outline-variant text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors font-bold">
              <span className="material-symbols-outlined">share</span>
              Chia sẻ
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="p-3 rounded-full border-2 border-outline-variant text-on-surface flex items-center justify-center hover:bg-error-container hover:text-on-error-container hover:border-error/20 transition-colors tooltip-wrapper"
              title="Báo cáo vi phạm"
            >
              <span className="material-symbols-outlined">flag</span>
            </button>
          </div>
        </div>

        {/* Image Gallery Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[50vh] min-h-[400px] mb-12 rounded-3xl overflow-hidden group">
          {coverImageObj ? (
            <div 
              onClick={() => {
                setActiveImageIndex(allImages.indexOf(coverImageObj));
                setIsGalleryOpen(true);
              }}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer"
            >
              <img src={coverImageObj.url} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Cover" />
            </div>
          ) : (
            <div className="md:col-span-2 md:row-span-2 bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant">home</span>
            </div>
          )}

          {/* Show up to 4 other images in the bento grid */}
          {[0, 1, 2, 3].map((idx) => {
            const img = otherImagesObj[idx];
            if (!img) {
              return (
                <div 
                  key={`empty-${idx}`}
                  className="hidden md:flex bg-surface-container-low items-center justify-center border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-3xl text-outline-variant/50">image</span>
                </div>
              );
            }

            const isLast = idx === 3 && otherImagesObj.length > 4;
            const remainingCount = otherImagesObj.length - 4;

            return (
              <div 
                key={img.id}
                onClick={() => {
                  setActiveImageIndex(allImages.indexOf(img));
                  setIsGalleryOpen(true);
                }}
                className="relative overflow-hidden cursor-pointer h-full w-full"
              >
                <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={`View ${idx}`} />
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-all hover:bg-black/50">
                    <span className="text-2xl font-black font-headline">+{remainingCount} ảnh</span>
                    <span className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">Xem tất cả</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Details */}
          <div className="flex-1 space-y-12">
            
            {/* Key Specs */}
            <div className="flex gap-8 border-b border-outline-variant/20 pb-8">
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Diện tích</span>
                <div className="flex justify-start items-center gap-2">
                  <span className="material-symbols-outlined text-outline">straighten</span>
                  <span className="text-xl font-bold">{listing.areaM2} m²</span>
                </div>
              </div>
              <div className="w-px bg-outline-variant/20"></div>
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Sức chứa</span>
                <div className="flex justify-start items-center gap-2">
                  <span className="material-symbols-outlined text-outline">groups</span>
                  <span className="text-xl font-bold">{listing.maxOccupants} người</span>
                </div>
              </div>
              <div className="w-px bg-outline-variant/20"></div>
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Trạng thái</span>
                <div className="flex justify-start items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">event_available</span>
                  <span className="text-xl font-bold">Còn trống</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-headline text-2xl font-bold mb-4">Về không gian này</h3>
              <p className="text-on-surface-variant leading-relaxed mb-4 whitespace-pre-line text-lg">
                {listing.description}
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Chi tiết chi phí
              </h3>
              
              <div className="mb-6 pb-6 border-b border-outline-variant/20">
                <div className="flex justify-between items-end">
                  <span className="text-on-surface font-bold text-lg">Giá thuê chính</span>
                  <div>
                    <span className="text-3xl font-headline font-extrabold text-primary">{listing.priceRent.toLocaleString()}đ</span>
                    <span className="text-on-surface-variant">/tháng</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">bolt</span> Điện
                  </span>
                  <span className="font-bold">{listing.priceElectricity ? `${listing.priceElectricity}đ/kWh` : 'Tính theo giá nhà nước'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">water_drop</span> Nước
                  </span>
                  <span className="font-bold">{listing.priceWater ? `${listing.priceWater.toLocaleString()}đ/người` : 'Miễn phí'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">local_parking</span> Gửi xe
                  </span>
                  <span className="font-bold">{listing.priceParking ? `${listing.priceParking.toLocaleString()}đ/tháng` : 'Miễn phí 1 xe'}</span>
                </div>
              </div>
            </div>

            {/* Facilities & Amenities */}
            {listing.facilities && listing.facilities.filter(f => f.name !== 'pet_allowed').length > 0 && (
              <div>
                <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">apartment</span>
                  Nội thất & Tiện ích
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.facilities.filter(f => f.name !== 'pet_allowed').map((f) => {
                    const iconMap: Record<string, string> = {
                      wifi: 'wifi', aircon: 'ac_unit', washer: 'local_laundry_service', 
                      parking: 'local_parking', fridge: 'kitchen', water_heater: 'hot_tub', 
                      security: 'security', elevator: 'elevator', balcony: 'balcony', 
                      kitchen: 'countertops', furniture: 'chair',
                    };
                    const labelMap: Record<string, string> = {
                      wifi: 'Wi-Fi', aircon: 'Máy lạnh', washer: 'Máy giặt', 
                      parking: 'Chỗ để xe', fridge: 'Tủ lạnh', water_heater: 'Máy nước nóng', 
                      security: 'An ninh 24/7', elevator: 'Thang máy', balcony: 'Ban công', 
                      kitchen: 'Kệ bếp', furniture: 'Nội thất',
                    };
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                          f.isIncluded
                            ? 'bg-primary-container/10 border-primary/20 text-on-surface'
                            : 'bg-surface-container border-outline-variant/20 text-on-surface-variant line-through opacity-60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          {iconMap[f.name] || 'check_circle'}
                        </span>
                        <div>
                          <span className="font-bold text-sm">{labelMap[f.name] || f.name}</span>
                          {f.note && <p className="text-xs text-on-surface-variant">{f.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Policies & Rules */}
            {listing.policy && (
              <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
                <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  Quy định & Pháp lý
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contract & Deposit */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50">
                    <span className="material-symbols-outlined text-[20px] text-outline">description</span>
                    <div>
                      <span className="text-sm text-on-surface-variant">Hợp đồng</span>
                      <p className="font-bold text-sm">
                        {listing.policy.contractType === 'monthly' ? 'Theo tháng' :
                         listing.policy.contractType === 'yearly' ? 'Theo năm' : 'Linh hoạt'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50">
                    <span className="material-symbols-outlined text-[20px] text-outline">savings</span>
                    <div>
                      <span className="text-sm text-on-surface-variant">Tiền cọc</span>
                      <p className="font-bold text-sm">{listing.policy.depositMonths} tháng</p>
                    </div>
                  </div>

                  {/* Time rules */}
                  {(listing.policy.checkinTime || listing.policy.checkoutTime) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50">
                      <span className="material-symbols-outlined text-[20px] text-outline">schedule</span>
                      <div>
                        <span className="text-sm text-on-surface-variant">Giờ ra vào</span>
                        <p className="font-bold text-sm">
                          {listing.policy.checkinTime || '—'} → {listing.policy.checkoutTime || '—'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Boolean policies */}
                  {[
                    { key: 'allowsGuests', icon: 'group', label: 'Khách đến thăm', value: listing.policy.allowsGuests },
                    { key: 'allowsPets', icon: 'pets', label: 'Nuôi thú cưng', value: listing.policy.allowsPets },
                    { key: 'allowsCooking', icon: 'skillet', label: 'Nấu ăn', value: listing.policy.allowsCooking },
                    { key: 'allowsResidenceReg', icon: 'home_pin', label: 'Đăng ký thường trú', value: listing.policy.allowsResidenceReg },
                  ].map((p) => (
                    <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container/50">
                      <span className="material-symbols-outlined text-[20px] text-outline">{p.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm text-on-surface-variant">{p.label}</span>
                      </div>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        p.value
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-error-container text-on-error-container'
                      }`}>
                        {p.value ? 'Được phép' : 'Không'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Other rules */}
                {listing.policy.otherRules && (
                  <div className="mt-6 pt-4 border-t border-outline-variant/20">
                    <p className="text-sm text-on-surface-variant font-bold mb-1">Quy định khác:</p>
                    <p className="text-on-surface text-sm whitespace-pre-line">{listing.policy.otherRules}</p>
                  </div>
                )}
              </div>
            )}

            {/* Map Preview */}
            <div>
              <h3 className="font-headline text-2xl font-bold mb-4">Vị trí trên bản đồ</h3>
              <p className="text-on-surface-variant mb-6">
              </p>
              <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-outline-variant/20 relative">
                <MapView 
                  listings={[{
                    id: String(listing.id),
                    title: listing.title,
                    address: listing.address,
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                    priceRent: listing.priceRent,
                    areaM2: listing.areaM2,
                    roomType: listing.roomType as 'single' | 'shared' | 'apartment' | 'studio',
                    city: listing.city,
                    landlordId: '',
                    description: '',
                    status: 'ACTIVE',
                    isSharedOwner: false,
                    maxOccupants: listing.maxOccupants,
                    createdAt: listing.createdAt,
                    updatedAt: listing.updatedAt,
                  }]} 
                  center={{ lat: listing.latitude, lng: listing.longitude }}
                  zoom={15}
                />
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
              reviews={reviews.map(r => ({
                id: r.id.toString(),
                listingId: r.listingId.toString(),
                userId: r.userId.toString(),
                userName: r.userFullName,
                userAvatar: r.userAvatarUrl,
                rating: r.ratingOverall,
                ratingCleanliness: r.ratingCleanliness,
                ratingSecurity: r.ratingSecurity,
                ratingLandlord: r.ratingLandlord,
                ratingAccuracy: r.ratingAccuracy,
                comment: r.content || '',
                upvoteCount: r.upvoteCount,
                createdAt: r.createdAt
              }))}
              avgRating={reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.ratingOverall, 0) / reviews.length : 0}
              reviewCount={reviews.length}
              onSubmit={handleReviewSubmit}
            />
          </div>

          {/* Right Column: Sticky Landlord Card */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-[100px] bg-surface-container-lowest rounded-3xl p-6 shadow-[0_24px_48px_rgba(55,50,34,0.08)] border border-outline-variant/10">
              
              <div className="flex justify-between items-baseline mb-6">
                <h3 className="text-3xl font-headline font-extrabold text-primary">{listing.priceRent.toLocaleString()}đ<span className="text-base font-medium text-on-surface-variant">/tháng</span></h3>
              </div>

              <button 
                onClick={async () => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  if (isContacting) return;
                  setIsContacting(true);
                  try {
                    const conv = await chatService.createConversation({
                      type: 'DIRECT',
                      memberIds: [listing.landlordId],
                    });
                    navigate(`/messages/${conv.id}`);
                  } catch (err) {
                    console.error('Failed to create conversation:', err);
                    toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
                  } finally {
                    setIsContacting(false);
                  }
                }}
                disabled={isContacting}
                className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mb-4 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isContacting ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined">message</span>
                )}
                {isContacting ? 'Đang kết nối...' : 'Nhắn tin Chủ Trọ'}
              </button>

              <button 
                onClick={() => setShowPhone(!showPhone)}
                className="w-full bg-surface-container-low text-on-surface py-4 rounded-xl font-bold text-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-secondary">phone_in_talk</span>
                {showPhone ? (listing.landlordPhone || 'Chưa cung cấp SĐT') : '090 xxx xxxx (Xem số)'}
              </button>

              {/* Landlord Profile Snippet */}
              <div className="mt-8 pt-8 border-t border-outline-variant/20">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container relative bg-primary flex items-center justify-center text-on-primary font-bold text-xl uppercase">
                    {listing.landlordName?.charAt(0) || 'L'}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-surface-container-lowest"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{listing.landlordName || 'Chủ trọ'}</h4>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                      Chủ trọ xác thực
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </main>

      {/* Report Modal */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Báo cáo tin đăng">
        <div className="p-6">
          <p className="text-on-surface-variant mb-4 text-sm">
            Bạn đang báo cáo tin đăng <strong>{listing.title}</strong>. Vui lòng cho chúng tôi biết lý do chi tiết để đội ngũ kiểm duyệt xử lý kịp thời.
          </p>
          <textarea
            className="w-full bg-surface-container-high rounded-xl p-4 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
            rows={4}
            placeholder="Mô tả lý do báo cáo (VD: Tin giả mạo, phòng không giống ảnh, chủ nhà lừa đảo...)"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 font-bold text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={isSubmittingReport || !reportReason.trim()}
              className="px-6 py-2 font-bold text-on-error bg-error hover:opacity-90 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-error/20"
            >
              {isSubmittingReport && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
              Gửi báo cáo
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Gallery Carousel Modal */}
      {isGalleryOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="w-full max-w-7xl flex items-center justify-between text-white shrink-0">
            <span className="font-bold text-sm sm:text-base bg-white/10 px-4 py-1.5 rounded-full">
              {activeImageIndex + 1} / {allImages.length}
            </span>
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all text-white"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Main Slide Area */}
          <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Left Button */}
            <button 
              onClick={() => setActiveImageIndex((activeImageIndex - 1 + allImages.length) % allImages.length)}
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>

            {/* Image */}
            <img 
              src={allImages[activeImageIndex].url} 
              alt={`Gallery image ${activeImageIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            />

            {/* Right Button */}
            <button 
              onClick={() => setActiveImageIndex((activeImageIndex + 1) % allImages.length)}
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="w-full max-w-5xl overflow-x-auto py-4 shrink-0 flex gap-3 justify-center scrollbar-thin scrollbar-thumb-white/20">
            {allImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeImageIndex 
                    ? 'border-primary scale-105 shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
