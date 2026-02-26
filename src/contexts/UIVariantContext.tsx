import React, { createContext, useContext, useEffect } from 'react';

export type UIVariant = 'journal';

type UIVariantContextValue = {
  variant: UIVariant;
};

const defaultValue: UIVariantContextValue = { variant: 'journal' };
const UIVariantContext = createContext<UIVariantContextValue>(defaultValue);

export function UIVariantProvider({ children }: { children: React.ReactNode }) {
  return (
    <UIVariantContext.Provider value={{ variant: 'journal' }}>
      {children}
    </UIVariantContext.Provider>
  );
}

export function useUIVariant() {
  return useContext(UIVariantContext);
}

export function UIVariantSync() {
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-variant', 'journal');
    return () => document.documentElement.removeAttribute('data-ui-variant');
  }, []);
  return null;
}
