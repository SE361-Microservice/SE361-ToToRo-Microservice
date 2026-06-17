import clsx from 'clsx';
import Button from '../ui/Button';

export type BentoVariant = 'metric' | 'alert' | 'snippet' | 'chart' | 'action' | 'tip';
export type BentoBg =
  | 'default'
  | 'primary-container'
  | 'secondary-container'
  | 'tertiary-container'
  | 'error-container'
  | 'surface-container';

export interface BentoCardProps {
  variant: BentoVariant;
  bg?: BentoBg;
  icon?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  value?: string | number;
  valueBadge?: string;
  action?: { label: string; onClick: () => void };
  decorativeIcon?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const bgClasses: Record<BentoBg, string> = {
  'default':             'bg-surface-container-lowest',
  'primary-container':   'bg-primary-container text-on-primary-container',
  'secondary-container': 'bg-secondary-container text-on-secondary-container',
  'tertiary-container':  'bg-tertiary-container text-on-tertiary-container',
  'error-container':     'bg-error-container text-on-error-container',
  'surface-container':   'bg-surface-container text-on-surface',
};

export default function BentoCard({
  variant,
  bg = 'default',
  icon,
  eyebrow,
  title,
  subtitle,
  value,
  valueBadge,
  action,
  decorativeIcon,
  children,
  className,
  onClick,
}: BentoCardProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg p-6 shadow-ambient flex flex-col',
        'transition-transform duration-200 hover:scale-[1.01]',
        bgClasses[bg],
        // metric / snippet: min-h via parent grid
        variant === 'alert' && 'min-h-[220px] justify-between',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {/* Decorative background icon (alert) */}
      {decorativeIcon && (
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[160px]">{decorativeIcon}</span>
        </div>
      )}

      {/* metric */}
      {variant === 'metric' && (
        <>
          {icon && (
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
          )}
          <p className="text-4xl font-headline font-black text-on-background">{value}</p>
          <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">{title}</p>
        </>
      )}

      {/* alert */}
      {variant === 'alert' && (
        <>
          <div className="z-10">
            {(icon || eyebrow) && (
              <div className="flex items-center gap-2 mb-4">
                {icon && <span className="material-symbols-outlined">{icon}</span>}
                {eyebrow && (
                  <span className="font-label text-xs uppercase tracking-[0.2em] font-bold opacity-80">
                    {eyebrow}
                  </span>
                )}
              </div>
            )}
            <h3 className="text-3xl font-headline font-bold mb-2">{title}</h3>
            {subtitle && <p className="opacity-90 font-body text-sm">{subtitle}</p>}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="z-10 mt-6 w-fit px-6 py-2 bg-on-error-container text-error-container rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {action.label}
            </button>
          )}
        </>
      )}

      {/* snippet */}
      {variant === 'snippet' && (
        <>
          {icon && <span className="material-symbols-outlined text-on-surface-variant mb-auto">{icon}</span>}
          <div className="mt-auto">
            <h4 className="font-headline font-bold text-on-background">{title}</h4>
            {subtitle && <p className="text-xs text-on-surface-variant opacity-80 mt-1">{subtitle}</p>}
          </div>
        </>
      )}

      {/* chart / action / tip — use children for full flexibility */}
      {(variant === 'chart' || variant === 'action' || variant === 'tip') && (
        <>
          {(icon || eyebrow || title) && (
            <div className="flex justify-between items-start mb-4">
              <div>
                {eyebrow && (
                  <span className="font-label text-xs text-outline uppercase tracking-widest">{eyebrow}</span>
                )}
                {title && <h3 className="text-xl font-headline font-bold">{title}</h3>}
              </div>
              {valueBadge && (
                <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">
                  {valueBadge}
                </span>
              )}
            </div>
          )}
          {children}
          {action && (
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
