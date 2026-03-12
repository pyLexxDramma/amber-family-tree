const KEY = 'angelo-demo-mode';

export function isDemoMode(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(KEY) === '1';
}

export function setDemoMode(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, enabled ? '1' : '0');
}

