import type { AngeloApi, FeedListParams, PublicationCreateBody } from './api.types';
import { mockPublications } from '@/data/mock-publications';
import { currentUserId, getCurrentUser, getMember, mockMembers } from '@/data/mock-members';
import { myMediaDemoItems } from '@/data/my-media-demo';
import type { Comment, ContactRequest, ContactRequestState, FamilyMember, MediaItem, Message, Publication } from '@/types';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { refUrl } from '@/data/mock-publications';

const DEMO_PHOTOS = ['Фото 1.jpg', 'Фото 2.png', 'Фото 3.png', 'Фото 4.png', 'Фото 5.png', 'Фото 6.png', 'Фото7.png'];
const DEMO_VIDEO = 'Фото 1.jpg';
const DEMO_AUDIO = 'Фото 6.png';
let mockMediaIndex = 0;

const mockMediaStore = new Map<string, { url: string; type: string }>();

export function getMockMediaUrl(key: string): string | undefined {
  return mockMediaStore.get(key)?.url;
}

export function isMockUploadUrl(url: string): boolean {
  return url.includes('example.com');
}

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
      const myLikesCount = likes.filter(id => id === currentUserId).length;
      pub.likes = myLikesCount >= 3 ? likes : [...likes, currentUserId];
      return pub;
    },
    async removeLike(publicationId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const likes = pub.likes ?? [];
      const idx = likes.findIndex(id => id === currentUserId);
      if (idx === -1) return pub;
      pub.likes = [...likes.slice(0, idx), ...likes.slice(idx + 1)];
      return pub;
    },
    async addMediaLike(publicationId, mediaId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const media = (pub.media ?? []).find(m => m.id === mediaId);
      if (!media || (media.type !== 'photo' && media.type !== 'video')) throw new Error('Media not found');
      const likes = media.likes ?? [];
      const myLikesCount = likes.filter(id => id === currentUserId).length;
      media.likes = myLikesCount >= 3 ? likes : [...likes, currentUserId];
      return pub;
    },
    async removeMediaLike(publicationId, mediaId) {
      const pub = mockPublications.find(p => p.id === publicationId);
      if (!pub) throw new Error('Publication not found');
      const media = (pub.media ?? []).find(m => m.id === mediaId);
      if (!media || (media.type !== 'photo' && media.type !== 'video')) throw new Error('Media not found');
      const likes = media.likes ?? [];
      const idx = likes.findIndex(id => id === currentUserId);
      if (idx === -1) return pub;
      media.likes = [...likes.slice(0, idx), ...likes.slice(idx + 1)];
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
      const removeIds = new Set((patch as any).remove_media_ids ?? []);
      if (removeIds.size) {
        pub.media = (pub.media ?? []).filter(m => !removeIds.has(m.id));
      }
      const addKeys: string[] = (patch as any).add_media_keys ?? [];
      if (addKeys.length) {
        const next = addKeys.map((key, i) => {
          const stored = mockMediaStore.get(key);
          const url = stored?.url ?? refUrl(DEMO_PHOTOS[(mockMediaIndex + i) % DEMO_PHOTOS.length]);
          const mediaType = (stored?.type ?? 'image') as 'photo' | 'video' | 'audio' | 'document';
          return {
            id: `m_${Date.now()}_${i}`,
            type: (mediaType === 'image' ? 'photo' : mediaType),
            url,
            thumbnail: mediaType === 'video' || mediaType === 'photo' ? url : undefined,
            name: key.split('/').pop() || `Media ${i + 1}`,
            size: 0,
          };
        });
        pub.media = [...(pub.media ?? []), ...(next as any)];
      }
      return pub;
    },
    async deletePublication(publicationId) {
      const idx = mockPublications.findIndex(p => p.id === publicationId);
      if (idx === -1) throw new Error('Publication not found');
      mockPublications.splice(idx, 1);
      return { deleted: true as const };
    },
    async createPublication(body: PublicationCreateBody) {
      const keys = body.media_keys ?? [];
      const media: MediaItem[] = keys.map((key, i) => {
        const stored = mockMediaStore.get(key);
        const url = stored?.url ?? refUrl(DEMO_PHOTOS[i % DEMO_PHOTOS.length]);
        const mediaType = (stored?.type ?? 'image') as 'photo' | 'video' | 'audio' | 'document';
        return {
          id: `m_${Date.now()}_${i}`,
          type: mediaType,
          url,
          thumbnail: mediaType === 'video' || mediaType === 'photo' ? url : undefined,
          name: `Media ${i + 1}`,
          size: 0,
        };
      });
      const today = new Date().toISOString().slice(0, 10);
      const pub: Publication = {
        id: `p_${Date.now()}`,
        type: (body.type as Publication['type']) ?? 'text',
        authorId: currentUserId,
        coAuthorIds: body.co_author_ids ?? [],
        title: body.title ?? undefined,
        text: body.text ?? '',
        eventDate: body.event_date ?? today,
        eventDateApproximate: body.event_date_approximate ?? false,
        place: body.place ?? undefined,
        publishDate: new Date().toISOString().slice(0, 10),
        media,
        participantIds: body.participant_ids ?? [],
        topicTag: body.topic_tag ?? '',
        likes: [],
        comments: [],
        isRead: false,
        contentBlocks: body.content_blocks ?? undefined,
      };
      mockPublications.push(pub);
      return { id: pub.id };
    },
  },
  family: {
    async listMembers() {
      return mockMembers;
    },
    async getMember(id) {
      return getMember(id) ?? null;
    },
    async createMember(body) {
      const u = getCurrentUser();
      if (u.role !== 'admin') throw new Error('Admin only');
      const id = `m_${Date.now()}`;
      const member: FamilyMember = {
        id,
        firstName: body.first_name.trim(),
        lastName: body.last_name.trim(),
        middleName: body.middle_name?.trim() || undefined,
        birthDate: body.birth_date.trim(),
        deathDate: body.death_date?.trim() || undefined,
        city: body.city?.trim() || undefined,
        about: body.about?.trim() || undefined,
        role: 'member',
        isActive: true,
        generation: 0,
        relations: [],
        managedById: currentUserId,
      };
      mockMembers.push(member);
      return member;
    },
    async updateMember(memberId, patch) {
      const member = getMember(memberId);
      if (!member) throw new Error('Member not found');
      const u = getCurrentUser();
      const isAdmin = u.role === 'admin';
      const isManager = member.managedById === currentUserId;
      if (!isAdmin && !isManager) throw new Error('No permission');
      if (patch.firstName !== undefined) member.firstName = patch.firstName;
      if (patch.lastName !== undefined) member.lastName = patch.lastName;
      if (patch.middleName !== undefined) member.middleName = patch.middleName;
      if (patch.birthDate !== undefined) member.birthDate = patch.birthDate;
      if (patch.deathDate !== undefined) member.deathDate = patch.deathDate;
      if (patch.city !== undefined) member.city = patch.city;
      if (patch.about !== undefined) member.about = patch.about;
      if (patch.avatar !== undefined) (member as any).avatar = patch.avatar;
      return member;
    },
    async transferMember(memberId, toMemberId) {
      const member = getMember(memberId);
      if (!member) throw new Error('Member not found');
      const u = getCurrentUser();
      if (u.role !== 'admin') throw new Error('Only admin can assign profile manager');
      const target = getMember(toMemberId);
      if (!target) throw new Error('Target member not found');
      if (target.id === currentUserId) throw new Error('Cannot transfer to yourself');
      (member as any).managedById = target.id;
      return member;
    },
    async deleteMember(memberId) {
      const member = getMember(memberId);
      if (!member) throw new Error('Member not found');
      const u = getCurrentUser();
      if (u.role !== 'admin') throw new Error('Only admin can delete');
      const idx = mockMembers.findIndex(m => m.id === memberId);
      if (idx >= 0) mockMembers.splice(idx, 1);
      return { deleted: true as const };
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
      const type = body.content_type?.startsWith('video/') ? 'video' : body.content_type?.startsWith('audio/') ? 'audio' : 'image';
      const file = type === 'video' ? DEMO_VIDEO : type === 'audio' ? DEMO_AUDIO : DEMO_PHOTOS[mockMediaIndex++ % DEMO_PHOTOS.length];
      const url = refUrl(file);
      mockMediaStore.set(key, { url, type });
      return { upload_url: `https://example.com/upload?key=${encodeURIComponent(key)}`, key, url };
    },
    registerUploadedUrl(key: string, url: string) {
      const stored = mockMediaStore.get(key);
      if (stored) mockMediaStore.set(key, { ...stored, url });
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
  contactRequests: {
    async getStateWith(memberId: string): Promise<ContactRequestState> {
      const req = mockContactRequests.find(
        r =>
          (r.fromMemberId === currentUserId && r.toMemberId === memberId) ||
          (r.fromMemberId === memberId && r.toMemberId === currentUserId),
      );
      if (!req) return { status: 'none', requestId: null, direction: 'none' };
      const direction = req.fromMemberId === currentUserId ? 'outgoing' : 'incoming';
      return { status: req.status, requestId: req.id, direction };
    },
    async createWith(memberId: string): Promise<ContactRequestState> {
      const existing = mockContactRequests.find(
        r =>
          (r.fromMemberId === currentUserId && r.toMemberId === memberId) ||
          (r.fromMemberId === memberId && r.toMemberId === currentUserId),
      );
      if (existing) {
        const direction = existing.fromMemberId === currentUserId ? 'outgoing' : 'incoming';
        return { status: existing.status, requestId: existing.id, direction };
      }

      const id = `cr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const next: ContactRequest = {
        id,
        fromMemberId: currentUserId,
        toMemberId: memberId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      mockContactRequests = [...mockContactRequests, next];
      return { status: 'pending', requestId: id, direction: 'outgoing' };
    },
    async listIncoming(): Promise<ContactRequest[]> {
      return mockContactRequests.filter(r => r.toMemberId === currentUserId && r.status === 'pending');
    },
    async accept(requestId: string): Promise<ContactRequestState> {
      mockContactRequests = mockContactRequests.map(r => (r.id === requestId ? { ...r, status: 'accepted' } : r));
      return { status: 'accepted', requestId, direction: 'incoming' };
    },
    async reject(requestId: string): Promise<ContactRequestState> {
      mockContactRequests = mockContactRequests.map(r => (r.id === requestId ? { ...r, status: 'rejected' } : r));
      return { status: 'rejected', requestId, direction: 'incoming' };
    },
  },
};

let mockMessages: Message[] = [];
let mockContactRequests: ContactRequest[] = [];

