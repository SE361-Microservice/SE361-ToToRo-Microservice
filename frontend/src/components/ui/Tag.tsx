import clsx from 'clsx';

interface TagProps {
  label: string;
  variant?: 'trending' | 'lifestyle' | 'filter';
  href?: string;
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<NonNullable<TagProps['variant']>, string> = {
  trending:  'text-xs font-label tracking-widest text-primary hover:underline cursor-pointer',
  lifestyle: 'px-2 py-1 bg-surface-container text-[10px] font-bold rounded-full text-on-surface-variant',
  filter:    'text-[10px] px-2 py-1 bg-surface-container-highest rounded text-on-surface-variant font-bold uppercase tracking-tighter',
};

export default function Tag({ label, variant = 'lifestyle', href, onClick, className }: TagProps) {
  const classes = clsx(variantClasses[variant], className);

  if (href) {
    return <a href={href} className={classes}>{label}</a>;
  }

  return (
    <span onClick={onClick} className={classes}>
      {label}
    </span>
  );
}
