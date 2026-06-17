import clsx from 'clsx';

interface IconButtonProps {
  icon: string;
  badge?: boolean;
  badgeCount?: number;
  active?: boolean;
  size?: 'sm' | 'md';
  color?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export default function IconButton({
  icon,
  badge,
  badgeCount,
  active,
  size = 'md',
  color,
  label,
  onClick,
  className,
}: IconButtonProps) {
  const showBadge = badge || (badgeCount != null && badgeCount > 0);

  return (
    <button
      onClick={onClick}
      aria-label={label ?? icon}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full',
        'transition-all duration-200 active:scale-95',
        size === 'sm' ? 'p-1.5' : 'p-2',
        active
          ? 'border-b-2 border-primary text-primary'
          : 'text-on-surface opacity-80 hover:bg-surface-container',
        color,
        className,
      )}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {showBadge && (
        badgeCount != null && badgeCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 bg-error text-on-error text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-background">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-background" />
        )
      )}
    </button>
  );
}
