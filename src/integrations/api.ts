import type { AngeloApi } from './api.types';
import { mockApi } from './mockApi';
import { realApi } from './realApi';
import { isDemoMode } from '@/lib/demoMode';

const useMock = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const demoMockData = String(import.meta.env.VITE_DEMO_MOCK_DATA ?? '').toLowerCase() === 'true';

function selectApi(): AngeloApi {
  if (isDemoMode()) return mockApi;
  if (useMock) return mockApi;
  if (demoMockData) return { auth: realApi.auth, feed: mockApi.feed, family: realApi.family, profile: realApi.profile, media: realApi.media, messages: realApi.messages };
  return realApi;
}

export const api: AngeloApi = {
  feed: {
    list: (params) => selectApi().feed.list(params),
    getById: (id) => selectApi().feed.getById(id),
    addComment: (publicationId, text) => selectApi().feed.addComment(publicationId, text),
  },
  family: {
    listMembers: () => selectApi().family.listMembers(),
    getMember: (id) => selectApi().family.getMember(id),
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
  },
  messages: {
    listWith: (memberId) => selectApi().messages.listWith(memberId),
    sendTo: (memberId, text) => selectApi().messages.sendTo(memberId, text),
  },
};

