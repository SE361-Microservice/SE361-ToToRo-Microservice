import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'outline' | 'surface' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn-gradient text-on-primary shadow-ambient',
  ghost:   'text-on-surface opacity-80 hover:bg-surface-container',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
  surface: 'bg-surface-container-lowest text-primary shadow-ambient hover:shadow-md',
  danger:  'bg-error-container text-on-error-container hover:opacity-90',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth,
  disabled,
  type = 'button',
  children,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold font-label',
        'transition-all duration-200 active:scale-95',
        'disabled:opacity-50 disabled:pointer-events-none',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
    </button>
  );
}
