import React, { createContext, useContext } from 'react';
import { PlatformAdapter } from './types';
import { MockWebAdapter } from './MockWebAdapter';
import { TelegramAdapter } from './TelegramAdapter';

const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
const defaultAdapter: PlatformAdapter = isTelegram ? new TelegramAdapter() : new MockWebAdapter();

const PlatformContext = createContext<PlatformAdapter>(defaultAdapter);

export const PlatformProvider: React.FC<{ children: React.ReactNode; adapter?: PlatformAdapter }> = ({ children, adapter }) => (
  <PlatformContext.Provider value={adapter || defaultAdapter}>{children}</PlatformContext.Provider>
);

export const usePlatform = () => useContext(PlatformContext);
