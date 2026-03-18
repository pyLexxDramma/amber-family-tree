type NicknamesMap = Record<string, string>;
type ProfileExtras = { phone?: string; email?: string };

const keyNick = (viewerMemberId: string) => `angelo-nicknames:${viewerMemberId}`;
const keyExtras = (viewerMemberId: string) => `angelo-profile-extras:${viewerMemberId}`;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getLocalNickname(viewerMemberId: string, targetMemberId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  const map = safeParse<NicknamesMap>(localStorage.getItem(keyNick(viewerMemberId))) ?? {};
  const v = map[targetMemberId];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function setLocalNickname(viewerMemberId: string, targetMemberId: string, nickname: string | null): void {
  if (typeof localStorage === 'undefined') return;
  const map = safeParse<NicknamesMap>(localStorage.getItem(keyNick(viewerMemberId))) ?? {};
  if (!nickname || !nickname.trim()) delete map[targetMemberId];
  else map[targetMemberId] = nickname.trim();
  localStorage.setItem(keyNick(viewerMemberId), JSON.stringify(map));
}

export function getProfileExtras(viewerMemberId: string): ProfileExtras {
  if (typeof localStorage === 'undefined') return {};
  const v = safeParse<ProfileExtras>(localStorage.getItem(keyExtras(viewerMemberId)));
  return v && typeof v === 'object' ? v : {};
}

export function setProfileExtras(viewerMemberId: string, extras: ProfileExtras): void {
  if (typeof localStorage === 'undefined') return;
  const next: ProfileExtras = {
    phone: extras.phone?.trim() || undefined,
    email: extras.email?.trim() || undefined,
  };
  localStorage.setItem(keyExtras(viewerMemberId), JSON.stringify(next));
}

