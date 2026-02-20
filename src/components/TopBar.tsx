import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIVariant } from '@/contexts/UIVariantContext';

export interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onBack, right, transparent }) => {
  const { variant } = useUIVariant();
  const isClassic = variant === 'classic';

  return (
    <header
      className={`app-topbar sticky top-0 z-40 grid min-h-touch items-center safe-area-pt ${
        transparent ? 'bg-transparent' : 'app-header'
      } ${isClassic ? 'px-3 gap-2' : 'px-4'}`}
      style={{ gridTemplateColumns: '1fr minmax(0, 1fr) auto' }}
    >
      <div className="flex items-center justify-start min-w-0 overflow-hidden">
        {onBack != null ? (
          <button
            type="button"
            onClick={onBack}
            className="touch-target flex items-center gap-1.5 rounded-xl py-2 px-3 border-2 border-primary/50 text-current hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors shrink-0 shadow-sm"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold whitespace-nowrap">Назад</span>
          </button>
        ) : isClassic ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-current/70 shrink-0">Angelo</span>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        )}
      </div>
      <h1
        className={`font-semibold text-center truncate px-2 min-w-0 overflow-hidden ${
          isClassic ? 'text-sm uppercase tracking-[0.2em]' : 'text-base tracking-wide'
        }`}
      >
        {title}
      </h1>
      <div className="flex items-center justify-end shrink-0">
        {isClassic && !onBack && right == null ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-current/80 hidden sm:flex items-center gap-0.5 shrink-0">
            Журнал <ChevronRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          <div className="flex items-center shrink-0">{right ?? <span className="w-10" aria-hidden />}</div>
        )}
      </div>
    </header>
  );
};
