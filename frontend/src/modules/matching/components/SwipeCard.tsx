import { useState, useRef, useEffect, useCallback } from 'react';
import type { RoommateProfileResponse } from '../../../types/matching';
import { getLifestyleTags } from './swipeHelpers';
import { resolveImageUrl } from '../../../utils/imageUrl';

const AVATAR_FALLBACK = 'https://ui-avatars.com/api/?background=D4A373&color=fff&size=400&bold=true';

interface SwipeCardProps {
  profile: RoommateProfileResponse;
  onSwipe: (direction: 'LEFT' | 'RIGHT') => void;
  onClick: () => void;
}

export default function SwipeCard({ profile, onSwipe, onClick }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
  const [exitDir, setExitDir] = useState<'LEFT' | 'RIGHT' | null>(null);

  const tags = getLifestyleTags(profile);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragState({ x: 0, y: 0, isDragging: true, startX: e.clientX, startY: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.isDragging) return;
    setDragState((prev) => ({
      ...prev,
      x: e.clientX - prev.startX,
      y: e.clientY - prev.startY,
    }));
  };

  const handlePointerUp = () => {
    if (!dragState.isDragging) return;
    const threshold = 120;
    if (dragState.x > threshold) {
      triggerExit('RIGHT');
    } else if (dragState.x < -threshold) {
      triggerExit('LEFT');
    } else {
      setDragState({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
    }
  };

  const triggerExit = useCallback((dir: 'LEFT' | 'RIGHT') => {
    setExitDir(dir);
    setTimeout(() => {
      onSwipe(dir);
      setExitDir(null);
      setDragState({ x: 0, y: 0, isDragging: false, startX: 0, startY: 0 });
    }, 300);
  }, [onSwipe]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') triggerExit('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') triggerExit('RIGHT');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [triggerExit]);

  // Transform calculation
  const rotation = dragState.x * 0.08;
  const opacity = exitDir ? 0 : 1;
  const exitX = exitDir === 'LEFT' ? -800 : exitDir === 'RIGHT' ? 800 : dragState.x;
  const exitRotation = exitDir === 'LEFT' ? -30 : exitDir === 'RIGHT' ? 30 : rotation;

  // Swipe indicator overlay
  const showLike = dragState.x > 50;
  const showNope = dragState.x < -50;

  return (
    <div className="relative w-full max-w-[440px] aspect-[3/4] group select-none">
      {/* Shadow Layer */}
      <div className="absolute inset-0 bg-on-surface/5 rounded-xl translate-y-4 scale-95 blur-2xl" />

      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          if (Math.abs(dragState.x) < 5 && Math.abs(dragState.y) < 5) {
            onClick();
            e.stopPropagation();
          }
        }}
        className="relative h-full w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-[0_12px_32px_rgba(55,50,34,0.06)] border border-outline-variant/20 flex flex-col cursor-grab active:cursor-grabbing touch-none"
        style={{
          transform: `translateX(${exitX}px) rotate(${exitRotation}deg)`,
          opacity,
          transition: exitDir || !dragState.isDragging ? 'all 0.3s ease-out' : 'none',
        }}
      >
        {/* Like/Nope overlay indicators */}
        {showLike && (
          <div className="absolute top-8 left-8 z-20 border-4 border-primary text-primary font-headline font-extrabold text-3xl px-4 py-1 rounded-lg rotate-[-15deg] opacity-80">
            LIKE
          </div>
        )}
        {showNope && (
          <div className="absolute top-8 right-8 z-20 border-4 border-error text-error font-headline font-extrabold text-3xl px-4 py-1 rounded-lg rotate-[15deg] opacity-80">
            NOPE
          </div>
        )}

        {/* Photo Header */}
        <div className="relative flex-1 min-h-0">
          <img
            alt={`Profile of ${profile.fullName}`}
            className="w-full h-full object-cover pointer-events-none"
            src={resolveImageUrl(profile.avatar, `${AVATAR_FALLBACK}&name=${encodeURIComponent(profile.fullName || profile.email || 'U')}`)}
            draggable={false}
          />
          {/* Verified Badge */}
          {profile.isVerified && (
            <div className="absolute top-6 left-6 bg-[rgba(255,248,239,0.7)] backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-xs font-bold font-label text-on-surface uppercase tracking-wider">Đã xác thực</span>
            </div>
          )}
          {/* Compatibility Badge */}
          {profile.compatibilityScore != null && (
            <div className="absolute bottom-6 right-6 bg-primary text-on-primary px-5 py-2.5 rounded-full shadow-xl font-headline font-extrabold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              {profile.compatibilityScore}% Hợp nhau
            </div>
          )}
        </div>

        {/* Profile Info Body */}
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                {profile.fullName}, {profile.age}
              </h1>
              {profile.university && (
                <p className="text-primary font-bold font-headline flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-lg">school</span>
                  {profile.university}
                </p>
              )}
            </div>
            {profile.location && (
              <div className="text-right shrink-0">
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Vị trí</span>
                <p className="text-sm font-bold">{profile.location}</p>
              </div>
            )}
          </div>

          {/* Lifestyle Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag.label}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-surface-container rounded-full text-xs font-bold flex items-center gap-1.5 border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-base">{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
