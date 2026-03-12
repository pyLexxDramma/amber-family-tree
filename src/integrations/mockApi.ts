import type { AngeloApi, FeedListParams } from './api.types';
import { mockPublications } from '@/data/mock-publications';
import { currentUserId, getCurrentUser, getMember, mockMembers } from '@/data/mock-members';
import { myMediaDemoItems } from '@/data/my-media-demo';
import type { MediaItem } from '@/types';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';

function filterFeed(params?: FeedListParams) {
  let items = [...mockPublications];
  if (params?.authorId) {
    items = items.filter(p => p.authorId === params.authorId || p.coAuthorIds.includes(params.authorId));
  }
  if (params?.topicTag) {
    items = items.filter(p => p.topicTag === params.topicTag);
  }
  items.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  if (typeof params?.offset === 'number' || typeof params?.limit === 'number') {
    const offset = params.offset ?? 0;
    const limit = params.limit ?? items.length;
    items = items.slice(offset, offset + limit);
  }
  return items;
}

export const mockApi: AngeloApi = {
  feed: {
    async list(params) {
      return filterFeed(params);
    },
    async getById(id) {
      return mockPublications.find(p => p.id === id) ?? null;
    },
  },
  family: {
    async listMembers() {
      return mockMembers;
    },
    async getMember(id) {
      return getMember(id) ?? null;
    },
  },
  auth: {
    async sendCode() {
      return { sent: true };
    },
    async verify() {
      const user = { id: currentUserId, member: getCurrentUser(), subscription: { planId: 'free', usedPlaces: 3, expiresAt: '2026-12-31' } };
      return { access_token: 'mock-token', token_type: 'bearer', user };
    },
    async me() {
      return { id: currentUserId, member: getCurrentUser(), subscription: { planId: 'free', usedPlaces: 3, expiresAt: '2026-12-31' } };
    },
  },
  profile: {
    async getMyProfile() {
      return getCurrentUserForDisplay();
    },
    async updateMyProfile(patch) {
      const base = getCurrentUser();
      return { ...base, ...patch };
    },
    async listMyMedia() {
      return myMediaDemoItems.map(item => {
        const media: MediaItem = {
          id: item.id,
          type: item.type,
          url: item.src,
          name: item.title,
          size: 0,
          eventDate: item.eventDate,
          year: item.year,
          category: item.category,
          publicationId: item.publicationId,
        };
        return media;
      });
    },
  },
  media: {
    async presign(body) {
      const key = `mock/${Date.now()}_${body.filename}`;
      return { upload_url: `https://example.com/upload?key=${encodeURIComponent(key)}`, key, url: `https://example.com/media/${key}` };
    },
  },
};

