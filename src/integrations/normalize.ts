import type { AppUser, Comment, FamilyMember, MediaItem, Message, Publication } from '@/types';

type AnyRec = Record<string, any>;

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const optStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);
const bool = (v: unknown, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const arr = <T>(v: unknown, fallback: T[] = []) => (Array.isArray(v) ? v as T[] : fallback);

export function normalizeFamilyMember(input: unknown): FamilyMember {
  const m = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  const relationsIn = arr<any>(m.relations ?? m.relations_list ?? m.relation_list ?? []);
  const relations = relationsIn
    .map((r) => {
      if (!r || typeof r !== 'object') return null;
      const rr = r as AnyRec;
      const memberId = str(rr.memberId ?? rr.member_id ?? rr.relative_id ?? '');
      const type = str(rr.type ?? rr.relation_type ?? 'other');
      if (!memberId) return null;
      return { memberId, type } as any;
    })
    .filter(Boolean) as any;

  return {
    id: str(m.id),
    firstName: str(m.firstName ?? m.first_name),
    lastName: str(m.lastName ?? m.last_name),
    middleName: optStr(m.middleName ?? m.middle_name),
    nickname: optStr(m.nickname),
    birthDate: str(m.birthDate ?? m.birth_date),
    deathDate: optStr(m.deathDate ?? m.death_date),
    city: optStr(m.city),
    about: optStr(m.about),
    avatar: optStr(m.avatar),
    role: str(m.role ?? 'member') as any,
    isActive: bool(m.isActive ?? m.is_active ?? true, true),
    generation: typeof m.generation === 'number' ? m.generation : (typeof m.generation_level === 'number' ? m.generation_level : 0),
    relations,
    managedById: optStr(m.managedById ?? m.managed_by_id) ?? undefined,
  };
}

export function normalizeMediaItem(input: unknown): MediaItem {
  const m = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  return {
    id: str(m.id),
    type: str(m.type) as any,
    url: str(m.url ?? m.src ?? m.href),
    thumbnail: optStr(m.thumbnail ?? m.thumb),
    name: str(m.name ?? m.title ?? 'Файл'),
    size: typeof m.size === 'number' ? m.size : 0,
    duration: typeof m.duration === 'number' ? m.duration : undefined,
    width: typeof m.width === 'number' ? m.width : undefined,
    height: typeof m.height === 'number' ? m.height : undefined,
    eventDate: optStr(m.eventDate ?? m.event_date),
    year: optStr(m.year),
    category: optStr(m.category),
    publicationId: optStr(m.publicationId ?? m.publication_id),
  };
}

export function normalizeComment(input: unknown): Comment {
  const c = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  const likesRaw = arr<any>(c.likes ?? []);
  const likes = likesRaw
    .map((x) => (typeof x === 'string' ? x : str((x as AnyRec)?.memberId ?? (x as AnyRec)?.member_id ?? (x as AnyRec)?.id ?? '')))
    .filter(Boolean);
  return {
    id: str(c.id),
    authorId: str(c.authorId ?? c.author_id),
    text: str(c.text),
    createdAt: str(c.createdAt ?? c.created_at),
    likes,
  };
}

export function normalizePublication(input: unknown): Publication {
  const p = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  const likesRaw = arr<any>(p.likes ?? p.like_ids ?? []);
  const likes = likesRaw
    .map((x) => (typeof x === 'string' ? x : str((x as AnyRec)?.memberId ?? (x as AnyRec)?.member_id ?? (x as AnyRec)?.id ?? '')))
    .filter(Boolean);
  const commentsRaw = arr<any>(p.comments ?? p.comment_list ?? []);
  return {
    id: str(p.id),
    type: str(p.type ?? 'photo') as any,
    authorId: str(p.authorId ?? p.author_id),
    coAuthorIds: arr<string>(p.coAuthorIds ?? p.co_author_ids ?? []),
    title: optStr(p.title),
    text: str(p.text),
    eventDate: str(p.eventDate ?? p.event_date ?? (p.publishDate ?? p.publish_date ?? '').slice(0, 10)),
    eventDateApproximate: bool(p.eventDateApproximate ?? p.event_date_approximate, false),
    place: optStr(p.place),
    publishDate: str(p.publishDate ?? p.publish_date),
    media: arr<any>(p.media ?? p.media_items ?? []).map(normalizeMediaItem),
    participantIds: arr<string>(p.participantIds ?? p.participant_ids ?? []),
    topicTag: str(p.topicTag ?? p.topic_tag ?? ''),
    likes,
    comments: commentsRaw.map(normalizeComment),
    isRead: bool(p.isRead ?? p.is_read ?? true, true),
    visibleFor: arr<string>(p.visibleFor ?? p.visible_for, []),
    excludeFor: arr<string>(p.excludeFor ?? p.exclude_for, []),
    contentBlocks: (() => {
      const raw = p.contentBlocks ?? p.content_blocks;
      return Array.isArray(raw) && raw.length > 0 ? raw : undefined;
    })(),
  };
}

export function normalizeMessage(input: unknown): Message {
  const m = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  return {
    id: str(m.id),
    senderId: str(m.senderId ?? m.sender_id),
    recipientId: str(m.recipientId ?? m.recipient_id),
    text: str(m.text),
    createdAt: str(m.createdAt ?? m.created_at),
  };
}

export function normalizeAppUser(input: unknown): AppUser {
  const u = (input && typeof input === 'object' ? input as AnyRec : {}) as AnyRec;
  const sub = (u.subscription && typeof u.subscription === 'object' ? u.subscription as AnyRec : {}) as AnyRec;
  return {
    id: str(u.id),
    member: normalizeFamilyMember(u.member),
    subscription: {
      planId: str(sub.planId ?? sub.plan_id),
      usedPlaces: typeof sub.usedPlaces === 'number' ? sub.usedPlaces : (typeof sub.used_places === 'number' ? sub.used_places : 0),
      expiresAt: str(sub.expiresAt ?? sub.expires_at),
    },
  };
}

