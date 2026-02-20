/**
 * Локальные демо-фото (public/demo/). Все картинки лежат в проекте — не зависят от picsum.photos.
 * На мобильном используем полный URL (origin), чтобы избежать проблем с кэшем и базой.
 */

const DEMO_PATH = '/demo';
const CACHE = '?v=1';

function demoBase(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin + DEMO_PATH;
  }
  return DEMO_PATH;
}

/** Аватар участника семьи: /demo/avatars/m1.jpg … m17.jpg */
export function getDemoMemberPhotoUrl(memberId: string): string {
  return `${demoBase()}/avatars/${memberId}.jpg${CACHE}`;
}

/** Фото для ленты/публикаций: /demo/feed/1.jpg … 32.jpg (цикл по индексу) */
export function getDemoFeedPhotoUrl(seedIndex: number): string {
  const n = ((Math.floor(seedIndex) - 1) % 32 + 32) % 32 + 1;
  return `${demoBase()}/feed/${n}.jpg${CACHE}`;
}

/** Фото публикации по seed типа angelo5 или vid2 */
export function getDemoPublicationMediaUrl(seed: string): string {
  const vidMatch = seed.match(/^vid(\d+)$/i);
  if (vidMatch) return getDemoFeedPhotoUrl(30 + parseInt(vidMatch[1], 10));
  const angeloMatch = seed.match(/^angelo(\d+)$/i);
  if (angeloMatch) return getDemoFeedPhotoUrl(parseInt(angeloMatch[1], 10));
  const num = parseInt(seed.replace(/\D/g, ''), 10) || 1;
  return getDemoFeedPhotoUrl(num);
}

/** Герой-картинка на странице дерева */
export function getDemoTreeHeroUrl(): string {
  return `${demoBase()}/tree-hero.jpg${CACHE}`;
}
