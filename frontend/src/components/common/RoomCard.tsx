import clsx from 'clsx';
import Badge from '../ui/Badge';
import Tag from '../ui/Tag';

export interface RoomCardFeature {
  icon: string;
  label: string;
}

export interface RoomCardProps {
  image: string;
  title: string;
  price: string;
  description: string;
  badge?: { label: string; color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface' };
  features?: RoomCardFeature[];
  tags?: string[];
  isFavorited?: boolean;
  offset?: boolean;
  compact?: boolean;
  onFavorite?: () => void;
  onClick?: () => void;
  className?: string;
}

export default function RoomCard({
  image,
  title,
  price,
  description,
  badge,
  features = [],
  tags = [],
  isFavorited = false,
  offset,
  compact,
  onFavorite,
  onClick,
  className,
}: RoomCardProps) {
  return (
    <article
      onClick={onClick}
      className={clsx(
        'group bg-surface-container-lowest rounded-lg overflow-hidden shadow-ambient',
        'flex flex-col transition-all duration-300 hover:scale-[1.02] cursor-pointer',
        offset && 'translate-y-4',
        className,
      )}
    >
      {/* Image */}
      <div className={clsx('relative overflow-hidden flex-shrink-0', compact ? 'h-48' : 'h-64')}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Favorite button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
            className="p-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface hover:text-error transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: `'FILL' ${isFavorited ? 1 : 0}` }}
            >
              favorite
            </span>
          </button>
        </div>
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge label={badge.label} color={badge.color} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={clsx('font-headline font-bold text-on-background', compact ? 'text-base' : 'text-lg')}>
            {title}
          </h3>
          <span className="font-headline font-bold text-primary whitespace-nowrap">{price}</span>
        </div>

        <p className="text-xs text-on-surface-variant font-body line-clamp-2">{description}</p>

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-1">
            {features.map((f) => (
              <span key={f.label} className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} variant="filter" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
