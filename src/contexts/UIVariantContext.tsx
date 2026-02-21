import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'angelo-demo-ui-variant';

export type UIVariant = 'current' | 'classic' | 'living' | 'calendar' | 'journal' | 'minimal' | 'retro';

type UIVariantContextValue = {
  variant: UIVariant;
  setVariant: (v: UIVariant) => void;
};

const defaultValue: UIVariantContextValue = {
  variant: 'classic',
  setVariant: () => {},
};

const UIVariantContext = createContext<UIVariantContextValue>(defaultValue);

/** По умолчанию запускается текущий (классический) интерфейс без выбора варианта. */
export function getStoredVariant(): UIVariant {
  if (typeof localStorage === 'undefined') return 'classic';
  const v = localStorage.getItem(STORAGE_KEY);
  const valid: UIVariant[] = ['classic','living','calendar','journal','minimal','retro','current'];
  if (valid.includes(v as UIVariant)) return v as UIVariant;
  return 'classic';
}

export function UIVariantProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<UIVariant>(getStoredVariant);

  const setVariant = useCallback((v: UIVariant) => {
    setVariantState(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  }, []);

  return (
    <UIVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </UIVariantContext.Provider>
  );
}

export function useUIVariant() {
  return useContext(UIVariantContext);
}

/** Syncs current variant to document for CSS selectors [data-ui-variant="..."] */
export function UIVariantSync() {
  const { variant } = useUIVariant();
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-variant', variant);
    return () => document.documentElement.removeAttribute('data-ui-variant');
  }, [variant]);
  return null;
}
