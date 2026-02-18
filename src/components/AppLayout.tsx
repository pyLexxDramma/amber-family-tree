import React from 'react';
import { BottomNav } from './BottomNav';

const LAYOUT_BG = '/bg-4.png';

export const AppLayout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({ children, hideNav }) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden paper-texture">
    <div className="fixed inset-0 -z-10">
      <img src={LAYOUT_BG} alt="" className="h-full w-full object-cover photo-bg-blur" />
      <div className="absolute inset-0 bg-background/88" />
    </div>
    <main className={`flex-1 ${hideNav ? '' : 'pb-20'} relative z-0`}>
      {children}
    </main>
    {!hideNav && <BottomNav />}
  </div>
);
