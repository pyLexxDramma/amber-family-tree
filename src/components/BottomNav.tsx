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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          if (item.isCenter) {
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center border border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300">
                  <item.icon className="h-4 w-4" />
                </div>
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors duration-200 ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}
            >
              <item.icon className="h-4 w-4" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] tracking-widest uppercase font-light">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
