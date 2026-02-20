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
  city?: string;
  about?: string;
};

export function getDemoProfilePatch(): DemoProfilePatch | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoProfilePatch;
  } catch {
    return null;
  }
}

export function setDemoProfilePatch(patch: DemoProfilePatch): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patch));
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
    city: patch.city ?? base.city,
    about: patch.about ?? base.about,
  };
}
