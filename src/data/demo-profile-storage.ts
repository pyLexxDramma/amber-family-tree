/**
 * В демо: сохранённые правки профиля текущего пользователя (имя, ник, город, о себе).
 * Хранится в localStorage, чтобы после «Редактировать» изменения отображались.
 */

import type { FamilyMember } from '@/types';
import { getCurrentUser } from '@/data/mock-members';

const STORAGE_KEY = 'angelo-demo-my-profile';

export type DemoProfilePatch = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nickname?: string;
  birthDate?: string;
  city?: string;
  about?: string;
};

type StoredDemoProfilePatch = DemoProfilePatch & {
  memberId?: string;
};

export function getDemoProfilePatch(): DemoProfilePatch | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDemoProfilePatch;
    const current = getCurrentUser();
    if (parsed.memberId && parsed.memberId !== current.id) return null;
    if (!parsed.memberId) return null;
    const { memberId: _memberId, ...patch } = parsed;
    return patch;
  } catch {
    return null;
  }
}

export function setDemoProfilePatch(patch: DemoProfilePatch): void {
  if (typeof localStorage === 'undefined') return;
  const current = getCurrentUser();
  const next: StoredDemoProfilePatch = { ...patch, memberId: current.id };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Текущий пользователь с учётом демо-правок (для отображения на «О себе» / Профиль). */
export function getCurrentUserForDisplay(): FamilyMember {
  const base = getCurrentUser();
  const patch = getDemoProfilePatch();
  if (!patch) return base;
  return {
    ...base,
    firstName: patch.firstName ?? base.firstName,
    lastName: patch.lastName ?? base.lastName,
    middleName: patch.middleName ?? base.middleName,
    nickname: patch.nickname ?? base.nickname,
    birthDate: patch.birthDate ?? base.birthDate,
    city: patch.city ?? base.city,
    about: patch.about ?? base.about,
  };
}
