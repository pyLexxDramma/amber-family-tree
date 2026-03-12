import type { AppUser, FamilyMember, MediaItem, Publication } from '@/types';

export interface FeedListParams {
  limit?: number;
  offset?: number;
  authorId?: string;
  topicTag?: string;
}

export interface VerifyResponse {
  access_token: string;
  token_type: string;
  user: AppUser;
}

export interface FeedApi {
  list(params?: FeedListParams): Promise<Publication[]>;
  getById(id: string): Promise<Publication | null>;
}

export interface FamilyApi {
  listMembers(): Promise<FamilyMember[]>;
  getMember(id: string): Promise<FamilyMember | null>;
}

export interface AuthApi {
  sendCode(identifier: string): Promise<{ sent: boolean }>;
  verify(identifier: string, code: string): Promise<VerifyResponse>;
  me(): Promise<AppUser | null>;
}

export interface ProfileApi {
  getMyProfile(): Promise<FamilyMember>;
  updateMyProfile(patch: Partial<FamilyMember>): Promise<FamilyMember>;
  listMyMedia(): Promise<MediaItem[]>;
}

export interface AngeloApi {
  feed: FeedApi;
  family: FamilyApi;
  auth: AuthApi;
  profile: ProfileApi;
}

