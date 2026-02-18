export type UserRole = 'admin' | 'member';
export type RelationType = 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'uncle' | 'aunt' | 'cousin' | 'other';
export type MediaType = 'photo' | 'video' | 'audio' | 'document';
export type PublicationType = 'photo' | 'video' | 'audio' | 'document' | 'text';
export type InvitationStatus = 'sent' | 'accepted' | 'rejected' | 'expired';

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  nickname?: string;
  birthDate: string;
  city?: string;
  about?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  generation: number;
  relations: { memberId: string; type: RelationType }[];
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  name: string;
  size: number; // bytes
  duration?: number; // seconds for audio/video
  width?: number;
  height?: number;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  type: PublicationType;
  authorId: string;
  coAuthorIds: string[];
  title?: string;
  text: string;
  eventDate: string;
  eventDateApproximate?: boolean;
  place?: string;
  publishDate: string;
  media: MediaItem[];
  participantIds: string[];
  topicTag: string;
  likes: string[]; // userIds
  comments: Comment[];
  isRead: boolean;
  visibleFor?: string[];
  excludeFor?: string[];
}

export interface Invitation {
  id: string;
  fromId: string;
  toPhone?: string;
  toEmail?: string;
  link: string;
  status: InvitationStatus;
  createdAt: string;
}

export interface TreeNode {
  memberId: string;
  x: number;
  y: number;
  connections: string[]; // memberIds
}

export interface FamilyTree {
  nodes: TreeNode[];
  rootId: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxPlaces: number;
  features: string[];
}

export interface Subscription {
  planId: string;
  usedPlaces: number;
  expiresAt: string;
}

export interface AppUser {
  id: string;
  member: FamilyMember;
  subscription: Subscription;
}
