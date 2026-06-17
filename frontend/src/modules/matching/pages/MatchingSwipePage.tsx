import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoommateProfile, RoommateProfileResponse, MatchFilter } from '../../../types/matching';
import matchingService from '../../../services/matchingService';
import StudentLayout from '../../../layouts/StudentLayout';
import SwipeCard from '../components/SwipeCard';
import SwipeActions from '../components/SwipeActions';
import ProfileDetailModal from '../components/ProfileDetailModal';
import BrowseFilter from '../components/BrowseFilter';
import BrowseGrid from '../components/BrowseGrid';
import ProfileEditForm from '../components/ProfileEditForm';
import AIConciergeFloat from '../components/AIConciergeFloat';
import useAuthStore from '../../../store/authStore';
import { getCompatibility } from '../../../services/aiService';

// ── Tab type ────────────────────────────────────────────────────────
type TabKey = 'swipe' | 'browse' | 'profile';

const tabs: { key: TabKey; icon: string; label: string }[] = [
  { key: 'swipe', icon: 'style', label: 'Swipe' },
  { key: 'browse', icon: 'grid_view', label: 'Duyệt' },
  { key: 'profile', icon: 'person_edit', label: 'Hồ sơ' },
];

// Removed static aiMessages

export default function MatchingSwipePage() {
  const navigate = useNavigate();
  // Auth store
  const { user: authUser, isAuthenticated } = useAuthStore();
  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  // ── State ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailProfile, setDetailProfile] = useState<RoommateProfileResponse | null>(null);
  const [filters, setFilters] = useState<MatchFilter>({
    university: '',
    budgetMin: 0,
    budgetMax: 0,
  });
  
  const [feedProfiles, setFeedProfiles] = useState<RoommateProfileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<RoommateProfileResponse | null>(null);

  const [aiTip, setAiTip] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // My Profile state
  const [myProfile, setMyProfile] = useState<RoommateProfileResponse | null>(null);

  // Fetch feed on mount
  useEffect(() => {
    const fetchFeedAndProfile = async () => {
      try {
        const [feed, profile] = await Promise.all([
          matchingService.getFeed(0, 20),
          matchingService.getMyProfile().catch(() => null) // Ignore error if no profile yet
        ]);
        setFeedProfiles(feed);
        if (profile) setMyProfile(profile);
      } catch (err) {
        console.error('Failed to load matching data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedAndProfile();
  }, []);

  // Current swipe profile
  const currentProfile = feedProfiles[currentIndex] ?? null;

  // Fetch AI compatibility tip when current profile changes
  useEffect(() => {
    if (!currentProfile || !authUser) {
      setAiTip('');
      return;
    }
    
    let isMounted = true;
    const fetchTip = async () => {
      setIsAiLoading(true);
      try {
        const res = await getCompatibility(String(authUser.id), String(currentProfile.id));
        if (isMounted) {
          setAiTip(res.commentary || 'Có vẻ hai bạn khá hợp nhau. Hãy thử kết nối nhé!');
        }
      } catch (err) {
        console.error('Failed to fetch AI tip:', err);
        if (isMounted) setAiTip('Bạn này có vẻ thú vị. Thử tìm hiểu xem sao!');
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    };
    
    fetchTip();
    
    return () => {
      isMounted = false;
    };
  }, [currentProfile, authUser]);

  // ── Swipe handlers ──────────────────────────────────────────────
  const handleSwipe = useCallback(async (direction: 'LEFT' | 'RIGHT') => {
    if (!currentProfile) return;
    
    const swipedProfile = currentProfile;
    // Optimistic update
    setCurrentIndex((prev) => prev + 1);
    setDetailProfile(null);
    
    try {
      const result = await matchingService.swipe({
        targetUserId: swipedProfile.userId,
        direction
      });
      // Check if this swipe resulted in a match
      if (result.matched) {
        setMatchedProfile(swipedProfile);
      }
    } catch (err) {
      console.error(`Failed to record ${direction} swipe:`, err);
    }
  }, [currentProfile]);

  const handleLike = useCallback(() => handleSwipe('RIGHT'), [handleSwipe]);
  const handleSkip = useCallback(() => handleSwipe('LEFT'), [handleSwipe]);
  const handleSuperLike = useCallback(async () => {
    if (!currentProfile) return;
    setCurrentIndex((prev) => prev + 1);
    setDetailProfile(null);
    try {
      await matchingService.swipe({
        targetUserId: currentProfile.userId,
        direction: 'RIGHT'
      });
    } catch (err) {
      console.error('Failed to record super like:', err);
    }
  }, [currentProfile]);

  // ── Browse filter logic ─────────────────────────────────────────
  const filteredProfiles = feedProfiles.filter((p) => {
    if (filters.university && p.university !== filters.university) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.budgetMin && (p.budgetMax ?? 0) < filters.budgetMin) return false;
    if (filters.budgetMax && (p.budgetMin ?? 0) > filters.budgetMax) return false;
    return true;
  });

  // ── Profile save handler ────────────────────────────────────────
  const handleProfileSave = async (data: Partial<RoommateProfile>) => {
    try {
      await matchingService.upsertMyProfile({
        headline: data.bio ? data.bio.substring(0, 50) : 'Looking for roommate',
        bio: data.bio,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        isActive: true,
        // Lifestyle fields
        age: data.age,
        gender: data.gender,
        sleepTime: data.sleepTime,
        wakeTime: data.wakeTime,
        cleanliness: data.cleanliness,
        isSmoker: data.isSmoker,
        drinksAlcohol: data.drinksAlcohol,
        hasPets: data.hasPets,
        isIntrovert: data.isIntrovert,
        okWithSmoker: data.okWithSmoker,
        okWithPets: data.okWithPets,
      });
      // Update local state so the form stays in sync without a page refresh
      const refreshed = await matchingService.getMyProfile().catch(() => null);
      if (refreshed) setMyProfile(refreshed);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  // Removed static aiMsg

  return (
    <StudentLayout user={navUser}>
      {/* Tab switcher */}
      <div className="px-6 max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex bg-surface-container rounded-xl p-1.5 gap-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-headline font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/matching/matches')}
          className="px-5 py-2.5 rounded-lg text-sm font-headline font-bold flex items-center gap-2 bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-all"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          Đã ghép
        </button>
      </div>

      {/* ═══ Swipe Tab ═══ */}
      {activeTab === 'swipe' && (
        <section className="flex-1 px-6 flex flex-col items-center justify-center max-w-5xl mx-auto w-full relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">sync</span>
              <p className="text-on-surface-variant font-headline">Đang tải hồ sơ...</p>
            </div>
          ) : currentProfile ? (
            <>
              <SwipeCard
                profile={currentProfile}
                onSwipe={handleSwipe}
                onClick={() => setDetailProfile(currentProfile)}
              />
              <SwipeActions
                onSkip={handleSkip}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
              />
              {/* Progress indicator */}
              <p className="mt-6 text-xs text-on-surface-variant font-label">
                {currentIndex + 1} / {feedProfiles.length} profiles
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-7xl text-primary/30 mb-4">celebration</span>
              <h2 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Hết rồi!</h2>
              <p className="text-on-surface-variant max-w-xs">
                Bạn đã xem hết tất cả profiles. Quay lại sau để xem người mới nhé!
              </p>
              <button
                onClick={() => setCurrentIndex(0)}
                className="mt-6 px-6 py-3 btn-gradient text-on-primary font-bold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Xem lại từ đầu
              </button>
            </div>
          )}

          {/* AI Concierge */}
          {currentProfile && (aiTip || isAiLoading) && (
            <AIConciergeFloat message={isAiLoading ? 'AI đang phân tích độ tương thích...' : aiTip} />
          )}
        </section>
      )}

      {/* ═══ Browse Tab ═══ */}
      {activeTab === 'browse' && (
        <section className="px-6 max-w-5xl mx-auto space-y-6">
          <BrowseFilter filters={filters} onChange={setFilters} />
          <BrowseGrid profiles={filteredProfiles} onSelect={setDetailProfile} />
        </section>
      )}

      {/* ═══ Profile Tab ═══ */}
      {activeTab === 'profile' && (
        <section className="px-6 max-w-5xl mx-auto pb-8">
          <ProfileEditForm 
            key={myProfile?.id || 'new'} 
            initialProfile={myProfile ? {
              id: String(myProfile.id),
              userId: String(myProfile.userId),
              fullName: myProfile.fullName,
              avatar: myProfile.avatar,
              age: myProfile.age,
              gender: myProfile.gender,
              university: myProfile.university,
              preferredCity: myProfile.preferredCity ?? undefined,
              preferredWard: myProfile.preferredWard ?? undefined,
              budgetMin: myProfile.budgetMin ?? 0,
              budgetMax: myProfile.budgetMax ?? 0,
              sleepTime: myProfile.sleepTime,
              wakeTime: myProfile.wakeTime,
              cleanliness: myProfile.cleanliness ?? 3,
              isSmoker: myProfile.isSmoker ?? false,
              drinksAlcohol: myProfile.drinksAlcohol ?? false,
              hasPets: myProfile.hasPets ?? false,
              isIntrovert: myProfile.isIntrovert,
              okWithSmoker: myProfile.okWithSmoker ?? false,
              okWithPets: myProfile.okWithPets ?? false,
              bio: myProfile.bio ?? undefined,
              isVerified: myProfile.isVerified ?? false,
              isActive: myProfile.isActive,
              compatibilityScore: myProfile.compatibilityScore,
              location: myProfile.location,
            } as Partial<RoommateProfile> : undefined} 
            onSave={handleProfileSave} 
          />
        </section>
      )}

      {/* Detail Modal */}
      {detailProfile && (
        <ProfileDetailModal
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onLike={() => {
            handleLike();
            setDetailProfile(null);
          }}
          onSkip={() => {
            handleSkip();
            setDetailProfile(null);
          }}
        />
      )}

      {/* "It's a Match!" Celebration Popup */}
      {matchedProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">
              It's a Match!
            </h2>
            <p className="text-on-surface-variant mb-6">
              Bạn và <strong className="text-on-surface">{matchedProfile.fullName || matchedProfile.email}</strong> đã cùng thích nhau!
              Hãy bắt đầu trò chuyện ngay.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center text-2xl font-bold text-primary uppercase">
                {(authUser?.fullName || authUser?.email || 'U').charAt(0)}
              </div>
              <span className="material-symbols-outlined text-4xl text-error animate-pulse">favorite</span>
              <div className="w-20 h-20 rounded-full bg-secondary/10 border-4 border-secondary flex items-center justify-center text-2xl font-bold text-secondary uppercase">
                {(matchedProfile.fullName || matchedProfile.email || 'M').charAt(0)}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMatchedProfile(null);
                  window.location.href = '/messages';
                }}
                className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Nhắn tin ngay
              </button>
              <button
                onClick={() => setMatchedProfile(null)}
                className="flex-1 bg-surface-container text-on-surface font-bold py-3 rounded-xl hover:bg-surface-container-high transition-all"
              >
                Tiếp tục lướt
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
