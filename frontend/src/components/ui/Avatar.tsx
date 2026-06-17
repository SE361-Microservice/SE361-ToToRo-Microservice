import clsx from 'clsx';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  ring?: boolean;
  label?: string;
  labelPosition?: 'below' | 'right';
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const labelSizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
};

export default function Avatar({
  src,
  alt,
  size = 'sm',
  ring,
  label,
  labelPosition = 'right',
  className,
}: AvatarProps) {
  const img = (
    <div
      className={clsx(
        'rounded-full overflow-hidden flex-shrink-0',
        sizeClasses[size],
        ring && 'ring-2 ring-primary-container',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold uppercase text-sm">
          {(alt || '?').charAt(0)}
        </div>
      )}
    </div>
  );

  if (!label) return img;

  return (
    <div className={clsx('flex items-center', labelPosition === 'below' ? 'flex-col gap-1' : 'flex-row gap-2')}>
      {img}
      <span className={clsx('font-label font-bold text-on-surface', labelSizeClasses[size])}>
        {label}
      </span>
    </div>
  );
}
