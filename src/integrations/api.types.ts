import type { AppUser, FamilyMember, MediaItem, Publication } from '@/types';

export interface FeedListParams {
  limit?: number;
  offset?: number;
  authorId?: string;
  topicTag?: string;
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
  login(identifier: string): Promise<AppUser>;
  register(identifier: string): Promise<AppUser>;
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

