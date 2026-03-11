import type { AngeloApi, FeedListParams } from './api.types';
import type { AppUser, FamilyMember, MediaItem, Publication } from '@/types';

const BASE = (import.meta.env.VITE_API_BASE as string)?.replace(/\/$/, '') || '';

function authHeader(): Record<string, string> | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('angelo_token') : null;
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeader() };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) });
  if (!res.ok) throw new Error(`API ${method} ${path}: ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

async function get<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export const realApi: AngeloApi = {
  feed: {
    async list(params?: FeedListParams) {
      const q = new URLSearchParams();
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.offset != null) q.set('offset', String(params.offset));
      if (params?.authorId) q.set('authorId', params.authorId);
      if (params?.topicTag) q.set('topicTag', params.topicTag);
      const suffix = q.toString() ? `?${q}` : '';
      return get<Publication[]>(`/feed${suffix}`);
    },
    async getById(id: string) {
      return get<Publication | null>(`/feed/${id}`);
    },
  },
  family: {
    async listMembers() {
      return get<FamilyMember[]>('/family/members');
    },
    async getMember(id: string) {
      return get<FamilyMember | null>(`/family/members/${id}`);
    },
  },
  auth: {
    async login(identifier: string) {
      return request<AppUser>('POST', '/auth/login', { identifier });
    },
    async register(identifier: string) {
      return request<AppUser>('POST', '/auth/register', { identifier });
    },
    async me() {
      return get<AppUser | null>('/auth/me');
    },
  },
  profile: {
    async getMyProfile() {
      return get<FamilyMember>('/profile/me');
    },
    async updateMyProfile(patch: Partial<FamilyMember>) {
      return request<FamilyMember>('PATCH', '/profile/me', patch);
    },
    async listMyMedia() {
      return get<MediaItem[]>('/profile/media');
    },
  },
};
