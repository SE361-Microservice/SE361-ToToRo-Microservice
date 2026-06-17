import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../../layouts/StudentLayout';
import RoomCard from '../../../components/common/RoomCard';
import CollectionCard from '../../../components/common/CollectionCard';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../store/authStore';
import listingService from '../../../services/listingService';
import matchingService from '../../../services/matchingService';
import type { ListingSummaryResponse } from '../../../types/listing';
import type { RoommateProfileResponse } from '../../../types/matching';
import { resolveImageUrl } from '../../../utils/imageUrl';
import useSavedListings from '../../../hooks/useSavedListings';

// ─── Static fallback data ────────────────────────────────────────────────────

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1f517403ce?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop',
];

const handpickedRooms = [
  {
    id: 1,
    image: FALLBACK_IMAGES[0],
    title: 'Phòng Yên Tĩnh Gần Thư Viện',
    price: '3.2tr/tháng',
    description: 'Môi trường học tập lý tưởng, cách thư viện trung tâm 3 phút đi bộ.',
    badge: { label: '98% Match', color: 'primary' as const },
    features: [{ icon: 'wifi', label: 'WiFi 500Mbps' }, { icon: 'local_library', label: 'Gần thư viện' }],
    tags: ['Quiet Area', 'Fast Wi-Fi', 'Study Desk'],
  },
  {
    id: 2,
    image: FALLBACK_IMAGES[1],
    title: 'Studio View Đẹp Quận 3',
    price: '4.8tr/tháng',
    description: 'Studio hiện đại với view thành phố, nội thất cao cấp, cửa sổ lớn.',
    badge: { label: 'MỚI', color: 'tertiary' as const },
    features: [{ icon: 'balcony', label: 'Ban công' }, { icon: 'bed', label: 'Nội thất đầy đủ' }],
    tags: ['City View', 'Furnished', 'Private Bath'],
  },
];

const matchmatePreview = {
  name: 'Thu Hà',
  age: 20,
  university: 'Bách Khoa TP.HCM',
  match: 94,
  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop',
  tags: ['KHÔNG HÚT THUỐC', 'YÊU SÁCH', 'NGỦ SỚM'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace('.0', '')}tr/tháng`;
  }
  return `${price.toLocaleString()}đ/tháng`;
}

function roomTypeLabel(type: string): string {
  switch (type) {
    case 'studio': return 'Studio';
    case 'apartment': return 'Chung cư';
    default: return 'Phòng trọ';
  }
}

function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return 'student.greeting.morning';
  if (h < 18) return 'student.greeting.afternoon';
  return 'student.greeting.evening';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const [recommendedListings, setRecommendedListings] = useState<ListingSummaryResponse[]>([]);
  const [matchmatePreviewData, setMatchmatePreviewData] = useState<RoommateProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { savedListingIds, toggleSave } = useSavedListings();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await listingService.search({ page: 0, size: 4 });
        setRecommendedListings(res.content);
      } catch (error) {
        console.error('Failed to load recommended listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMatchmate = async () => {
      try {
        const res = await matchingService.getFeed(0, 1);
        if (res && res.length > 0) {
          setMatchmatePreviewData(res[0]);
        }
      } catch (error) {
        console.error('Failed to load matchmate preview:', error);
      }
    };

    fetchRecommendations();
    fetchMatchmate();
  }, []);

  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  const displayName = authUser?.fullName?.split(' ').pop() || authUser?.email?.split('@')[0] || 'bạn';

  // Determine hero image: prefer first real listing cover, else fallback
  const heroImage = recommendedListings.length > 0 && recommendedListings[0].coverImageUrl
    ? resolveImageUrl(recommendedListings[0].coverImageUrl)
    : FALLBACK_IMAGES[0];

  // Real listing count for subtitle
  const newListingCount = recommendedListings.length > 0 ? recommendedListings.length : 4;

  // Dynamic collections based on real data (tags/roomType/city)
  const dynamicCollections = recommendedListings.length > 0
    ? [
        { id: 1, title: recommendedListings[0]?.city || 'TP. Hồ Chí Minh', count: recommendedListings.length, image: resolveImageUrl(recommendedListings[0]?.coverImageUrl, FALLBACK_IMAGES[0]), query: { city: recommendedListings[0]?.city } },
        { id: 2, title: 'Studio Cao Cấp', count: recommendedListings.filter(l => l.roomType === 'studio').length || 8, image: FALLBACK_IMAGES[1], query: { roomType: 'studio' } },
        { id: 3, title: 'Có Nội Thất', count: recommendedListings.filter(l => l.tags?.some(t => t.name?.toLowerCase().includes('nội thất'))).length || 21, image: FALLBACK_IMAGES[2], query: {} },
        { id: 4, title: 'Dưới 3 Triệu', count: recommendedListings.filter(l => l.priceRent < 3_000_000).length || 34, image: FALLBACK_IMAGES[3], query: { maxPrice: 3000000 } },
      ]
    : [
        { id: 1, title: 'Gần Bách Khoa', count: 12, image: FALLBACK_IMAGES[2], query: {} },
        { id: 2, title: 'Studio Cao Cấp', count: 8, image: FALLBACK_IMAGES[0], query: { roomType: 'studio' } },
        { id: 3, title: 'Có Nội Thất', count: 21, image: FALLBACK_IMAGES[1], query: {} },
        { id: 4, title: 'Dưới 3 Triệu', count: 34, image: FALLBACK_IMAGES[3], query: { maxPrice: 3000000 } },
      ];

  return (
    <StudentLayout user={navUser}>
      {/* ── Personalized Hero ─────────────────────────────────── */}
      <section className="px-6 py-12 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 flex flex-col gap-5">
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-outline mb-2">
                {t(getGreetingKey())}
              </p>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-background leading-[1.15]">
                {t('student.hero.hello')}<span className="text-primary">{displayName}</span>
                <br />{t('student.hero.question')}
              </h1>
            </div>
            <p className="text-on-surface-variant font-body">
              {t('student.hero.subtitle1')}<strong className="text-on-background">{newListingCount} phòng mới</strong>{t('student.hero.subtitle3')}
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="md" icon="search" onClick={() => navigate('/search')}>
                {t('student.btn.discover')}
              </Button>
              <Button variant="surface" size="md" icon="people" iconPosition="left" onClick={() => navigate('/matching')}>
                {t('student.btn.matchmate')}
              </Button>
            </div>
          </div>
          {/* Hero image circle */}
          <div className="md:col-span-5 flex justify-center">
            <div
              className="w-72 h-72 rounded-full overflow-hidden ring-8 ring-primary-container/40 shadow-ambient cursor-pointer transition-transform hover:scale-105 duration-300"
              onClick={() => navigate('/search')}
            >
              <img
                src={heroImage}
                alt="Featured room"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Handpicked + Matchmaking Bento ───────────────────── */}
      <section className="px-6 py-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Handpicked rooms (8 cols) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline text-2xl font-bold text-on-background">{t('student.section.foryou')}</h2>
              <Button variant="ghost" size="sm" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/search')}>
                {t('student.section.foryou.viewAll')}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {isLoading ? (
                // Skeleton loading cards
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-ambient animate-pulse">
                    <div className="h-48 bg-surface-container-high" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-surface-container-high rounded w-3/4" />
                      <div className="h-3 bg-surface-container-high rounded w-1/2" />
                      <div className="h-3 bg-surface-container-high rounded w-full" />
                    </div>
                  </div>
                ))
              ) : recommendedListings.length > 0 ? (
                recommendedListings.slice(0, 4).map((listing, idx) => (
                  <RoomCard
                    key={listing.id}
                    image={resolveImageUrl(listing.coverImageUrl, FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length])}
                    title={listing.title}
                    price={formatPrice(listing.priceRent)}
                    description={listing.address || listing.city || ''}
                    badge={idx === 0 ? { label: 'MỚI NHẤT', color: 'primary' as const } : undefined}
                    features={[
                      { icon: 'straighten', label: `${listing.areaM2}m²` },
                      { icon: 'meeting_room', label: roomTypeLabel(listing.roomType) }
                    ]}
                    tags={listing.tags?.slice(0, 3).map(t => t.name) || []}
                    compact
                    isFavorited={savedListingIds.has(String(listing.id))}
                    onFavorite={() => toggleSave(String(listing.id))}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  />
                ))
              ) : (
                handpickedRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    image={room.image}
                    title={room.title}
                    price={room.price}
                    description={room.description}
                    badge={room.badge}
                    features={room.features}
                    tags={room.tags}
                    compact
                    onClick={() => navigate('/search')}
                  />
                ))
              )}
            </div>
          </div>

          {/* Matchmaking panel (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {/* Match notification */}
            <div className="bg-primary-container rounded-lg p-5 shadow-ambient">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-primary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-primary-container">{t('student.match.new')}</span>
              </div>
              {matchmatePreviewData ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary">
                      {matchmatePreviewData.avatar ? (
                        <img src={resolveImageUrl(matchmatePreviewData.avatar)} alt={matchmatePreviewData.fullName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container uppercase">
                          {(matchmatePreviewData.fullName || matchmatePreviewData.email || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-background">
                        {matchmatePreviewData.fullName || matchmatePreviewData.email?.split('@')[0]}
                        {matchmatePreviewData.age ? `, ${matchmatePreviewData.age}` : ''}
                      </p>
                      <p className="text-xs text-on-surface-variant">{matchmatePreviewData.university || 'Sinh viên'}</p>
                    </div>
                    <span className="ml-auto text-2xl font-headline font-black text-primary">
                      {matchmatePreviewData.compatibilityScore ? `${matchmatePreviewData.compatibilityScore}%` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {matchmatePreviewData.isSmoker === false && (
                      <span className="text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant font-bold">
                        KHÔNG HÚT THUỐC
                      </span>
                    )}
                    {matchmatePreviewData.hasPets && (
                      <span className="text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant font-bold">
                        YÊU ĐỘNG VẬT
                      </span>
                    )}
                    {matchmatePreviewData.sleepTime === 'early' && (
                      <span className="text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant font-bold">
                        NGỦ SỚM
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary">
                      <img src={matchmatePreview.image} alt={matchmatePreview.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-background">{matchmatePreview.name}, {matchmatePreview.age}</p>
                      <p className="text-xs text-on-surface-variant">{matchmatePreview.university}</p>
                    </div>
                    <span className="ml-auto text-2xl font-headline font-black text-primary">{matchmatePreview.match}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {matchmatePreview.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 bg-surface-container rounded-full text-on-surface-variant font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/matching')}>
                {t('student.match.profile')}
              </Button>
            </div>

            {/* Discover more */}
            <div className="bg-surface-container rounded-lg p-5 flex-1 flex flex-col gap-3 shadow-ambient">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">group_add</span>
                <span className="font-headline font-bold text-sm text-on-background">{t('student.match.discover')}</span>
              </div>
              <p className="text-xs text-on-surface-variant font-body">
                {t('student.match.desc1')}<strong>{t('student.match.desc2')}</strong>{t('student.match.desc3')}
              </p>
              <Button variant="outline" size="sm" fullWidth icon="swipe" onClick={() => navigate('/matching')}>
                {t('student.match.start')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collections Section ───────────────────────────────── */}
      <section className="py-10 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-6 px-6">
          <h2 className="font-headline text-2xl font-bold text-on-background">{t('student.collection.title')}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
            {t('student.collection.viewAll')}
          </Button>
        </div>
        <div className="flex gap-5 px-6 overflow-x-auto hide-scrollbar pb-4">
          {dynamicCollections.map((col) => (
            <CollectionCard
              key={col.id}
              image={col.image}
              title={col.title}
              count={col.count}
              onClick={() => navigate('/search', { state: col.query })}
            />
          ))}
        </div>
      </section>
    </StudentLayout>
  );
}
