import { useState } from 'react';
import clsx from 'clsx';
import Button from '../ui/Button';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Tìm phòng trọ, ký túc xá, bạn đồng hành...',
  onSearch,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'group relative flex items-center gap-3 rounded-full',
        'bg-surface-container-lowest shadow-ambient',
        'px-5 py-3',
        className,
      )}
    >
      {/* Glow ring on focus-within */}
      <span className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-focus-within:ring-primary/20 transition-all duration-300 pointer-events-none" />

      {/* Search icon */}
      <span className="material-symbols-outlined text-outline text-[20px] flex-shrink-0">search</span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-body text-on-surface placeholder:text-outline min-w-0"
      />

      {/* AI CTA */}
      <Button variant="primary" size="sm" icon="auto_awesome" iconPosition="left">
        Tìm với AI
      </Button>
    </form>
  );
}
