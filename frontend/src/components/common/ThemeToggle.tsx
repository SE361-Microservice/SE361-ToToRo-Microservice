import { useTheme } from '../../providers/ThemeProvider';
import clsx from 'clsx';

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-container transition-all hover:opacity-80 active:scale-95 shadow-sm ghost-border cursor-pointer',
        className
      )}
      aria-label="Toggle theme"
    >
      <span 
        className={clsx(
          "material-symbols-outlined text-[20px] transition-all absolute",
          theme === 'dark' ? "text-primary-fixed opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        )}
      >
        dark_mode
      </span>
      <span 
        className={clsx(
          "material-symbols-outlined text-[20px] transition-all absolute",
          theme === 'light' ? "text-primary opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        )}
      >
        light_mode
      </span>
    </button>
  );
}
