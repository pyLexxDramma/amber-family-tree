import { getMember, mockMembers } from '@/data/mock-members';
import type { FamilyMember } from '@/types';

function isFemale(member: { lastName: string }): boolean {
  const ln = member.lastName;
  return ln.endsWith('а') || ln.endsWith('я') || ln.endsWith('ова') || ln.endsWith('ева') || ln.endsWith('ина');
}

export type FamilyRole =
  | 'Дедушка'
  | 'Бабушка'
  | 'Папа'
  | 'Мама'
  | 'Сын'
  | 'Дочь'
  | 'Брат'
  | 'Сестра'
  | 'Дядя'
  | 'Тётя'
  | 'Внук'
  | 'Внучка'
  | 'Племянник'
  | 'Племянница'
  | 'Двоюродный брат'
  | 'Двоюродная сестра'
  | 'Супруг'
  | 'Супруга'
  | 'Член семьи';

function getCurrentParentIds(currentUserId: string): string[] {
  return getMember(currentUserId)?.relations.filter(r => r.type === 'parent').map(r => r.memberId) ?? [];
}

function getGrandparentIds(currentUserId: string): string[] {
  const parentIds = getCurrentParentIds(currentUserId);
  const ids: string[] = [];
  parentIds.forEach(pid => {
    (getMember(pid)?.relations.filter(r => r.type === 'parent').map(r => r.memberId) ?? []).forEach(gid => { if (!ids.includes(gid)) ids.push(gid); });
  });
  return ids;
}

function getSiblingIds(currentUserId: string): string[] {
  const currentParentIds = getCurrentParentIds(currentUserId);
  return mockMembers
    .filter(m => m.id !== currentUserId && m.relations.some(r => r.type === 'parent' && currentParentIds.includes(r.memberId)))
    .map(m => m.id);
}

function getUncleAuntIds(currentUserId: string): string[] {
  const currentParentIds = getCurrentParentIds(currentUserId);
  const grandparentIds = getGrandparentIds(currentUserId);
  const parentSiblings = mockMembers.filter(
    m => !currentParentIds.includes(m.id) && m.relations.some(r => r.type === 'parent' && grandparentIds.includes(r.memberId))
  ).map(m => m.id);
  const grandparentSiblings = mockMembers.filter(
    m => m.relations.some(r => r.type === 'sibling' && grandparentIds.includes(r.memberId))
  ).map(m => m.id);
  return [...new Set([...parentSiblings, ...grandparentSiblings])];
}

function roleFromNicknameAbout(member: FamilyMember): FamilyRole | null {
  const n = (member.nickname || '').trim();
  const about = (member.about || '').trim();
  if (n.startsWith('Дядя')) return 'Дядя';
  if (n.startsWith('Тётя')) return 'Тётя';
  if (about.includes('Двоюродная сестра')) return 'Двоюродная сестра';
  if (about.includes('Двоюродный брат')) return 'Двоюродный брат';
  if (about.includes('Племянница')) return 'Племянница';
  if (about.includes('Племянник')) return 'Племянник';
  if (about.includes('Брат ') || about.startsWith('Брат.')) return 'Брат';
  if (about.includes('Сестра ') || about.startsWith('Сестра.')) return 'Сестра';
  return null;
}

export function getFamilyRole(member: FamilyMember, currentUserId: string): FamilyRole {
  const n = (member.nickname || '').trim();
  if (n.startsWith('Дедушка')) return 'Дедушка';
  if (n.startsWith('Бабушка')) return 'Бабушка';
  if (n === 'Папа') return 'Папа';
  if (n === 'Мама') return 'Мама';

  const fromNickname = roleFromNicknameAbout(member);
  if (fromNickname) return fromNickname;

  const rel = member.relations.find(r => r.memberId === currentUserId);
  const currentParentIds = getCurrentParentIds(currentUserId);
  const grandparentIds = getGrandparentIds(currentUserId);
  const siblingIds = getSiblingIds(currentUserId);
  const uncleAuntIds = getUncleAuntIds(currentUserId);
  const female = isFemale(member);

  if (rel?.type === 'child') return female ? 'Мама' : 'Папа';
  if (rel?.type === 'parent') return female ? 'Дочь' : 'Сын';
  if (rel?.type === 'spouse') return female ? 'Супруга' : 'Супруг';
  if (rel?.type === 'sibling') return female ? 'Сестра' : 'Брат';

  const isGrandparent = member.relations.some(r => r.type === 'child' && currentParentIds.includes(r.memberId));
  if (isGrandparent) return female ? 'Бабушка' : 'Дедушка';

  const isUncleAunt = (member.relations.some(r => r.type === 'parent' && grandparentIds.includes(r.memberId)) && !currentParentIds.includes(member.id))
    || member.relations.some(r => r.type === 'sibling' && grandparentIds.includes(r.memberId));
  if (isUncleAunt) return female ? 'Тётя' : 'Дядя';

  const isUncleAuntSpouse = member.relations.some(r => r.type === 'spouse' && uncleAuntIds.includes(r.memberId));
  if (isUncleAuntSpouse) return female ? 'Тётя' : 'Дядя';

  const isSibling = member.id !== currentUserId && member.relations.some(r => r.type === 'parent' && currentParentIds.includes(r.memberId));
  if (isSibling) return female ? 'Сестра' : 'Брат';

  const isNephewNiece = member.relations.some(r => r.type === 'parent' && siblingIds.includes(r.memberId));
  if (isNephewNiece) return female ? 'Племянница' : 'Племянник';

  const isCousin = member.relations.some(r => r.type === 'parent' && uncleAuntIds.includes(r.memberId));
  if (isCousin) return female ? 'Двоюродная сестра' : 'Двоюродный брат';

  if (rel?.type === 'grandchild') return female ? 'Внучка' : 'Внук';

  if (member.generation === 1) return female ? 'Бабушка' : 'Дедушка';

  return 'Член семьи';
}

export const AVATAR_INDEX = {
  grandpa: 0,
  grandma: 1,
  dad: 2,
  mom: 3,
  womanYoung: 4,
  man: 5,
} as const;

export function getAvatarIndexForMember(member: FamilyMember, currentUserId: string): number {
  const role = getFamilyRole(member, currentUserId);
  const female = isFemale(member);

  switch (role) {
    case 'Дедушка': return AVATAR_INDEX.grandpa;
    case 'Бабушка': return AVATAR_INDEX.grandma;
    case 'Папа': return AVATAR_INDEX.dad;
    case 'Мама': return AVATAR_INDEX.mom;
    case 'Дочь':
    case 'Сестра':
    case 'Внучка':
    case 'Тётя':
    case 'Супруга':
    case 'Племянница':
    case 'Двоюродная сестра': return AVATAR_INDEX.womanYoung;
    case 'Сын':
    case 'Брат':
    case 'Внук':
    case 'Дядя':
    case 'Супруг':
    case 'Племянник':
    case 'Двоюродный брат': return AVATAR_INDEX.man;
    default: return female ? AVATAR_INDEX.womanYoung : AVATAR_INDEX.man;
  }
}
