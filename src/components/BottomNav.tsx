import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TreePine, Newspaper, PlusCircle, Users, Store } from 'lucide-react';

const navItems = [
  { path: '/tree', label: 'Tree', icon: TreePine },
  { path: '/feed', label: 'Feed', icon: Newspaper },
  { path: '/create', label: '', icon: PlusCircle, isCenter: true },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/store', label: 'Store', icon: Store },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          if (item.isCenter) {
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center -mt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <item.icon className="h-6 w-6" />
                </div>
              </button>
            );
          }
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
