import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

export interface BottomNavItem {
  icon: string;
  label: string;
  href: string;
}

export interface CenterFAB {
  icon: string;
  onClick?: () => void;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  centerFAB?: CenterFAB;
  shape?: 'bar' | 'pill';
}

export default function BottomNav({ items, centerFAB, shape = 'bar' }: BottomNavProps) {
  const { pathname } = useLocation();

  // Insert null in center if centerFAB exists (student: 5 items with FAB in slot 3)
  const displayItems: (BottomNavItem | null)[] = centerFAB
    ? [...items.slice(0, Math.floor(items.length / 2)), null, ...items.slice(Math.floor(items.length / 2))]
    : items;

  return (
    <nav
      className={clsx(
        'md:hidden fixed z-40 glass-panel',
        shape === 'bar'
          ? 'bottom-0 left-0 right-0'
          : 'bottom-4 left-4 right-4 rounded-full shadow-ambient',
      )}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {displayItems.map((item) => {
          // Center FAB slot
          if (item === null && centerFAB) {
            return (
              <button
                key="center-fab"
                onClick={centerFAB.onClick}
                className="w-12 h-12 -mt-5 rounded-full bg-primary text-on-primary shadow-ambient flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[22px]">{centerFAB.icon}</span>
              </button>
            );
          }

          if (!item) return null;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              to={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-colors duration-200',
                isActive ? 'text-primary' : 'text-on-surface-variant',
              )}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
