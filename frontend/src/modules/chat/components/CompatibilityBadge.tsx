import type { CompatibilityInfo } from '../../../types/chat';

interface Props {
  info: CompatibilityInfo;
}

export default function CompatibilityBadge({ info }: Props) {
  return (
    <div className="flex justify-center py-2">
      <div className="bg-primary/5 border border-primary/10 rounded-2xl px-8 py-4 flex flex-col items-center gap-2 shadow-sm">
        <span className="text-primary font-bold text-3xl font-headline tracking-tight">{info.score}%</span>
        <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
          Độ tương thích lối sống
        </span>
        {info.sharedTraits.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            {info.sharedTraits.map(trait => (
              <span key={trait} className="bg-white/80 px-3 py-1 rounded-full text-[10px] text-primary-dim font-bold">
                {trait}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
