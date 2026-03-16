import React from 'react';
import { ChevronLeft, User } from 'lucide-react';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
  light?: boolean;
  avatarUrl?: string;
  sticky?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onBack, right, transparent, light, avatarUrl, sticky = true }) => {
  const headerClass = transparent ? 'bg-transparent' : light ? 'bg-card border-b border-border text-foreground' : 'app-header';
  const backClass = light ? 'bg-muted hover:bg-muted/80 text-foreground' : 'bg-white/10 text-current hover:bg-white/20';

  return (
    <header
      className={`app-topbar ${sticky ? 'sticky top-0' : ''} z-40 flex items-center gap-3 px-4 py-3 safe-area-pt ${headerClass}`}
    >
      {onBack != null ? (
        <button
          type="button"
          onClick={onBack}
          className={`touch-target flex items-center justify-center h-10 w-10 rounded-full transition-colors shrink-0 ${backClass}`}
          aria-label="Назад"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : avatarUrl ? (
        <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center ${light ? 'bg-muted' : 'bg-white/10'}`}>
          <User className={`h-5 w-5 ${light ? 'text-muted-foreground' : 'text-current/80'}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="font-serif font-semibold text-base sm:text-xl md:text-2xl text-current truncate">{title}</h1>
        {subtitle && <p className={`text-sm truncate ${light ? 'text-muted-foreground' : 'text-current/60'}`}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {right}
        <BrandLogoCircle className={light ? 'bg-muted border-border' : 'bg-white/10 border-white/20'} />
      </div>
    </header>
  );
};
