import type { AngeloApi } from './api.types';
import { mockApi } from './mockApi';
import { realApi } from './realApi';

const useMock = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const demoMockData = String(import.meta.env.VITE_DEMO_MOCK_DATA ?? '').toLowerCase() === 'true';

export const api: AngeloApi = useMock
  ? mockApi
  : demoMockData
    ? { auth: realApi.auth, feed: mockApi.feed, family: mockApi.family, profile: mockApi.profile }
    : realApi;

