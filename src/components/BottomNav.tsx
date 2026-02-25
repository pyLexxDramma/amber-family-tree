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
    <nav className="app-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/40 safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5 px-2">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="touch-target flex items-center justify-center"
                aria-label="Создать"
              >
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                  <item.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors"
              aria-current={active ? 'page' : undefined}
            >
              <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                active ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
                <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
