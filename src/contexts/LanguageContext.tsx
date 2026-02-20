import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Locale, translations } from '@/i18n/translations';

const STORAGE_KEY = 'angelo-locale';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

function getStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'ru';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'ru' || v === 'en') return v;
  return 'ru';
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'ru',
  setLocale: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') setLocaleState(stored);
  }, []);

  const setLocale = useCallback((value: Locale) => {
    setLocaleState(value);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[locale][key] ?? translations.ru[key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
