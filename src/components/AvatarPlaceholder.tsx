import React from 'react';
import { User } from 'lucide-react';

export const AvatarPlaceholder: React.FC<{ src?: string; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ src, name, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-lg' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-full bg-secondary text-secondary-foreground overflow-hidden flex-shrink-0`}>
      {src ? (
        <img src={src} alt={name || ''} className="h-full w-full object-cover" />
      ) : initials ? (
        <span className="font-semibold">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" />
      )}
    </div>
  );
};
