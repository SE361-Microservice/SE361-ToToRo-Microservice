import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';

export interface SideNavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  danger?: boolean;
  subItems?: { label: string; href: string; active?: boolean }[];
}

export interface SideNavHeader {
  title: string;
  subtitle?: string;
}

export interface SideNavCTA {
  icon: string;
  label: string;
  onClick?: () => void;
}

export interface SideNavProps {
  header?: SideNavHeader;
  items: SideNavItem[];
  bottomCTA?: SideNavCTA;
  bottomLinks?: SideNavItem[];
  width?: number;
  breakpoint?: 'md' | 'lg';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onResizeStart?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export default function SideNav({
  header,
  items,
  bottomCTA,
  bottomLinks = [],
  width = 280,
  breakpoint = 'lg',
  isCollapsed = false,
  onToggleCollapse,
  onResizeStart,
  isDragging = false,
}: SideNavProps) {
  const { pathname } = useLocation();

  return (
    <aside
      className={clsx(
        'flex-col fixed left-0 top-0 h-full z-40 pt-20',
        'bg-surface border-r border-outline-variant/20',
        breakpoint === 'md' ? 'hidden md:flex' : 'hidden lg:flex',
        !isDragging ? 'transition-[width] ease-out duration-300' : 'duration-0'
      )}
      style={{ width: `${width}px` }}
    >
      {/* Drag handle */}
      {!isCollapsed && onResizeStart && (
        <div 
          className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-50 flex items-center justify-center group"
          onMouseDown={onResizeStart}
        >
          <div className="w-0.5 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}
      {/* Header */}
      <div className={clsx("flex items-center mb-8", isCollapsed ? "justify-center px-0 mt-2" : "px-6 justify-between")}>
        {!isCollapsed && header && (
          <div>
            <h2 className="font-headline font-black text-xl text-primary">{header.title}</h2>
            {header.subtitle && (
              <p className="text-sm text-on-surface-variant opacity-70">{header.subtitle}</p>
            )}
          </div>
        )}
        
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            <span className="material-symbols-outlined text-xl">
              {isCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {items.map((item) => {
          const isExactActive = item.active ?? pathname === item.href;
          const hasActiveSub = item.subItems?.some(sub => sub.active ?? pathname === sub.href);
          const isActive = isExactActive || hasActiveSub;
          
          return (
            <div key={item.label} className="flex flex-col">
              <Link
                to={item.href}
                className={clsx(
                  'group relative flex items-center py-3 rounded-full font-label font-medium text-sm',
                  'transition-all duration-300',
                  isCollapsed ? 'justify-center mx-2 px-0' : 'gap-3 px-4',
                  isActive
                    ? 'bg-primary text-on-primary shadow-ambient scale-105'
                    : item.danger
                      ? 'text-error hover:bg-error-container/20'
                      : 'text-on-surface-variant hover:bg-surface-container',
                )}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                
                {!isCollapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-on-surface text-surface text-xs whitespace-nowrap rounded shadow-ambient opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-on-surface rotate-45"></div>
                  </div>
                )}
              </Link>
              
              {/* Submenu items */}
              {!isCollapsed && item.subItems && item.subItems.length > 0 && (isActive) && (
                <div className="flex flex-col ml-6 mt-1.5 mb-1 gap-0.5 animate-[fadeIn_0.2s_ease]">
                  {item.subItems.map(subItem => {
                    const isSubActive = subItem.active ?? pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.label}
                        to={subItem.href}
                        className={clsx(
                          'flex items-center gap-2.5 text-sm font-medium transition-all duration-200 py-2 px-3 rounded-full',
                          isSubActive 
                            ? 'bg-primary-container text-primary font-bold' 
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        )}
                      >
                        <span className={clsx(
                          'w-1.5 h-1.5 rounded-full transition-colors',
                          isSubActive ? 'bg-primary' : 'bg-outline-variant'
                        )} />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={clsx("p-4 flex flex-col gap-3", isCollapsed && "items-center px-2")}>
        {bottomCTA && (
          isCollapsed ? (
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-md hover:shadow-lg hover:scale-105 transition-all group relative"
              onClick={bottomCTA.onClick}
            >
              <span className="material-symbols-outlined text-[20px]">{bottomCTA.icon}</span>
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-on-surface text-surface text-xs whitespace-nowrap rounded shadow-ambient opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                  {bottomCTA.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-on-surface rotate-45"></div>
              </div>
            </button>
          ) : (
            <Button variant="primary" fullWidth icon={bottomCTA.icon} onClick={bottomCTA.onClick}>
              {bottomCTA.label}
            </Button>
          )
        )}

        {bottomLinks.length > 0 && !isCollapsed && (
          <div className="flex flex-col gap-1 border-t border-outline-variant/20 pt-3 w-full">
            {bottomLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-container rounded-full text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
