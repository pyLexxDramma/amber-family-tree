import React from 'react';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({ children, hideNav }) => (
  <div className="relative flex min-h-screen min-h-[100dvh] flex-col bg-background">
    <main className={`flex-1 relative z-0 ${hideNav ? '' : 'pb-[max(5rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))]'}`}>
      {children}
    </main>
    {!hideNav && <BottomNav />}
  </div>
);
