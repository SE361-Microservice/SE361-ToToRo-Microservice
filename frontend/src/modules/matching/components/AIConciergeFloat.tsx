import { useState } from 'react';

interface AIConciergeFloatProps {
  message: string;
}

export default function AIConciergeFloat({ message }: AIConciergeFloatProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 animate-[slideUp_0.4s_ease]">
      <div className="bg-[rgba(255,248,239,0.7)] backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-xs relative">
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-outline hover:text-on-surface transition-colors"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
        </div>
        <p className="text-xs font-bold leading-relaxed pr-4">"{message}"</p>
      </div>
    </div>
  );
}
