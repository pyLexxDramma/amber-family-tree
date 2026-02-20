import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'angelo-demo-ui-variant';

export type UIVariant = 'current' | 'classic' | 'living' | 'calendar' | 'journal';

type UIVariantContextValue = {
  variant: UIVariant;
  setVariant: (v: UIVariant) => void;
};

const defaultValue: UIVariantContextValue = {
  variant: 'current',
  setVariant: () => {},
};

const UIVariantContext = createContext<UIVariantContextValue>(defaultValue);

export function getStoredVariant(): UIVariant {
  if (typeof localStorage === 'undefined') return 'current';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'classic' || v === 'living' || v === 'calendar' || v === 'journal' || v === 'current') return v;
  return 'current';
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
