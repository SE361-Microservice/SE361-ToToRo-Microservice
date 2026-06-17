import type { RoommateProfileResponse } from '../../../types/matching';
import { getLifestyleTags, formatBudget } from './swipeHelpers';
import { resolveImageUrl } from '../../../utils/imageUrl';

const AVATAR_FALLBACK = 'https://ui-avatars.com/api/?background=D4A373&color=fff&size=400&bold=true';

interface ProfileDetailModalProps {
  profile: RoommateProfileResponse;
  onClose: () => void;
  onLike: () => void;
  onSkip: () => void;
}

export default function ProfileDetailModal({ profile, onClose, onLike, onSkip }: ProfileDetailModalProps) {
  const tags = getLifestyleTags(profile);

  const sleepLabels: Record<string, string> = { early: 'Trước 22h', normal: '22h-0h', late: '0h-2h', very_late: 'Sau 2h' };
  const wakeLabels: Record<string, string> = { early: 'Trước 7h', normal: '7h-9h', late: 'Sau 9h' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar animate-[slideUp_0.3s_ease]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-xl flex items-center justify-center hover:bg-surface-container transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        {/* Hero image */}
        <div className="relative h-72 md:h-80">
          <img src={resolveImageUrl(profile.avatar, `${AVATAR_FALLBACK}&name=${encodeURIComponent(profile.fullName || profile.email || 'U')}`)} alt={profile.fullName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Badges on image */}
          {profile.isVerified && (
            <div className="absolute top-4 left-4 bg-[rgba(255,248,239,0.7)] backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-xs font-bold font-label">Đã xác thực</span>
            </div>
          )}
          {profile.compatibilityScore != null && (
            <div className="absolute bottom-4 right-4 bg-primary text-on-primary px-4 py-2 rounded-full font-headline font-extrabold text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              {profile.compatibilityScore}% Hợp nhau
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name & university */}
          <div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">
              {profile.fullName}, {profile.age}
            </h2>
            {profile.university && (
              <p className="text-primary font-bold font-headline flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-lg">school</span>
                {profile.university}
              </p>
            )}
            {profile.location && (
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                {profile.location}
              </p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-surface-container-low rounded-lg p-4">
              <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Giới thiệu</h3>
              <p className="text-sm text-on-surface leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Lifestyle tags */}
          <div>
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Phong cách sống</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag.label} className="px-3 py-2 bg-surface-container rounded-full text-xs font-bold flex items-center gap-1.5 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-base">{tag.icon}</span>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Detail sections */}
          <div className="grid grid-cols-2 gap-3">
            {/* Budget */}
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-base">payments</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Ngân sách</span>
              </div>
              <p className="font-bold text-sm">{formatBudget(profile.budgetMin)} – {formatBudget(profile.budgetMax)}</p>
            </div>

            {/* Cleanliness */}
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-base">cleaning_services</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Gọn gàng</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`material-symbols-outlined text-base ${i <= (profile.cleanliness || 0) ? 'text-primary' : 'text-outline-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
            </div>

            {/* Sleep time */}
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-base">bedtime</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Giờ ngủ</span>
              </div>
              <p className="font-bold text-sm">{profile.sleepTime ? sleepLabels[profile.sleepTime] : '—'}</p>
            </div>

            {/* Wake time */}
            <div className="bg-surface-container-low rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-primary text-base">sunny</span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Giờ dậy</span>
              </div>
              <p className="font-bold text-sm">{profile.wakeTime ? wakeLabels[profile.wakeTime] : '—'}</p>
            </div>
          </div>

          {/* Preferred Location */}
          {(profile.preferredCity || profile.preferredWard) && (
            <div>
              <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Khu vực ưa thích</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferredWard && (
                  <span className="px-3 py-1.5 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">
                    {profile.preferredWard}
                  </span>
                )}
                {profile.preferredCity && (
                  <span className="px-3 py-1.5 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">
                    {profile.preferredCity}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Preferences (ok_with) */}
          <div className="bg-surface-container-low rounded-lg p-4">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Chấp nhận bạn ở cùng</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-base ${profile.okWithSmoker ? 'text-primary' : 'text-error'}`}>
                  {profile.okWithSmoker ? 'check_circle' : 'cancel'}
                </span>
                <span>Hút thuốc</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-base ${profile.okWithPets ? 'text-primary' : 'text-error'}`}>
                  {profile.okWithPets ? 'check_circle' : 'cancel'}
                </span>
                <span>Thú cưng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="sticky bottom-0 p-4 bg-surface-container-lowest border-t border-outline-variant/10 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-error">close</span>
            Bỏ qua
          </button>
          <button
            onClick={onLike}
            className="flex-1 py-3 rounded-xl btn-gradient text-on-primary font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Quan tâm
          </button>
        </div>
      </div>
    </div>
  );
}
