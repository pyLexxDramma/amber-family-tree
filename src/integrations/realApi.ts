import type { AngeloApi, FeedListParams, PresignUploadRequest, PresignUploadResponse, PublicationCreateBody } from './api.types';
import type { AppUser, Comment, FamilyMember, MediaItem, Message, Publication } from '@/types';
import { getJson, requestJson } from './request';
import {
  normalizeAppUser,
  normalizeComment,
  normalizeFamilyMember,
  normalizeMediaItem,
  normalizeMessage,
  normalizePublication,
} from './normalize';

const debugApi = {
  async seedReference() {
    return requestJson<{ ok: boolean }>('POST', '/debug/seed-reference');
  },
};

export const realApi: AngeloApi = {
  feed: {
    async list(params?: FeedListParams) {
      const q = new URLSearchParams();
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.offset != null) q.set('offset', String(params.offset));
      if (params?.authorId) q.set('author_id', params.authorId);
      if (params?.topicTag) q.set('topic_tag', params.topicTag);
      const suffix = q.toString() ? `?${q}` : '';
      const res = await getJson<unknown>(`/feed${suffix}`);
      return (Array.isArray(res) ? res : []).map(normalizePublication);
    },
    async getById(id: string) {
      const res = await getJson<unknown>(`/feed/${id}`);
      if (!res) return null;
      return normalizePublication(res);
    },
    async createPublication(body: PublicationCreateBody) {
      const payload: Record<string, unknown> = {
        type: body.type,
        title: body.title ?? null,
        text: body.text ?? '',
        event_date: body.event_date,
        event_date_approximate: body.event_date_approximate ?? false,
        place: body.place ?? null,
        topic_tag: body.topic_tag ?? '',
        co_author_ids: body.co_author_ids ?? [],
        participant_ids: body.participant_ids ?? [],
        visible_for: body.visible_for ?? null,
        exclude_for: body.exclude_for ?? null,
        media_keys: body.media_keys ?? [],
        content_blocks: body.content_blocks ?? null,
      };
      const res = await requestJson<{ id: string }>('POST', '/feed', payload);
      return res;
    },
    async addComment(publicationId: string, text: string) {
      const res = await requestJson<unknown>('POST', `/feed/${publicationId}/comments`, { text });
      return normalizeComment(res);
    },
    async addLike(publicationId: string) {
      const res = await requestJson<unknown>('POST', `/feed/${publicationId}/like`);
      return normalizePublication(res);
    },
    async removeLike(publicationId: string) {
      const res = await requestJson<unknown>('DELETE', `/feed/${publicationId}/like`);
      return normalizePublication(res);
    },
    async addCommentLike(publicationId: string, commentId: string) {
      const res = await requestJson<unknown>('POST', `/feed/${publicationId}/comments/${commentId}/like`);
      return normalizeComment(res);
    },
    async removeCommentLike(publicationId: string, commentId: string) {
      const res = await requestJson<unknown>('DELETE', `/feed/${publicationId}/comments/${commentId}/like`);
      return normalizeComment(res);
    },
    async updatePublication(
      publicationId: string,
      patch: {
        title?: string | null;
        text?: string | null;
        event_date?: string;
        event_date_approximate?: boolean;
        place?: string | null;
        topic_tag?: string;
        add_media_keys?: string[];
        remove_media_ids?: string[];
      },
    ) {
      const res = await requestJson<unknown>('PATCH', `/feed/${publicationId}`, patch);
      return normalizePublication(res);
    },
    async deletePublication(publicationId: string) {
      await requestJson<null>('DELETE', `/feed/${publicationId}`);
      return { deleted: true as const };
    },
  },
  family: {
    async listMembers() {
      const res = await getJson<unknown>('/family/members');
      return (Array.isArray(res) ? res : []).map(normalizeFamilyMember);
    },
    async getMember(id: string) {
      const res = await getJson<unknown>(`/family/members/${id}`);
      if (!res) return null;
      return normalizeFamilyMember(res);
    },
  },
  auth: {
    async sendCode(identifier: string) {
      return requestJson<{ sent: boolean }>('POST', '/auth/send-code', { identifier });
    },
    async verify(identifier: string, code: string) {
      const res = await requestJson<any>('POST', '/auth/verify', { identifier, code });
      return {
        access_token: String(res?.access_token ?? ''),
        token_type: String(res?.token_type ?? 'bearer'),
        user: normalizeAppUser(res?.user),
      };
    },
    async me() {
      const res = await getJson<any>('/auth/me');
      if (!res) return null;
      return normalizeAppUser(res);
    },
  },
  profile: {
    async getMyProfile() {
      const res = await getJson<unknown>('/profile/me');
      return normalizeFamilyMember(res);
    },
    async updateMyProfile(patch: Partial<FamilyMember>) {
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        const snake = key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
        payload[snake] = value;
      }
      const res = await requestJson<unknown>('PATCH', '/profile/me', payload);
      return normalizeFamilyMember(res);
    },
    async listMyMedia() {
      const res = await getJson<unknown>('/profile/me/media');
      return (Array.isArray(res) ? res : []).map(normalizeMediaItem);
    },
  },
  media: {
    async presign(body: PresignUploadRequest) {
      return requestJson<PresignUploadResponse>('POST', '/media/presign', body);
    },
  },
  messages: {
    async listWith(memberId: string) {
      const res = await getJson<unknown>(`/messages/with/${memberId}`);
      return (Array.isArray(res) ? res : []).map(normalizeMessage);
    },
    async sendTo(memberId: string, text: string) {
      const res = await requestJson<unknown>('POST', `/messages/with/${memberId}`, { text });
      return normalizeMessage(res);
    },
  },
  debug: debugApi,
};
