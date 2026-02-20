import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'angelo-privacy-visibility';

export type PrivacyVisibility = 'all' | 'family' | 'only_me';

type PrivacyVisibilityContextValue = {
  visibility: PrivacyVisibility;
  setVisibility: (v: PrivacyVisibility) => void;
};

function getStored(): PrivacyVisibility {
  if (typeof localStorage === 'undefined') return 'family';
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'all' || v === 'family' || v === 'only_me') return v;
  return 'family';
}

const PrivacyVisibilityContext = createContext<PrivacyVisibilityContextValue>({
  visibility: 'family',
  setVisibility: () => {},
});

export function PrivacyVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visibility, setVisibilityState] = useState<PrivacyVisibility>(getStored);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'all' || stored === 'family' || stored === 'only_me') setVisibilityState(stored);
  }, []);

  const setVisibility = useCallback((v: PrivacyVisibility) => {
    setVisibilityState(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, v);
  }, []);

  return (
    <PrivacyVisibilityContext.Provider value={{ visibility, setVisibility }}>
      {children}
    </PrivacyVisibilityContext.Provider>
  );
}

export function usePrivacyVisibility() {
  return useContext(PrivacyVisibilityContext);
}
