const KEY = 'angelo:milestones';

export function getMilestoneIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => typeof x === 'string');
  } catch {
    return [];
  }
}

export function setMilestoneIds(ids: string[]): void {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  localStorage.setItem(KEY, JSON.stringify(uniq));
  window.dispatchEvent(new Event('angelo:milestones-changed'));
}

export function isMilestone(id: string): boolean {
  return getMilestoneIds().includes(id);
}

export function toggleMilestone(id: string): boolean {
  const cur = new Set(getMilestoneIds());
  if (cur.has(id)) cur.delete(id);
  else cur.add(id);
  setMilestoneIds(Array.from(cur));
  return cur.has(id);
}

