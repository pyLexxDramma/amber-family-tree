import React from 'react';
import { ChevronLeft, Send } from 'lucide-react';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
  avatarUrl?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onBack, right, transparent, avatarUrl }) => {
  return (
    <header
      className={`app-topbar sticky top-0 z-40 flex items-center gap-3 px-4 py-3 safe-area-pt ${
        transparent ? 'bg-transparent' : 'app-header'
      }`}
    >
      {onBack != null ? (
        <button
          type="button"
          onClick={onBack}
          className="touch-target flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-current hover:bg-white/20 transition-colors shrink-0"
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : avatarUrl ? (
        <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center">
          <span className="text-current font-serif font-semibold text-sm">{title.charAt(0)}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="font-serif font-semibold text-base text-current truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-current/60 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {right ?? (
          <button
            type="button"
            className="h-10 w-10 rounded-full flex items-center justify-center text-current/70 hover:bg-white/10 transition-colors"
            aria-label="Поделиться"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
};
