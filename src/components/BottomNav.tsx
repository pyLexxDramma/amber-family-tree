import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TreeDeciduous, Image as ImageIcon, Plus, Users, Store, History, Library, MessageCircle, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { classicPathIsPrototype, isVisionIANavEnabled } from '@/lib/visionIa';

type NavItem = { path: string; label: string; icon: typeof TreeDeciduous; matchPrefix?: boolean };

const legacyNavItems: NavItem[] = [
  { path: ROUTES.classic.tree, label: 'Дерево', icon: TreeDeciduous },
  { path: ROUTES.classic.feed, label: 'Лента', icon: ImageIcon },
  { path: ROUTES.classic.create, label: 'Создать', icon: Plus },
  { path: ROUTES.classic.family, label: 'Семья', icon: Users },
  { path: ROUTES.classic.store, label: 'Магазин', icon: Store },
];

const visionNavItems: NavItem[] = [
  { path: ROUTES.classic.tree, label: 'Семья', icon: TreeDeciduous },
  { path: ROUTES.classic.timeline, label: 'История', icon: History },
  { path: ROUTES.classic.albums, label: 'Коллекции', icon: Library },
  { path: ROUTES.classic.messagesHub, label: 'Сообщения', icon: MessageCircle, matchPrefix: true },
  { path: ROUTES.classic.myProfile, label: 'Профиль', icon: User },
  { path: ROUTES.classic.store, label: 'Ателье', icon: Store },
];

function itemIsActive(pathname: string, item: NavItem): boolean {
  if (item.path === ROUTES.classic.create) {
    return pathname === ROUTES.classic.create || pathname.startsWith(ROUTES.classic.create + '/');
  }
  if (item.matchPrefix || item.path === ROUTES.classic.timeline || item.path === ROUTES.classic.albums) {
    return pathname === item.path || pathname.startsWith(item.path + '/');
  }
  return pathname === item.path || pathname.startsWith(item.path + '/');
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vision = isVisionIANavEnabled();
  const mainNavItems = useMemo(() => (vision ? visionNavItems : legacyNavItems), [vision]);
  const isPrototype = classicPathIsPrototype(location.pathname);

  return (
    <nav
      className={`app-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t safe-area-pb ${
        isPrototype ? 'app-bottom-nav--prototype bg-[var(--proto-card)] border-[var(--proto-border)]' : 'bg-card border-border'
      }`}
      style={
        isPrototype
          ? {
              ['--proto-card' as string]: '#F0EDE8',
              ['--proto-border' as string]: '#E5E1DC',
              ['--proto-active' as string]: '#A39B8A',
              ['--proto-text-muted' as string]: '#6B6560',
            }
          : undefined
      }
    >
      <div className={`mx-auto flex items-center justify-around py-2 px-1 ${vision ? 'max-w-lg' : 'max-w-md'}`}>
        {mainNavItems.map(item => {
          const active = itemIsActive(location.pathname, item);
          const isCreate = item.path === ROUTES.classic.create;
          const Icon = item.icon;
          return (
            <button
              key={`${vision ? 'v' : 'l'}-${item.path}-${item.label}`}
              type="button"
              onClick={() => navigate(isCreate ? ROUTES.classic.create : item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 min-w-0 flex-1 max-w-[72px] transition-colors rounded-lg ${
                isPrototype ? 'hover:bg-[var(--proto-border)]' : 'hover:bg-muted/50'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${
                  active
                    ? isPrototype
                      ? 'text-[var(--proto-active)]'
                      : 'text-primary'
                    : isPrototype
                      ? 'text-[var(--proto-text-muted)]'
                      : 'text-muted-foreground'
                }`}
                strokeWidth={active ? 2.2 : 1.5}
              />
              <span
                className={`hidden md:block text-[9px] sm:text-[10px] font-medium text-center leading-tight line-clamp-2 ${
                  active
                    ? isPrototype
                      ? 'text-[var(--proto-active)]'
                      : 'text-primary'
                    : isPrototype
                      ? 'text-[var(--proto-text-muted)]'
                      : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
