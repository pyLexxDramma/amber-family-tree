import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TreeDeciduous, Image as ImageIcon, Plus, Users, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { path: ROUTES.classic.tree, label: 'Дерево', icon: TreeDeciduous },
  { path: ROUTES.classic.feed, label: 'Лента', icon: ImageIcon },
  { path: ROUTES.classic.create, label: 'Создать', icon: Plus },
  { path: ROUTES.classic.family, label: 'Семья', icon: Users },
  { path: ROUTES.classic.store, label: 'Магазин', icon: Home },
];

const prototypePaths = [ROUTES.classic.feed, ROUTES.classic.family, ROUTES.classic.store, ROUTES.classic.tree, ROUTES.classic.create, '/classic/publication'];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPrototype = prototypePaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  return (
    <nav className={`app-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t safe-area-pb ${isPrototype ? 'app-bottom-nav--prototype bg-[var(--proto-card)] border-[var(--proto-border)]' : 'bg-card border-border'}`}
      style={isPrototype ? { ['--proto-card' as string]: '#F0EDE8', ['--proto-border' as string]: '#E5E1DC', ['--proto-active' as string]: '#A39B8A', ['--proto-text-muted' as string]: '#6B6560' } : undefined}
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-2 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== ROUTES.classic.create && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px] transition-colors rounded-lg ${isPrototype ? 'hover:bg-[var(--proto-border)]' : 'hover:bg-muted/50'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`h-6 w-6 ${active ? (isPrototype ? 'text-[var(--proto-active)]' : 'text-primary') : (isPrototype ? 'text-[var(--proto-text-muted)]' : 'text-muted-foreground')}`}
                strokeWidth={active ? 2.2 : 1.5}
              />
              <span className={`text-[10px] font-medium ${active ? (isPrototype ? 'text-[var(--proto-active)]' : 'text-primary') : (isPrototype ? 'text-[var(--proto-text-muted)]' : 'text-muted-foreground')}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
