import clsx from 'clsx';

interface BadgeProps {
  label: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'surface';
  className?: string;
}

const colorClasses: Record<NonNullable<BadgeProps['color']>, string> = {
  primary:   'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  tertiary:  'bg-tertiary text-on-tertiary',
  error:     'bg-error-container text-on-error-container',
  surface:   'bg-surface-container text-on-surface-variant',
};

export default function Badge({ label, color = 'primary', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block px-3 py-1 rounded-full text-xs font-bold font-label tracking-wider',
        colorClasses[color],
        className,
      )}
    >
      {label}
    </span>
  );
}
