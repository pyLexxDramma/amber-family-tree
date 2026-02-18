import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoLightboxProps {
  images: { url: string; caption?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ images, initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const touchStartX = useRef(0);
  const touchDeltaY = useRef(0);

  const prev = useCallback(() => setCurrent(i => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent(i => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchDeltaY.current;
    if (Math.abs(dy) > 120 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    if (Math.abs(dx) > 50) {
      dx > 0 ? prev() : next();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <span className="text-white/70 text-sm font-light tracking-wider">
          {current + 1} / {images.length}
        </span>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-2">
        {images.length > 1 && (
          <button onClick={prev} className="absolute left-2 z-10 text-white/40 hover:text-white transition-colors hidden md:block">
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        <img
          key={current}
          src={images[current].url}
          alt={images[current].caption || ''}
          className="max-h-[85vh] max-w-full object-contain select-none animate-in fade-in duration-200"
        />

        {images.length > 1 && (
          <button onClick={next} className="absolute right-2 z-10 text-white/40 hover:text-white transition-colors hidden md:block">
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>

      {images[current].caption && (
        <div className="text-center px-6 pb-6 pt-2">
          <p className="text-white/60 text-sm font-light">{images[current].caption}</p>
        </div>
      )}

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-6">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
