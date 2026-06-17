import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../../layouts/StudentLayout';
import useAuthStore from '../../../store/authStore';
import matchingService from '../../../services/matchingService';
import chatService from '../../../services/chatService';
import type { RoommateMatchResponse, RoommateProfileResponse } from '../../../types/matching';
import ProfileCard from '../../../components/common/ProfileCard';
import { useToast } from '../../../hooks/useToast';

interface EnrichedMatch {
  match: RoommateMatchResponse;
  profile: RoommateProfileResponse;
}

export default function MatchListPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const navUser = isAuthenticated && user ? {
    name: user.fullName || user.email,
    avatar: user.avatarUrl || '',
    role: user.role
  } : undefined;
  const [enrichedMatches, setEnrichedMatches] = useState<EnrichedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const matches = await matchingService.getMyMatches();
        
        const myProfile = await matchingService.getMyProfile();
        const myUserId = myProfile.userId;

        // Enrich each match with the profile of the *other* user
        const enriched: EnrichedMatch[] = [];
        for (const m of matches) {
          const otherUserId = m.userAId === myUserId ? m.userBId : m.userAId;
          try {
            const profile = await matchingService.getProfileByUserId(otherUserId);
            enriched.push({ match: m, profile });
          } catch (e) {
            console.warn(`Could not load profile for user ${otherUserId}`);
          }
        }
        setEnrichedMatches(enriched);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleMessage = async (targetUserId: number) => {
    if (isStartingChat) return;
    setIsStartingChat(targetUserId);
    try {
      const conv = await chatService.createConversation({
        type: 'DIRECT',
        memberIds: [targetUserId]
      });
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
      toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.');
    } finally {
      setIsStartingChat(null);
    }
  };

  const getLifestyleTags = (profile: RoommateProfileResponse): string[] => {
    const tags: string[] = [];
    if (profile.isSmoker) tags.push('Hút thuốc');
    if (profile.hasPets) tags.push('Nuôi thú cưng');
    if (profile.isIntrovert) tags.push('Hướng nội');
    if (profile.sleepTime) tags.push(`Ngủ: ${profile.sleepTime}`);
    if (profile.cleanliness && profile.cleanliness >= 4) tags.push('Rất gọn gàng');
    return tags;
  };

  return (
    <StudentLayout user={navUser}>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/matching')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline font-extrabold text-3xl text-on-background tracking-tight">Danh sách đã ghép</h1>
            <p className="text-sm text-on-surface-variant">Những người bạn đã tương hợp thành công</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải danh sách...</span>
            </div>
          </div>
        ) : enrichedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrichedMatches.map(({ match, profile }) => (
              <div key={match.id} className="relative group bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden hover:shadow-ambient hover:-translate-y-1 transition-all duration-300">
                <ProfileCard
                  name={profile.fullName || 'Bạn cùng phòng'}
                  age={profile.age || 0}
                  institution={profile.university || 'Chưa cập nhật trường'}
                  image={profile.avatar || ''}
                  lifestyleTags={getLifestyleTags(profile)}
                  className="shadow-none rounded-none border-none pointer-events-none"
                />
                <div className="p-4 pt-0 bg-surface-container-lowest border-t border-outline-variant/10">
                  <p className="text-xs text-outline mb-3">Tương hợp lúc: {new Date(match.matchedAt).toLocaleDateString('vi-VN')}</p>
                  <button 
                    onClick={() => handleMessage(profile.userId)}
                    disabled={isStartingChat === profile.userId}
                    className="w-full py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
                  >
                    {isStartingChat === profile.userId ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    )}
                    Nhắn tin ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-outline">group_off</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Chưa có ai tương hợp</h3>
            <p className="text-on-surface-variant mb-6 max-w-sm">Hãy quay lại mục "Swipe" để tìm kiếm thêm những người bạn mới nhé.</p>
            <button 
              onClick={() => navigate('/matching')}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold hover:scale-105 transition-transform"
            >
              Tiếp tục tìm kiếm
            </button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
