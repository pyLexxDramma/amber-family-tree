import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onBack, right, transparent }) => (
  <header
    className={`sticky top-0 z-40 flex min-h-touch items-center justify-between px-4 safe-area-pt ${
      transparent ? 'bg-transparent' : 'app-header'
    }`}
  >
    <div className="flex min-w-[80px] items-center justify-start">
      {onBack != null ? (
        <button
          type="button"
          onClick={onBack}
          className="touch-target flex items-center gap-1.5 rounded-lg py-2 pr-2 text-current/80 hover:text-current hover:bg-white/10 transition-colors"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Назад</span>
        </button>
      ) : (
        <span className="w-10" aria-hidden />
      )}
    </div>
    <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold tracking-wide">
      {title}
    </h1>
    <div className="flex min-w-[80px] items-center justify-end">
      {right ?? <span className="w-10" aria-hidden />}
    </div>
  </header>
);
