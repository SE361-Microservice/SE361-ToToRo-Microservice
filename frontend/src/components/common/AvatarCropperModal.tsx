import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  file: File;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const CROP_SIZE = 280;
const OUTPUT_SIZE = 512;

export default function AvatarCropperModal({ file, onConfirm, onCancel }: Props) {
  const [imageSrc, setImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    document.body.style.overflow = 'hidden';
    return () => { URL.revokeObjectURL(url); document.body.style.overflow = ''; };
  }, [file]);

  // Wheel zoom (needs non-passive)
  useEffect(() => {
    const el = cropRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.min(3, Math.max(1, z + (e.deltaY > 0 ? -0.08 : 0.08))));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const totalScale = baseScale * zoom;

  const clamp = useCallback((tx: number, ty: number) => {
    const s = baseScale * zoom; // recompute to avoid stale closure
    const maxX = Math.max(0, (natSize.w * s - CROP_SIZE) / 2);
    const maxY = Math.max(0, (natSize.h * s - CROP_SIZE) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, tx)), y: Math.min(maxY, Math.max(-maxY, ty)) };
  }, [natSize, baseScale, zoom]);

  // Re-clamp on zoom change
  useEffect(() => {
    setPos(p => clamp(p.x, p.y));
  }, [zoom, clamp]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setNatSize({ w, h });
    setBaseScale(Math.max(CROP_SIZE / w, CROP_SIZE / h));
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    setPos(clamp(d.origX + e.clientX - d.startX, d.origY + e.clientY - d.startY));
  };

  const handlePointerUp = () => { dragRef.current.active = false; };

  const handleConfirm = () => {
    if (!imgRef.current || natSize.w === 0) return;
    setIsCropping(true);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d')!;

    // Calculate what part of the original image is visible in the crop circle
    const imgLeft = (CROP_SIZE - natSize.w * totalScale) / 2 + pos.x;
    const imgTop = (CROP_SIZE - natSize.h * totalScale) / 2 + pos.y;
    const sx = -imgLeft / totalScale;
    const sy = -imgTop / totalScale;
    const sw = CROP_SIZE / totalScale;

    ctx.drawImage(imgRef.current, sx, sy, sw, sw, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob(blob => { setIsCropping(false); if (blob) onConfirm(blob); }, 'image/webp', 0.9);
  };

  // Don't render image positioning until we know natural dimensions
  const ready = natSize.w > 0 && natSize.h > 0;

  // Use CSS transform for zoom + translate — this avoids skew/distortion
  // The image is rendered at its base-scaled size (fits the crop circle),
  // then CSS scale(zoom) enlarges it, and translate moves it.
  const baseW = natSize.w * baseScale;
  const baseH = natSize.h * baseScale;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-6 md:p-8 w-[92vw] max-w-[420px] animate-[fadeIn_0.2s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-xl font-bold text-on-surface">Chỉnh sửa ảnh đại diện</h3>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Crop area */}
        <div className="flex justify-center mb-5">
          <div
            ref={cropRef}
            className="relative overflow-hidden rounded-full cursor-grab active:cursor-grabbing select-none bg-surface-container-high"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={handleImageLoad}
                alt="Crop"
                className="absolute pointer-events-none origin-center"
                style={ready ? {
                  width: baseW,
                  height: baseH,
                  left: (CROP_SIZE - baseW) / 2,
                  top: (CROP_SIZE - baseH) / 2,
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                } : { opacity: 0 }}
                draggable={false}
              />
            )}
            {/* Ring */}
            <div className="absolute inset-0 rounded-full ring-4 ring-primary/50 pointer-events-none" />
          </div>
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 mb-4 px-4">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">zoom_out</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 h-1.5 accent-primary cursor-pointer" />
          <span className="material-symbols-outlined text-on-surface-variant text-lg">zoom_in</span>
        </div>

        <p className="text-xs text-on-surface-variant text-center mb-6">Kéo để di chuyển • Cuộn chuột để phóng to/thu nhỏ</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-container transition-colors">Hủy bỏ</button>
          <button onClick={handleConfirm} disabled={isCropping} className="flex-1 px-4 py-3 rounded-full bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {isCropping ? <><span className="material-symbols-outlined animate-spin text-sm">sync</span>Đang xử lý…</> : <><span className="material-symbols-outlined text-sm">check</span>Xác nhận</>}
          </button>
        </div>
      </div>
    </div>
  );
}
