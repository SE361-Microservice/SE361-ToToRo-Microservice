import { useState } from 'react';
import clsx from 'clsx';

interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightAction?: React.ReactNode;
  /** Login style: h-14 rounded-xl with border. Register style: py-4 rounded-md no border */
  variant?: 'login' | 'register';
  className?: string;
}

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  rightAction,
  variant = 'register',
  className,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputClasses =
    variant === 'login'
      ? 'w-full h-14 px-5 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline/60 transition-all text-on-surface font-body'
      : 'w-full px-5 py-4 rounded-md bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 transition-all font-body';

  const labelClasses =
    variant === 'login'
      ? 'block font-label text-sm font-bold text-on-surface mb-2'
      : 'block font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1';

  return (
    <div className={clsx('space-y-2', className)}>
      <div className={clsx(rightAction && 'flex justify-between items-center', !rightAction && '')}>
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
        {rightAction}
      </div>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={clsx(inputClasses, isPassword && 'pr-12')}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
