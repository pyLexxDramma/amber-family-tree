import type { AppUser, ContactRequest, ContactRequestState, FamilyMember, MediaItem, Message, Publication } from '@/types';
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

export interface PublicationCreateBody {
  type: string;
  title?: string | null;
  text?: string;
  event_date: string;
  event_date_approximate?: boolean;
  place?: string | null;
  topic_tag?: string;
  co_author_ids?: string[];
  participant_ids?: string[];
  visible_for?: string[] | null;
  exclude_for?: string[] | null;
  media_keys?: string[];
  content_blocks?: Array<{ type: string; text?: string; n?: number; url?: string }> | null;
}

export interface FeedApi {
  list(params?: FeedListParams): Promise<Publication[]>;
  getById(id: string): Promise<Publication | null>;
  createPublication(body: PublicationCreateBody): Promise<{ id: string }>;
  addComment(publicationId: string, text: string): Promise<Comment>;
  addLike(publicationId: string): Promise<Publication>;
  removeLike(publicationId: string): Promise<Publication>;
  addCommentLike(publicationId: string, commentId: string): Promise<Comment>;
  removeCommentLike(publicationId: string, commentId: string): Promise<Comment>;
  addMediaLike(publicationId: string, mediaId: string): Promise<Publication>;
  removeMediaLike(publicationId: string, mediaId: string): Promise<Publication>;
  updatePublication(
    publicationId: string,
    patch: {
      title?: string | null;
      text?: string | null;
      event_date?: string;
      event_date_approximate?: boolean;
      place?: string | null;
      topic_tag?: string;
      add_media_keys?: string[];
      remove_media_ids?: string[];
    },
  ): Promise<Publication>;
  deletePublication(publicationId: string): Promise<{ deleted: true }>;
}

export interface FamilyMemberCreateBody {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  birth_date: string;
  death_date?: string | null;
  city?: string | null;
  about?: string | null;
}

export interface FamilyApi {
  listMembers(): Promise<FamilyMember[]>;
  getMember(id: string): Promise<FamilyMember | null>;
  createMember(body: FamilyMemberCreateBody): Promise<FamilyMember>;
  updateMember(memberId: string, patch: Partial<FamilyMember>): Promise<FamilyMember>;
  transferMember(memberId: string, toMemberId: string): Promise<FamilyMember>;
  deleteMember(memberId: string): Promise<{ deleted: true }>;
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
  registerUploadedUrl?(key: string, url: string): void;
}

export interface MessagesApi {
  listWith(memberId: string): Promise<Message[]>;
  sendTo(memberId: string, text: string): Promise<Message>;
}

export interface ContactRequestsApi {
  getStateWith(memberId: string): Promise<ContactRequestState>;
  createWith(memberId: string): Promise<ContactRequestState>;
  listIncoming(): Promise<ContactRequest[]>;
  accept(requestId: string): Promise<ContactRequestState>;
  reject(requestId: string): Promise<ContactRequestState>;
}

export interface DebugApi {
  seedReference(): Promise<{ ok: boolean }>;
}

export interface AngeloApi {
  feed: FeedApi;
  family: FamilyApi;
  auth: AuthApi;
  profile: ProfileApi;
  media: MediaApi;
  messages: MessagesApi;
  contactRequests: ContactRequestsApi;
  debug?: DebugApi;
}

