import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface LangSwitcherProps {
  /** 'nav' – compact text for TopNavBar; 'icon' – icon + label for AuthLayout */
  variant?: 'nav' | 'icon';
  className?: string;
}

export default function LangSwitcher({ className }: LangSwitcherProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toggle = () => {
    i18n.changeLanguage(isEn ? 'vi' : 'en');
  };

  return (
    <div
      onClick={toggle}
      className={clsx(
        'relative flex items-center bg-surface-container rounded-full p-1 cursor-pointer w-[76px] h-9 shadow-sm ghost-border',
        className
      )}
      aria-label="Switch language"
      role="switch"
      aria-checked={isEn}
    >
      {/* Sliding thumb overlay */}
      <div 
        className={clsx(
          "absolute top-1 bottom-1 left-1 w-[34px] rounded-full bg-primary shadow-md transition-transform duration-300",
          isEn ? "translate-x-full" : "translate-x-0"
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      />
      
      {/* Text options */}
      <div className="relative z-10 w-1/2 text-center flex items-center justify-center">
        <span className={clsx("text-xs font-label uppercase tracking-widest transition-colors duration-200", !isEn ? "text-on-primary font-bold" : "text-on-surface-variant font-medium")}>VI</span>
      </div>
      <div className="relative z-10 w-1/2 text-center flex items-center justify-center">
        <span className={clsx("text-xs font-label uppercase tracking-widest transition-colors duration-200", isEn ? "text-on-primary font-bold" : "text-on-surface-variant font-medium")}>EN</span>
      </div>
    </div>
  );
}
