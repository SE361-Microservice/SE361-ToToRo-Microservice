interface SwipeActionsProps {
  onSkip: () => void;
  onLike: () => void;
  onSuperLike: () => void;
}

export default function SwipeActions({ onSkip, onLike, onSuperLike }: SwipeActionsProps) {
  return (
    <div className="mt-8 md:mt-12 flex items-center gap-6 md:gap-8 z-10">
      {/* Skip (LEFT) */}
      <div className="group relative">
        <button
          onClick={onSkip}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-surface-container-lowest shadow-lg text-error flex items-center justify-center border border-outline-variant/10 transition-all hover:scale-110 active:scale-90 hover:shadow-xl"
          aria-label="Bỏ qua"
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl font-bold">close</span>
        </button>
        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-on-surface text-surface text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
          Bỏ qua
        </span>
      </div>

      {/* Like (RIGHT) — larger central button */}
      <div className="group relative">
        <button
          onClick={onLike}
          className="w-18 h-18 md:w-20 md:h-20 rounded-full btn-gradient shadow-2xl text-white flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          style={{ width: '4.5rem', height: '4.5rem' }}
          aria-label="Quan tâm"
        >
          <span className="material-symbols-outlined text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </button>
        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-on-surface text-surface text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
          Quan tâm
        </span>
      </div>

      {/* Super Like */}
      <div className="group relative">
        <button
          onClick={onSuperLike}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-surface-container-lowest shadow-lg text-primary flex items-center justify-center border border-outline-variant/10 transition-all hover:scale-110 active:scale-90 hover:shadow-xl"
          aria-label="Super Like"
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </button>
        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-on-surface text-surface text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
          Super Like
        </span>
      </div>
    </div>
  );
}
