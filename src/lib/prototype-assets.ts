const BASE = `${import.meta.env.BASE_URL || '/'}prototype`.replace(/\/+/g, '/');

export const prototypeScreens = {
  family: `${BASE}/family.jpeg`,
  feed: `${BASE}/feed.jpeg`,
  publication: `${BASE}/publication.jpeg`,
};

type AvatarEntry = { src: string; objectPosition?: string };

const AVATAR_ENTRIES: AvatarEntry[] = [
  { src: `${BASE}/avatars/avatar-man-elderly.png` },
  { src: `${BASE}/avatars/avatar-woman-elderly.png` },
  { src: `${BASE}/avatars/avatar-man-dad.png` },
  { src: `${BASE}/avatars/avatar-woman-mom.png` },
  { src: `${BASE}/avatars/avatar-woman-young.png` },
  { src: `${BASE}/avatars/avatar-man-beard-glasses.png` },
];

import type { FamilyMember } from '@/types';
import { getAvatarIndexForMember } from '@/lib/family-role';
import { getMember } from '@/data/mock-members';

export function getPrototypeAvatarUrl(memberId: string, currentUserId?: string): string {
  if (currentUserId) {
    const member = getMember(memberId);
    if (member) return AVATAR_ENTRIES[getAvatarIndexForMember(member, currentUserId)].src;
  }
  const num = parseInt((memberId || 'm1').replace(/\D/g, '') || '1', 10);
  return AVATAR_ENTRIES[(num - 1) % AVATAR_ENTRIES.length].src;
}

export function getPrototypeAvatar(memberId: string, currentUserId?: string): AvatarEntry {
  if (currentUserId) {
    const member = getMember(memberId);
    if (member) return AVATAR_ENTRIES[getAvatarIndexForMember(member, currentUserId)];
  }
  const num = parseInt((memberId || 'm1').replace(/\D/g, '') || '1', 10);
  return AVATAR_ENTRIES[(num - 1) % AVATAR_ENTRIES.length];
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getPrototypeAvatarForMember(member: FamilyMember, currentUserId: string): AvatarEntry {
  const roleIndex = getAvatarIndexForMember(member, currentUserId);
  const spread = hashId(member.id) % AVATAR_ENTRIES.length;
  const idx = (roleIndex + spread) % AVATAR_ENTRIES.length;
  return AVATAR_ENTRIES[idx];
}

export function getPrototypePublicationPhoto(): { src: string; objectPosition: string } {
  return { src: prototypeScreens.publication, objectPosition: 'center 55%' };
}

const PUB_PHOTOS: Record<string, string> = {
  'День рождения': `${BASE}/pub-birthday.png`,
  'Праздники': `${BASE}/pub-family-old.png`,
  'Свадьба': `${BASE}/pub-family-old.png`,
  'Истории': `${BASE}/pub-family-old.png`,
  'Будни': `${BASE}/pub-village.png`,
  'Путешествия': `${BASE}/pub-village.png`,
  'Рецепты': `${BASE}/pub-village.png`,
  'Детство': `${BASE}/pub-birthday.png`,
};

const DEMO_MEDIA_PHOTOS = ['photo1.jpg', 'photo2.png', 'photo3.png', 'photo4.png', 'photo5.png', 'photo6.png', 'photo7.png'];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getPrototypePublicationPhotoByTopic(topicTag: string): { src: string; objectPosition: string } {
  const src = PUB_PHOTOS[topicTag] || `${BASE}/pub-family-old.png`;
  return { src, objectPosition: 'center center' };
}

export function getPrototypeFeedPostPhotoByTopic(topicTag: string): { src: string; objectPosition: string } {
  return getPrototypePublicationPhotoByTopic(topicTag);
}

export function getPrototypePublicationPhotoBySeed(pubId: string, index: number): { src: string; objectPosition: string } {
  const n = hashStr(`${pubId}-${index}`) % DEMO_MEDIA_PHOTOS.length;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+/g, '/');
  const src = `${base}demo/media/${DEMO_MEDIA_PHOTOS[n]}`;
  return { src, objectPosition: 'center center' };
}

export function getPrototypeAuthorAvatar(): AvatarEntry {
  return AVATAR_ENTRIES[5];
}

export function getPrototypeFamilyAvatar(index: number): AvatarEntry {
  return AVATAR_ENTRIES[index % AVATAR_ENTRIES.length];
}

export function getPrototypeAvatarEntryByIndex(index: number): AvatarEntry {
  return AVATAR_ENTRIES[Math.max(0, index % AVATAR_ENTRIES.length)];
}

export function getPrototypeCommentAvatar(): AvatarEntry {
  return AVATAR_ENTRIES[2];
}

export function getPrototypeParticipantAvatar(index: number): AvatarEntry {
  return AVATAR_ENTRIES[index % AVATAR_ENTRIES.length];
}

export function getPrototypeTreeHeroUrl(): string {
  return `${BASE}/tree-hero.png`;
}
