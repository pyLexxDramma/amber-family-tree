import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TreePine, Newspaper, Plus, Users, Store, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const navItemsDefault = [
  { path: ROUTES.classic.tree, label: 'Дерево', icon: TreePine },
  { path: ROUTES.classic.feed, label: 'Лента', icon: Newspaper },
  { path: ROUTES.classic.create, label: '', icon: Plus, isCenter: true },
  { path: ROUTES.classic.family, label: 'Семья', icon: Users },
  { path: ROUTES.classic.store, label: 'Магазин', icon: Store },
];

/** По ТЗ 7.1: в виде «медиа» ленты — Контакты и Профиль вместо Семья и Магазин */
const navItemsMediaView = [
  { path: ROUTES.classic.tree, label: 'Дерево', icon: TreePine },
  { path: ROUTES.classic.feed, label: 'Лента', icon: Newspaper },
  { path: ROUTES.classic.create, label: '', icon: Plus, isCenter: true },
  { path: ROUTES.classic.family, label: 'Контакты', icon: Users },
  { path: ROUTES.classic.myProfile, label: 'Профиль', icon: User },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFeedMediaView = location.pathname === ROUTES.classic.feed && new URLSearchParams(location.search).get('view') === 'media';
  const navItems = isFeedMediaView ? navItemsMediaView : navItemsDefault;

  return (
    <nav className="app-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/60 safe-area-pb">
      <div className="mx-auto flex max-w-md items-stretch justify-around min-h-[72px] py-2">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="touch-target flex flex-1 items-center justify-center min-w-touch"
                aria-label="Создать"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-primary/50 bg-primary/10 text-primary shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-300 animate-warm-glow">
                  <item.icon className="h-7 w-7" strokeWidth={2} />
                </div>
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`touch-target flex flex-1 flex-col items-center justify-center gap-1 min-w-0 px-2 py-2 rounded-xl transition-all duration-200 ${active ? 'text-primary font-semibold bg-primary/15 ring-2 ring-primary/25' : 'text-muted-foreground hover:text-foreground/80 hover:bg-primary/5'}`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.25 : 1.5} />
              <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase tabular-nums">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
