import { useEffect, useState } from 'react';
import useToastStore from '../../store/toastStore';
import type { Toast, ToastType } from '../../store/toastStore';

// ── Toast Container ──────────────────────────────────────────────────
// Render this once at the App root. It reads from the global store
// and displays animated toast notifications.

const ICON_MAP: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const STYLE_MAP: Record<ToastType, string> = {
  success: 'bg-primary text-on-primary',
  error: 'bg-error text-on-error',
  warning: 'bg-tertiary text-on-tertiary',
  info: 'bg-secondary text-on-secondary',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const timer = setTimeout(() => setExiting(true), toast.duration - 300);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleAnimEnd = () => {
    if (exiting) onRemove();
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg min-w-[280px] max-w-[420px] backdrop-blur-md border border-white/10 ${STYLE_MAP[toast.type]} ${exiting ? 'animate-[toastOut_0.3s_ease_forwards]' : 'animate-[toastIn_0.3s_ease]'}`}
      onAnimationEnd={handleAnimEnd}
      role="alert"
    >
      <span className="material-symbols-outlined text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
        {ICON_MAP[toast.type]}
      </span>
      <p className="text-sm font-bold flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Keyframe styles — injected once */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-12px) scale(0.95); }
        }
      `}</style>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </>
  );
}
