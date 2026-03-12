const API_PREFIX = '/api';

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:8000';
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function buildUrl(path: string): string {
  const base = getBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${API_PREFIX}${normalized}`;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export class ApiError extends Error {
  status: number;
  bodyText: string;

  constructor(message: string, status: number, bodyText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

export async function requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method,
    headers: buildHeaders(),
    body: body == null ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new ApiError(`API ${method} ${path}: ${res.status}`, res.status, text);
  return (text ? JSON.parse(text) : null) as T;
}

export function getJson<T>(path: string): Promise<T> {
  return requestJson<T>('GET', path);
}

