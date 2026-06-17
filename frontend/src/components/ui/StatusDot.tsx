import clsx from 'clsx';

interface StatusDotProps {
  color?: 'primary' | 'secondary' | 'error';
  pulse?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

const colorClasses: Record<NonNullable<StatusDotProps['color']>, string> = {
  primary:   'bg-primary',
  secondary: 'bg-secondary',
  error:     'bg-error',
};

const sizeClasses: Record<NonNullable<StatusDotProps['size']>, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
};

export default function StatusDot({ color = 'primary', pulse, size = 'sm', className }: StatusDotProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full flex-shrink-0',
        colorClasses[color],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className,
      )}
    />
  );
}
