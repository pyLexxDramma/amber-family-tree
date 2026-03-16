import type { AngeloApi, FeedListParams } from './api.types';
import { mockPublications } from '@/data/mock-publications';
import { currentUserId, getCurrentUser, getMember, mockMembers } from '@/data/mock-members';
import { myMediaDemoItems } from '@/data/my-media-demo';
import type { Comment, MediaItem, Message } from '@/types';
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
    async addComment(publicationId, text) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const comment: Comment = {
        id: `c_${Date.now()}`,
        authorId: currentUserId,
        text,
        createdAt: new Date().toISOString(),
      };
      pub.comments = [...(pub.comments ?? []), comment];
      return comment;
    },
    async addLike(publicationId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const likes = pub.likes ?? [];
      pub.likes = likes.includes(currentUserId) ? likes : [...likes, currentUserId];
      return pub;
    },
    async removeLike(publicationId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      pub.likes = (pub.likes ?? []).filter(id => id !== currentUserId);
      return pub;
    },
    async addCommentLike(publicationId, commentId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const comment = (pub.comments ?? []).find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');
      const likes = comment.likes ?? [];
      comment.likes = likes.includes(currentUserId) ? likes : [...likes, currentUserId];
      return comment;
    },
    async removeCommentLike(publicationId, commentId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const comment = (pub.comments ?? []).find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');
      comment.likes = (comment.likes ?? []).filter(id => id !== currentUserId);
      return comment;
    },
    async updatePublication(publicationId, patch) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      if (patch.title !== undefined) pub.title = patch.title ?? '';
      if (patch.text !== undefined) pub.text = patch.text ?? '';
      return pub;
    },
    async deletePublication(publicationId) {
      const idx = mockPublications.findIndex(p => p.id === publicationId);
      if (idx === -1) throw new Error('Publication not found');
      mockPublications.splice(idx, 1);
      return { deleted: true as const };
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
          thumbnail: item.thumbnail,
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
  messages: {
    async listWith(memberId: string) {
      return mockMessages
        .filter(m => (m.senderId === currentUserId && m.recipientId === memberId) || (m.senderId === memberId && m.recipientId === currentUserId))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async sendTo(memberId: string, text: string) {
      const msg: Message = {
        id: `m_${Date.now()}`,
        senderId: currentUserId,
        recipientId: memberId,
        text,
        createdAt: new Date().toISOString(),
      };
      mockMessages = [...mockMessages, msg];
      return msg;
    },
  },
};

let mockMessages: Message[] = [];

