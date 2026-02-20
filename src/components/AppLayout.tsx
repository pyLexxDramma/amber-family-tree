import React from 'react';
import { BottomNav } from './BottomNav';

/** Однородный тёплый фон без фото — текст чётко виден на всех экранах */
export const AppLayout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({ children, hideNav }) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden paper-texture">
    <div className="fixed inset-0 -z-10 bg-background" />
    <main className={`flex-1 ${hideNav ? '' : 'pb-24'} relative z-0`}>
      {children}
    </main>
    {!hideNav && <BottomNav />}
  </div>
);
