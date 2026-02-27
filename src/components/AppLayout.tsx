import React from 'react';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({ children, hideNav }) => (
  <div className="relative flex min-h-screen flex-col bg-background">
    <main className={`flex-1 ${hideNav ? '' : 'pb-20'} relative z-0`}>
      {children}
    </main>
    {!hideNav && <BottomNav />}
  </div>
);
