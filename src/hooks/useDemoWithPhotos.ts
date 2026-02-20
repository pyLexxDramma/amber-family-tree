import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const DEMO_KEY = 'angelo-demo-full';

export function useDemoWithPhotos(): boolean {
  const [searchParams] = useSearchParams();
  const demoFull = searchParams.get('demo') === 'full';
  const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(DEMO_KEY) === '1' : false;
  const enabled = demoFull || stored;

  useEffect(() => {
    if (demoFull && typeof sessionStorage !== 'undefined') sessionStorage.setItem(DEMO_KEY, '1');
  }, [demoFull]);

  return enabled;
}

export function setDemoWithPhotos(enabled: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (enabled) sessionStorage.setItem(DEMO_KEY, '1');
  else sessionStorage.removeItem(DEMO_KEY);
}
