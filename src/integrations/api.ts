import type { AngeloApi } from './api.types';
import { mockApi } from './mockApi';
import { realApi } from './realApi';

const base = (import.meta.env.VITE_API_BASE as string)?.trim();
export const api: AngeloApi = base ? realApi : mockApi;

