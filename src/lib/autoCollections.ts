import type { Publication } from '@/types';

export type AlbumDef = {
  id: string;
  title: string;
  match: (p: Publication) => boolean;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export function defaultAlbumDefs(): AlbumDef[] {
  return [
    { id: 'sochi', title: 'Лето в Сочи', match: (p) => (p.place || '').toLowerCase().includes('сочи') },
    { id: 'new-year', title: 'Новый год', match: (p) => (p.title || '').toLowerCase().includes('новый') },
    { id: 'school', title: 'Школьные годы', match: (p) => (p.title || '').toLowerCase().includes('гордость') },
    { id: 'holidays', title: 'Семейные праздники', match: (p) => p.topicTag === 'Праздники' || p.topicTag === 'День рождения' },
    { id: 'nature', title: 'Дача и природа', match: (p) => (p.title || '').toLowerCase().includes('волге') || (p.text || '').toLowerCase().includes('дач') },
    { id: 'travel', title: 'Наши путешествия', match: (p) => p.topicTag === 'Путешествия' },
  ];
}

export function buildAutoAlbumDefs(pubs: Publication[]): AlbumDef[] {
  const byTopic = new Map<string, Publication[]>();
  for (const p of pubs) {
    const k = (p.topicTag || '').trim();
    if (!k) continue;
    if (!byTopic.has(k)) byTopic.set(k, []);
    byTopic.get(k)!.push(p);
  }

  const sortedTopics = Array.from(byTopic.entries())
    .map(([topic, items]) => ({ topic, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return sortedTopics.map(({ topic }) => ({
    id: `auto-topic-${slug(topic)}`,
    title: `Авто: ${topic}`,
    match: (p: Publication) => (p.topicTag || '').trim() === topic,
  }));
}

export function allAlbumDefs(pubs: Publication[], includeAuto: boolean): AlbumDef[] {
  if (!includeAuto) return defaultAlbumDefs();
  const fixed = defaultAlbumDefs();
  const auto = buildAutoAlbumDefs(pubs);
  const used = new Set(fixed.map((d) => d.id));
  return [...fixed, ...auto.filter((a) => !used.has(a.id))];
}
