import type { AppUser, FamilyMember, MediaItem, Message, Publication } from '@/types';
import type { Comment } from '@/types';

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
  addComment(publicationId: string, text: string): Promise<Comment>;
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

export interface PresignUploadRequest {
  filename: string;
  content_type: string;
  publication_id?: string;
  file_size_bytes?: number;
}

export interface PresignUploadResponse {
  upload_url: string;
  key: string;
  url: string;
}

export interface MediaApi {
  presign(body: PresignUploadRequest): Promise<PresignUploadResponse>;
}

export interface MessagesApi {
  listWith(memberId: string): Promise<Message[]>;
  sendTo(memberId: string, text: string): Promise<Message>;
}

export interface AngeloApi {
  feed: FeedApi;
  family: FamilyApi;
  auth: AuthApi;
  profile: ProfileApi;
  media: MediaApi;
  messages: MessagesApi;
}

