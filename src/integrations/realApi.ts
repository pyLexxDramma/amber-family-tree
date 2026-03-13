import type { AngeloApi, FeedListParams, PresignUploadRequest, PresignUploadResponse } from './api.types';
import type { AppUser, Comment, FamilyMember, MediaItem, Message, Publication } from '@/types';
import { getJson, requestJson } from './request';

export const realApi: AngeloApi = {
  feed: {
    async list(params?: FeedListParams) {
      const q = new URLSearchParams();
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.offset != null) q.set('offset', String(params.offset));
      if (params?.authorId) q.set('author_id', params.authorId);
      if (params?.topicTag) q.set('topic_tag', params.topicTag);
      const suffix = q.toString() ? `?${q}` : '';
      return getJson<Publication[]>(`/feed${suffix}`);
    },
    async getById(id: string) {
      return getJson<Publication | null>(`/feed/${id}`);
    },
    async addComment(publicationId: string, text: string) {
      return requestJson<Comment>('POST', `/feed/${publicationId}/comments`, { text });
    },
    async addLike(publicationId: string) {
      return requestJson<Publication>('POST', `/feed/${publicationId}/like`);
    },
    async removeLike(publicationId: string) {
      return requestJson<Publication>('DELETE', `/feed/${publicationId}/like`);
    },
    async addCommentLike(publicationId: string, commentId: string) {
      return requestJson<Comment>('POST', `/feed/${publicationId}/comments/${commentId}/like`);
    },
    async removeCommentLike(publicationId: string, commentId: string) {
      return requestJson<Comment>('DELETE', `/feed/${publicationId}/comments/${commentId}/like`);
    },
  },
  family: {
    async listMembers() {
      return getJson<FamilyMember[]>('/family/members');
    },
    async getMember(id: string) {
      return getJson<FamilyMember | null>(`/family/members/${id}`);
    },
  },
  auth: {
    async sendCode(identifier: string) {
      return requestJson<{ sent: boolean }>('POST', '/auth/send-code', { identifier });
    },
    async verify(identifier: string, code: string) {
      return requestJson<{ access_token: string; token_type: string; user: AppUser }>('POST', '/auth/verify', { identifier, code });
    },
    async me() {
      return getJson<AppUser | null>('/auth/me');
    },
  },
  profile: {
    async getMyProfile() {
      return getJson<FamilyMember>('/profile/me');
    },
    async updateMyProfile(patch: Partial<FamilyMember>) {
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        const snake = key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
        payload[snake] = value;
      }
      return requestJson<FamilyMember>('PATCH', '/profile/me', payload);
    },
    async listMyMedia() {
      return getJson<MediaItem[]>('/profile/me/media');
    },
  },
  media: {
    async presign(body: PresignUploadRequest) {
      return requestJson<PresignUploadResponse>('POST', '/media/presign', body);
    },
  },
  messages: {
    async listWith(memberId: string) {
      return getJson<Message[]>(`/messages/with/${memberId}`);
    },
    async sendTo(memberId: string, text: string) {
      return requestJson<Message>('POST', `/messages/with/${memberId}`, { text });
    },
  },
};
