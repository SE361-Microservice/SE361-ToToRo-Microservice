import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import LangSwitcher from './LangSwitcher';
import ThemeToggle from './ThemeToggle';
import { type NavUser } from './TopNavBar';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';

export default function UserAvatarMenu({ user }: { user: NavUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="ml-1 focus:outline-none transition-transform hover:scale-105 active:scale-95"
      >
        <Avatar src={user.avatar} alt={user.name} size="xs" ring />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[280px] bg-surface rounded-[1.5rem] shadow-ambient ghost-border overflow-hidden z-50">
          <div className="p-5 border-b ghost-border flex items-center gap-3 bg-surface-container-low">
            <Avatar src={user.avatar} alt={user.name} size="sm" />
            <div>
              <p className="font-headline font-bold text-on-background line-clamp-1">{user.name}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{user.role}</p>
            </div>
          </div>
          
          <div className="p-2">
             <button 
               onClick={() => { setIsOpen(false); navigate('/profile'); }}
               className="w-full text-left px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container rounded-xl transition-colors flex items-center gap-3"
             >
               <span className="material-symbols-outlined text-[20px] text-primary">person</span>
               {t('menu.profile')}
             </button>
             <button 
               onClick={() => { setIsOpen(false); navigate('/profile'); }}
               className="w-full text-left px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container rounded-xl transition-colors flex items-center gap-3"
             >
               <span className="material-symbols-outlined text-[20px] text-primary">settings</span>
               {t('menu.settings')}
             </button>
          </div>

          <div className="px-4 py-4 border-t border-b ghost-border bg-surface flex flex-col gap-3">
            <p className="text-xs font-label uppercase tracking-widest text-outline">{t('menu.preferences')}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-label font-medium text-on-surface">{t('menu.darkMode')}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-label font-medium text-on-surface">{t('menu.language')}</span>
              <LangSwitcher />
            </div>
          </div>
          
          <div className="p-2">
             <button 
               onClick={() => { setIsOpen(false); logout(); navigate('/login'); }}
               className="w-full text-left px-4 py-2.5 text-sm font-label text-error hover:bg-error-container hover:text-on-error-container rounded-xl transition-colors flex items-center gap-3"
             >
               <span className="material-symbols-outlined text-[20px]">logout</span>
               {t('menu.logout')}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
