import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../layouts/MainLayout';
import SearchBar from '../../../components/common/SearchBar';
import RoomCard from '../../../components/common/RoomCard';
import ProfileCard from '../../../components/common/ProfileCard';
import Tag from '../../../components/ui/Tag';
import Button from '../../../components/ui/Button';
import listingService from '../../../services/listingService';
import useAuthStore from '../../../store/authStore';
import type { ListingSummaryResponse } from '../../../types/listing';

// ─── Static data (curated content — no API for these) ────────────────────────

const trendingTags = [
  { label: 'QUẬN 1' },
  { label: 'BẾN THÀNH' },
  { label: 'STUDIO' },
  { label: 'GẦN ĐẠI HỌC' },
  { label: 'CÓ GÁC' },
];

const roommateProfiles = [
  {
    id: 1,
    image: '/avatars/minh_anh.png',
    name: 'Minh Anh',
    age: 21,
    institution: 'Đại học Kinh tế TP.HCM',
    lifestyleTags: ['THÍCH NẤU ĂN', 'KHÔNG HÚT THUỐC', 'YÊU ĐỘNG VẬT'],
    rotated: false,
  },
  {
    id: 2,
    image: '/avatars/thu_ha.png',
    name: 'Thu Hà',
    age: 20,
    institution: 'Đại học Bách Khoa TP.HCM',
    lifestyleTags: ['THỨC KHUYA', 'YÊU ÂM NHẠC', 'NGĂN NẮP'],
    rotated: true,
  },
];

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
    case 'apartment': return 'Căn hộ';
    default: return 'Phòng trọ';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user?.role === 'LANDLORD') navigate('/dashboard', { replace: true });
      else navigate('/home', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [listings, setListings] = useState<ListingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listingService.search({ size: 6 })
      .then(res => setListings(res.content))
      .catch(err => console.error('Failed to fetch listings for guest home:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <MainLayout>
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Background blob */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary-container/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary-container/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
          <h1 className="font-headline font-extrabold text-5xl md:text-6xl text-on-background tracking-tight leading-[1.1]">
            {t('guest.hero.title1')}{' '}
            <span className="text-primary">{t('guest.hero.title2')}</span>
            <br />{t('guest.hero.title3')}
          </h1>

          <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">
            {t('guest.hero.subtitle')}
          </p>

          <SearchBar
            className="w-full max-w-2xl"
            onSearch={(query) => {
              window.dispatchEvent(new CustomEvent('totoro-ai-search', { detail: { query } }));
            }}
          />

          {/* Trending tags */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">{t('guest.trending')}</span>
            {trendingTags.map((tag) => (
              <Tag key={tag.label} label={tag.label} variant="trending" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recommendations Section ───────────────────────────── */}
      <section className="px-6 py-20 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-label uppercase tracking-widest text-outline mb-2">{t('guest.recommend.label')}</p>
            <h2 className="font-headline text-3xl font-bold text-on-background">{t('guest.recommend.title')}</h2>
          </div>
          <Button variant="ghost" size="sm" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/search')}>
            {t('guest.recommend.viewAll')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải phòng...</span>
            </div>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {listings.slice(0, 3).map((listing, idx) => (
              <RoomCard
                key={listing.id}
                image={listing.coverImageUrl || ''}
                title={listing.title}
                price={formatPrice(listing.priceRent)}
                description={listing.address || listing.city || ''}
                badge={idx === 0 ? { label: 'MỚI NHẤT', color: 'primary' as const } : undefined}
                features={[
                  { icon: 'home', label: roomTypeLabel(listing.roomType) },
                  { icon: 'straighten', label: `${listing.areaM2}m²` },
                ]}
                tags={listing.tags?.map(t => t.name) || []}
                offset={idx === 1}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-5xl text-outline mb-4 block">home_work</span>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Chưa có phòng trọ nào</h3>
            <p className="text-on-surface-variant mb-4">Hệ thống đang cập nhật dữ liệu. Hãy thử lại sau!</p>
            <Button variant="primary" size="md" onClick={() => navigate('/search')}>Tìm kiếm phòng</Button>
          </div>
        )}
      </section>

      {/* ── Roommate Match Section ────────────────────────────── */}
      <section className="px-6 py-20 bg-surface-container">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <p className="text-xs font-label uppercase tracking-widest text-outline">{t('guest.matchmate.label')}</p>
            <h2 className="font-headline text-4xl font-bold text-on-background leading-tight">
              {t('guest.matchmate.title1')}{' '}
              <span className="text-primary">{t('guest.matchmate.title2')}</span>
            </h2>
            <p className="text-on-surface-variant font-body leading-relaxed">
              {t('guest.matchmate.desc')}
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="md" icon="people" onClick={() => navigate('/register')}>
                {t('guest.matchmate.start')}
              </Button>
              <Button variant="ghost" size="md">
                {t('guest.matchmate.learn')}
              </Button>
            </div>
          </div>

          {/* Profile cards */}
          <div className="relative flex items-center justify-center h-96 w-full max-w-md mx-auto">
            {roommateProfiles.map((profile, i) => (
              <div
                key={profile.id}
                className="absolute transition-all duration-300 hover:scale-105 hover:z-20 cursor-pointer"
                style={{
                  transform: i === 0
                    ? 'translateX(-50px) translateY(-10px) rotate(-6deg)'
                    : 'translateX(50px) translateY(10px) rotate(6deg)',
                  zIndex: i,
                }}
              >
                <ProfileCard
                  name={profile.name}
                  age={profile.age}
                  institution={profile.institution}
                  lifestyleTags={profile.lifestyleTags}
                  image={profile.image}
                  rotated={false} // Rotated handled by transform style above
                  className="w-48 shadow-[0_15px_35px_rgba(0,0,0,0.1)]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter Section ────────────────────────────────── */}
      <section className="px-6 py-20 max-w-screen-xl mx-auto text-center">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <h2 className="font-headline text-3xl font-bold text-on-background">
            {t('guest.newsletter.title')}
          </h2>
          <p className="text-on-surface-variant font-body">
            {t('guest.newsletter.desc')}
          </p>
          <form className="flex gap-3 max-w-md mx-auto w-full">
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 px-5 py-3 rounded-full bg-surface-container-lowest shadow-ambient outline-none text-sm font-body text-on-surface placeholder:text-outline ghost-border focus:ring-2 focus:ring-primary/20"
            />
            <Button variant="primary" size="md" type="submit">
              {t('guest.newsletter.submit')}
            </Button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}
