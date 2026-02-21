import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const DEMO_KEY = 'angelo-demo-full';

export function useDemoWithPhotos(): boolean {
  const [searchParams] = useSearchParams();
  const demoFull = searchParams.get('demo') === 'full';
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(DEMO_KEY) : null;
  const enabled = demoFull || stored !== '0';

  useEffect(() => {
    if (demoFull && typeof localStorage !== 'undefined') localStorage.setItem(DEMO_KEY, '1');
  }, [demoFull]);

  return enabled;
}

export function setDemoWithPhotos(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (enabled) localStorage.setItem(DEMO_KEY, '1');
  else localStorage.setItem(DEMO_KEY, '0');
}
