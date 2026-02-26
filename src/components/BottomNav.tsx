import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import familyTreeIcon from '@/assets/icons/family-tree.gif';
import iconLenta from '@/assets/icons/icon-lenta.gif';
import iconMicrophone from '@/assets/icons/icon-microphone.gif';
import iconFamily from '@/assets/icons/icon-family.gif';
import iconSettings from '@/assets/icons/icon-settings.gif';

const navItemsDefault = [
  { path: ROUTES.classic.tree, label: 'Дерево', iconImg: familyTreeIcon },
  { path: ROUTES.classic.feed, label: 'Лента', iconImg: iconLenta },
  { path: ROUTES.app, label: '', iconImg: iconMicrophone, isCenter: true },
  { path: ROUTES.classic.family, label: 'Семья', iconImg: iconFamily },
  { path: ROUTES.classic.settings, label: 'Настройки', iconImg: iconSettings },
];

const navItemsMediaView = [
  { path: ROUTES.classic.tree, label: 'Дерево', iconImg: familyTreeIcon },
  { path: ROUTES.classic.feed, label: 'Лента', iconImg: iconLenta },
  { path: ROUTES.app, label: '', iconImg: iconMicrophone, isCenter: true },
  { path: ROUTES.classic.family, label: 'Контакты', iconImg: iconFamily },
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
                aria-label="Голосовой помощник"
              >
                <div className="h-12 w-12 rounded-full border border-primary/40 bg-background/60 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-md shadow-primary/20 hover:bg-primary/5 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                  {'iconImg' in item && item.iconImg ? (
                    <img src={item.iconImg} alt="" className="h-6 w-6 object-contain" />
                  ) : (
                    <item.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
                  )}
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
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors overflow-hidden ${
                  active ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {'iconImg' in item && item.iconImg ? (
                  <img src={item.iconImg} alt="" className="h-5 w-5 object-contain" />
                ) : (
                  'icon' in item && <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                )}
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
