import type { AngeloApi } from './api.types';
import { mockApi } from './mockApi';
import { realApi } from './realApi';

const useMock = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
export const api: AngeloApi = useMock ? mockApi : realApi;

