import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import {
  getPrototypeFeedPostPhotoByTopic,
} from '@/lib/prototype-assets';
import { Search, MessageCircle, LineChart } from 'lucide-react';
import type { FamilyMember, Publication } from '@/types';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string } | null) =>
  m ? `${m.firstName ?? m.first_name ?? ''} ${m.lastName ?? m.last_name ?? ''}`.trim() || 'Автор' : 'Автор';
const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [items, setItems] = useState<Publication[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);

  useEffect(() => {
    api.feed.list().then(setItems);
    api.family.listMembers().then(setMembers);
    api.profile.getMyProfile().then(me => setMyMemberId(me.id)).catch(() => {});
  }, []);

  const memberMap = new Map(members.map(m => [m.id, m]));
  const currentId = myMemberId ?? currentUserId;

  const sorted = [...items].sort((a, b) => (publishDateOf(b) || '').localeCompare(publishDateOf(a) || ''));
  let filtered = sorted;
  if (filterParam === 'my') filtered = filtered.filter(p => authorIdOf(p) === currentId);
  if (filterParam === 'with-me') filtered = filtered.filter(p => participantIdsOf(p).includes(currentId));
  const list = searchQuery.trim()
    ? filtered.filter(p => (p.title || p.text).toLowerCase().includes(searchQuery.toLowerCase()))
    : filtered;

  const monthLabel = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    const month = d.toLocaleString('ru-RU', { month: 'long' });
    const cap = month.charAt(0).toUpperCase() + month.slice(1);
    return `${cap} ${d.getFullYear()}`;
  };


  const groups = new Map<string, Publication[]>();
  for (const p of list) {
    const basis = publishDateOf(p) || eventDateOf(p) || '';
    const key = basis.slice(0, 7) || '0000-00';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const groupKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  const memories = [...list]
    .sort((a, b) => (eventDateOf(b) || '').localeCompare(eventDateOf(a) || ''))
    .slice(0, 3)
    .map((p) => {
      const e = eventDateOf(p) || '';
      const y = e ? parseInt(e.slice(0, 4), 10) : new Date().getFullYear();
      const yearsAgo = Math.max(1, new Date().getFullYear() - (Number.isFinite(y) ? y : new Date().getFullYear()));
      return { id: p.id, title: p.title || 'Воспоминание', yearsAgo };
    });

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <div className="mx-auto max-w-full px-4 pt-4 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="tracking-[0.35em] text-[#A39B8A] font-semibold text-xl">ANGELO</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.timeline)}
                className="h-10 w-10 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] flex items-center justify-center text-[var(--proto-text-muted)] hover:border-[var(--proto-active)]/40 transition-colors"
                aria-label="Хроника"
              >
                <LineChart className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(v => !v)}
                className="h-10 w-10 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] flex items-center justify-center text-[var(--proto-text-muted)] hover:border-[var(--proto-active)]/40 transition-colors"
                aria-label="Поиск"
              >
                <Search className="h-4 w-4" />
              </button>
              <BrandLogoCircle className="h-10 w-10 bg-[var(--proto-card)] border-[var(--proto-border)]" />
            </div>
          </div>

          {searchOpen && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--proto-text-muted)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Найти публикацию..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] text-sm text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]/30 focus:border-[var(--proto-active)]"
                />
              </div>
            </div>
          )}

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[var(--proto-text)]">Воспоминания</p>
              <button type="button" onClick={() => navigate(ROUTES.classic.feed)} className="text-sm font-semibold text-[#A39B8A]">
                Все
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {memories.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(ROUTES.classic.publication(m.id))}
                  className="shrink-0 w-[160px] h-[92px] rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] px-3 py-3 text-left hover:border-[var(--proto-active)]/40 transition-colors"
                >
                  <p className="text-xs text-[var(--proto-text-muted)]">{m.yearsAgo} г. назад</p>
                  <p className="text-sm font-semibold text-[var(--proto-text)] mt-1 line-clamp-2">{m.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {groupKeys.map((key) => {
              const sectionItems = (groups.get(key) || []).sort((a, b) => (publishDateOf(b) || '').localeCompare(publishDateOf(a) || ''));
              const label = key !== '0000-00' ? monthLabel(`${key}-01`) : 'Публикации';
              return (
                <div key={key}>
                  <p className="text-lg font-semibold text-[var(--proto-text)] mb-3">{label}</p>
                  <div className="space-y-4">
                    {sectionItems.map((pub) => {
                      const coverSrc = pub.media.find(m => m.type === 'photo')?.url
                        || pub.media.find(m => (m as { thumbnail?: string }).thumbnail)?.thumbnail
                        || (isDemoMode() ? getPrototypeFeedPostPhotoByTopic(pub.topicTag).src : '');
                      const aid = authorIdOf(pub);
                      const author = aid ? (memberMap.get(aid) ?? null) : null;
                      return (
                        <button
                          key={pub.id}
                          type="button"
                          onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                          className="w-full rounded-3xl bg-white border border-[var(--proto-border)] overflow-hidden text-left hover:border-[var(--proto-active)]/40 transition-colors"
                        >
                          <div className="aspect-[4/3] bg-[var(--proto-border)]">
                            {coverSrc ? (
                              <img src={coverSrc} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#F0EDE8] to-[#E5E1DC]" />
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold text-[var(--proto-text)]">{memberDisplayName(author)}</p>
                            <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{eventDateOf(pub)}</p>
                            <div className="flex items-center gap-4 text-sm text-[var(--proto-text-muted)] mt-3">
                              <span className="inline-flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {(pub.comments ?? []).length}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--proto-text)] mt-3 line-clamp-2">
                              {pub.title ? `${pub.title} ` : ''}{pub.text}
                            </p>
                            {pub.place && (
                              <p className="text-xs text-[var(--proto-text-muted)] mt-2">📍 {pub.place}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {list.length === 0 && (
            <p className="text-center text-[var(--proto-text-muted)] text-sm py-12">
              {searchQuery.trim() ? 'Ничего не найдено' : 'Нет публикаций'}
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Feed;
