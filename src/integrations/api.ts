import type { AngeloApi } from './api.types';
import { mockApi } from './mockApi';
import { realApi } from './realApi';
import { isDemoMode } from '@/lib/demoMode';

const useMock = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const demoMockData = String(import.meta.env.VITE_DEMO_MOCK_DATA ?? '').toLowerCase() === 'true';

function selectApi(): AngeloApi {
  if (isDemoMode()) return mockApi;
  if (useMock) return mockApi;
  if (demoMockData)
    return {
      auth: realApi.auth,
      feed: mockApi.feed,
      family: realApi.family,
      profile: realApi.profile,
      media: realApi.media,
      messages: realApi.messages,
      contactRequests: realApi.contactRequests,
    } as AngeloApi;
  return realApi;
}

export const api: AngeloApi = {
  feed: {
    list: (params) => selectApi().feed.list(params),
    getById: (id) => selectApi().feed.getById(id),
    createPublication: (body) => selectApi().feed.createPublication(body),
    addComment: (publicationId, text) => selectApi().feed.addComment(publicationId, text),
    addLike: (publicationId) => selectApi().feed.addLike(publicationId),
    removeLike: (publicationId) => selectApi().feed.removeLike(publicationId),
    addMediaLike: (publicationId, mediaId) => selectApi().feed.addMediaLike(publicationId, mediaId),
    removeMediaLike: (publicationId, mediaId) => selectApi().feed.removeMediaLike(publicationId, mediaId),
    addCommentLike: (publicationId, commentId) => selectApi().feed.addCommentLike(publicationId, commentId),
    removeCommentLike: (publicationId, commentId) => selectApi().feed.removeCommentLike(publicationId, commentId),
    updatePublication: (publicationId, patch) => selectApi().feed.updatePublication(publicationId, patch),
    deletePublication: (publicationId) => selectApi().feed.deletePublication(publicationId),
  },
  family: {
    listMembers: () => selectApi().family.listMembers(),
    getMember: (id) => selectApi().family.getMember(id),
    createMember: (body) => selectApi().family.createMember(body),
    updateMember: (memberId, patch) => selectApi().family.updateMember(memberId, patch),
    transferMember: (memberId, toMemberId) => selectApi().family.transferMember(memberId, toMemberId),
    deleteMember: (memberId) => selectApi().family.deleteMember(memberId),
  },
  auth: {
    sendCode: (identifier) => selectApi().auth.sendCode(identifier),
    verify: (identifier, code) => selectApi().auth.verify(identifier, code),
    me: () => selectApi().auth.me(),
  },
  profile: {
    getMyProfile: () => selectApi().profile.getMyProfile(),
    updateMyProfile: (patch) => selectApi().profile.updateMyProfile(patch),
    listMyMedia: () => selectApi().profile.listMyMedia(),
  },
  media: {
    presign: (body) => selectApi().media.presign(body),
    registerUploadedUrl: (key, url) => selectApi().media.registerUploadedUrl?.(key, url),
  },
  messages: {
    listWith: (memberId) => selectApi().messages.listWith(memberId),
    sendTo: (memberId, text) => selectApi().messages.sendTo(memberId, text),
  },
  contactRequests: {
    getStateWith: (memberId) => selectApi().contactRequests.getStateWith(memberId),
    createWith: (memberId) => selectApi().contactRequests.createWith(memberId),
    listIncoming: () => selectApi().contactRequests.listIncoming(),
    accept: (requestId) => selectApi().contactRequests.accept(requestId),
    reject: (requestId) => selectApi().contactRequests.reject(requestId),
  },
  debug: realApi.debug,
};

