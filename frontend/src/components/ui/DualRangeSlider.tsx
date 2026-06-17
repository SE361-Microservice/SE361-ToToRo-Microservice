import { useState, useRef, useCallback, useEffect } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (v: number) => string;
}

export default function DualRangeSlider({
  min, max, step = 1, value, onChange, formatLabel = (v) => v.toString()
}: DualRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  const getPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const getValueFromX = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + pct * (max - min);
    return Math.round(raw / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const newVal = getValueFromX(e.clientX);
      setLocalValue(prev => {
        if (dragging === 'min') {
          const clamped = Math.min(newVal, prev[1] - step);
          return [Math.max(min, clamped), prev[1]];
        } else {
          const clamped = Math.max(newVal, prev[0] + step);
          return [prev[0], Math.min(max, clamped)];
        }
      });
    };

    const handleUp = () => {
      setDragging(null);
      setLocalValue(prev => { onChange(prev); return prev; });
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, getValueFromX, min, max, step, onChange]);

  // Touch support
  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const newVal = getValueFromX(touch.clientX);
      setLocalValue(prev => {
        if (dragging === 'min') {
          const clamped = Math.min(newVal, prev[1] - step);
          return [Math.max(min, clamped), prev[1]];
        } else {
          const clamped = Math.max(newVal, prev[0] + step);
          return [prev[0], Math.min(max, clamped)];
        }
      });
    };

    const handleTouchEnd = () => {
      setDragging(null);
      setLocalValue(prev => { onChange(prev); return prev; });
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, getValueFromX, min, max, step, onChange]);

  const leftPct = getPercent(localValue[0]);
  const rightPct = getPercent(localValue[1]);

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between text-xs font-bold text-on-surface-variant">
        <span>{formatLabel(localValue[0])}</span>
        <span>{formatLabel(localValue[1])}</span>
      </div>

      {/* Track */}
      <div ref={trackRef} className="relative h-6 flex items-center cursor-pointer select-none">
        {/* Background track */}
        <div className="absolute w-full h-1.5 bg-surface-container-highest rounded-full" />
        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            background: 'linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary, #e6a817))',
          }}
        />
        {/* Min thumb */}
        <div
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          className={`absolute w-5 h-5 bg-surface-container-lowest border-2 border-primary rounded-full shadow-md cursor-grab transition-shadow hover:shadow-lg hover:border-primary-dim ${dragging === 'min' ? 'cursor-grabbing scale-110 shadow-lg' : ''}`}
          style={{ left: `calc(${leftPct}% - 10px)` }}
        />
        {/* Max thumb */}
        <div
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          className={`absolute w-5 h-5 bg-surface-container-lowest border-2 border-primary rounded-full shadow-md cursor-grab transition-shadow hover:shadow-lg hover:border-primary-dim ${dragging === 'max' ? 'cursor-grabbing scale-110 shadow-lg' : ''}`}
          style={{ left: `calc(${rightPct}% - 10px)` }}
        />
      </div>
    </div>
  );
}
