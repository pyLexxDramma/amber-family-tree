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
      className={`app-topbar sticky top-0 z-40 flex min-h-touch items-center justify-between safe-area-pt ${
        transparent ? 'bg-transparent' : 'app-header'
      } ${isClassic ? 'px-3 gap-2' : 'px-4'}`}
    >
      <div className={`flex items-center justify-start ${isClassic ? 'min-w-[70px]' : 'min-w-[80px]'}`}>
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
        ) : isClassic ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-current/70">Angelo</span>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </div>
      <h1
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold ${
          isClassic ? 'text-sm uppercase tracking-[0.2em]' : 'text-base tracking-wide'
        }`}
      >
        {title}
      </h1>
      <div className={`flex items-center justify-end ${isClassic ? 'min-w-[70px]' : 'min-w-[80px]'}`}>
        {isClassic && !onBack && right == null ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-current/80 flex items-center gap-0.5">
            Журнал <ChevronRight className="h-3.5 w-3.5" />
          </span>
        ) : (
          right ?? <span className="w-10" aria-hidden />
        )}
      </div>
    </header>
  );
};
