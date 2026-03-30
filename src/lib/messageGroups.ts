import type { FamilyMember } from '@/types';

export type MessageGroup = {
  id: string;
  title: string;
  memberIds: string[];
};

export function buildMessageGroups(members: FamilyMember[], myId: string | null): MessageGroup[] {
  if (!myId) return [];
  const me = members.find((m) => m.id === myId);
  const others = members.filter((m) => m.id !== myId);
  if (!others.length) return [];

  const closeFamilyIds = new Set<string>();
  for (const rel of me?.relations ?? []) {
    if (['parent', 'child', 'spouse', 'sibling'].includes(rel.type)) closeFamilyIds.add(rel.memberId);
  }

  const older = me ? others.filter((m) => m.generation < me.generation).map((m) => m.id) : [];
  const younger = me ? others.filter((m) => m.generation > me.generation).map((m) => m.id) : [];
  const closeFamily = others.filter((m) => closeFamilyIds.has(m.id)).map((m) => m.id);

  const groups: MessageGroup[] = [
    { id: 'all-family', title: 'Вся семья', memberIds: others.map((m) => m.id) },
    { id: 'close-family', title: 'Близкие родные', memberIds: closeFamily },
    { id: 'older-family', title: 'Старшее поколение', memberIds: older },
    { id: 'younger-family', title: 'Младшее поколение', memberIds: younger },
  ];

  return groups.filter((g) => g.memberIds.length > 0);
}
