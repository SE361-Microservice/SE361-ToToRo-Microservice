import type { RoommateProfileResponse } from '../../../types/matching';
import { getLifestyleTags, formatBudget } from './swipeHelpers';

interface BrowseGridProps {
  profiles: RoommateProfileResponse[];
  onSelect: (profile: RoommateProfileResponse) => void;
}

export default function BrowseGrid({ profiles, onSelect }: BrowseGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4">search_off</span>
        <p className="font-headline font-bold text-lg text-on-surface-variant">Không tìm thấy kết quả</p>
        <p className="text-sm text-outline mt-1">Thử điều chỉnh bộ lọc để xem thêm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => {
        const tags = getLifestyleTags(profile).slice(0, 3);
        return (
          <button
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_32px_rgba(55,50,34,0.06)] border border-outline-variant/10 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Score badge */}
              {profile.compatibilityScore != null && (
                <div className="absolute bottom-3 right-3 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-headline font-extrabold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  {profile.compatibilityScore}%
                </div>
              )}
              {profile.isVerified && (
                <div className="absolute top-3 left-3 bg-[rgba(255,248,239,0.7)] backdrop-blur-xl p-1.5 rounded-full">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-on-surface">{profile.fullName}, {profile.age}</h3>
                <span className="text-xs text-on-surface-variant">{profile.location}</span>
              </div>
              {profile.university && (
                <p className="text-xs text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">school</span>
                  {profile.university}
                </p>
              )}
              <p className="text-xs text-on-surface-variant">
                {formatBudget(profile.budgetMin)} – {formatBudget(profile.budgetMax)}/tháng
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span key={tag.label} className="px-2 py-1 bg-surface-container rounded-full text-[10px] font-bold flex items-center gap-1 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-xs">{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
