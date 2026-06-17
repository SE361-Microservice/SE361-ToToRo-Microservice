import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import UserAvatarMenu from './UserAvatarMenu';
import LangSwitcher from './LangSwitcher';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../../modules/notification/hooks/useNotifications';

export type NavVariant = 'guest' | 'student' | 'dashboard';

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavAction {
  icon: string;
  active?: boolean;
  badge?: boolean;
  label?: string;
  onClick?: () => void;
}

export interface NavUser {
  name: string;
  role: string;
  avatar: string;
}

export interface TopNavBarProps {
  variant: NavVariant;
  navLinks?: NavLink[];
  user?: NavUser;
  extraActions?: NavAction[];
}

export default function TopNavBar({
  variant,
  navLinks = [],
  user,
  extraActions = [],
}: TopNavBarProps) {
  const { t } = useTranslation();
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    if (isNotiOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotiOpen]);

  const {
    groupedNotifications,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel">
      <div className="flex items-center justify-between px-6 py-3 max-w-screen-2xl mx-auto">

        {/* Left: Logo + nav links (student) */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-headline font-bold text-primary tracking-tight">
            Totoro
          </Link>

          {/* Student: nav links */}
          {variant === 'student' && navLinks.length > 0 && (
            <ul className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-label font-medium transition-colors duration-200',
                      link.active
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-2">
          {variant === 'guest' ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <LangSwitcher />
                <ThemeToggle />
              </div>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  {t('nav.register')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* Notification bell */}
              <div ref={notiRef} className="relative">
                <IconButton
                  icon="notifications"
                  badgeCount={unreadCount}
                  label={t('nav.notifications')}
                  onClick={() => {
                    const willOpen = !isNotiOpen;
                    setIsNotiOpen(willOpen);
                    if (willOpen && unreadCount > 0) {
                      markAllAsRead();
                    }
                  }}
                  className="text-primary"
                />
                {isNotiOpen && (
                  <NotificationDropdown
                    groups={groupedNotifications}
                    unreadCount={unreadCount}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onMarkAllRead={markAllAsRead}
                    onMarkRead={markAsRead}
                    onClose={() => setIsNotiOpen(false)}
                  />
                )}
              </div>

              {/* Other actions (mail, etc.) */}
              {extraActions.map((action) => (
                <IconButton
                  key={action.icon}
                  icon={action.icon}
                  badge={action.badge}
                  active={action.active}
                  label={action.label}
                  onClick={action.onClick}
                  className="text-primary"
                />
              ))}

              {user && (
                <UserAvatarMenu user={user} />
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
