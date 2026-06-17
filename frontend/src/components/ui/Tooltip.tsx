import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  placement?: Placement;
  children: React.ReactElement;
}

/**
 * Portal-based tooltip that escapes any overflow:hidden parent.
 * Calculates position synchronously to prevent "fly-in" artifacts.
 */
export default function Tooltip({ content, placement = 'bottom', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Use ref callback to measure tooltip as soon as it mounts in the DOM
  const tooltipMeasureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || !triggerRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const tt = node.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = tr.top - tt.height - gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
        break;
      case 'bottom':
        top = tr.bottom + gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
        break;
      case 'left':
        top = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.left - tt.width - gap;
        break;
      case 'right':
        top = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.right + gap;
        break;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tt.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tt.height - 8));

    setCoords({ top, left });
  }, [placement]);

  const handleEnter = () => setVisible(true);
  const handleLeave = () => { setVisible(false); setCoords(null); };

  // Arrow position based on placement
  const arrowClass = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2',
  }[placement];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="inline-flex"
      >
        {children}
      </div>

      {visible && createPortal(
        <div
          ref={tooltipMeasureRef}
          className="fixed z-[9999] pointer-events-none"
          style={coords
            ? { top: coords.top, left: coords.left, opacity: 1, transition: 'opacity 0.15s ease' }
            : { top: -9999, left: -9999, opacity: 0 }
          }
        >
          <div className="relative px-3 py-1.5 bg-on-surface text-surface text-xs font-bold whitespace-nowrap rounded shadow-lg">
            {content}
            <div className={`absolute w-2 h-2 bg-on-surface rotate-45 ${arrowClass}`} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
