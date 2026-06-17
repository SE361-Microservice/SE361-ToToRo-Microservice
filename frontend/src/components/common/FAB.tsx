import clsx from 'clsx';

export interface FABProps {
  icon: string;
  tooltip?: string;
  position?: 'bottom-right' | 'bottom-center';
  onClick?: () => void;
  className?: string;
}

export default function FAB({ icon, tooltip, position = 'bottom-right', onClick, className }: FABProps) {
  return (
    <div
      className={clsx(
        'fixed z-50',
        position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-1/2 -translate-x-1/2',
        className,
      )}
    >
      <button
        onClick={onClick}
        className="group relative h-14 w-14 rounded-full bg-primary text-on-primary shadow-ambient flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        <span className="material-symbols-outlined">{icon}</span>

        {/* Tooltip */}
        {tooltip && (
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-inverse-surface text-on-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-ambient">
            {tooltip}
          </span>
        )}
      </button>
    </div>
  );
}
