export const REFERENCE_DEMO_EMAIL = 'alina.fadeeva@angelo-demo.ru';
export const REFERENCE_DEMO_CODE = '000000';

export function isReferenceDemoEmail(identifier: string): boolean {
  return identifier.trim().toLowerCase() === REFERENCE_DEMO_EMAIL;
}

export function useMockUiAfterReferenceLogin(): boolean {
  const value = String(import.meta.env.VITE_REFERENCE_DEMO_UI ?? '').toLowerCase();
  return value !== 'false';
}
