import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import { getPrototypePublicationPhotoBySeed } from '@/lib/prototype-assets';
import { Search, Heart, MessageCircle, LineChart, Filter, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { FamilyMember, Publication } from '@/types';
import { toast } from '@/hooks/use-toast';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string } | null) =>
  m ? `${m.firstName ?? m.first_name ?? ''} ${m.lastName ?? m.last_name ?? ''}`.trim() || 'Автор' : 'Автор';
const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

type ViewMode = 'media' | 'posts';
type SortOrder = 'new' | 'old';

type MediaTile = { pubId: string; mediaId: string; url: string; thumbnail?: string };

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const authorParam = searchParams.get('author');
  const withParam = searchParams.get('with');
  const viewParam = searchParams.get('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [items, setItems] = useState<Publication[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('media');
  const [sortOrder, setSortOrder] = useState<SortOrder>('new');
  const [gridCols, setGridCols] = useState<1 | 3 | 5>(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [seedLoading, setSeedLoading] = useState(false);

  const loadData = async (autoSeed = true) => {
    const [pubs, mems] = await Promise.all([
      api.feed.list(),
      api.family.listMembers(),
    ]);
    setItems(pubs);
    setMembers(mems);
    api.profile.getMyProfile().then(me => setMyMemberId(me.id)).catch(() => {});

    if (autoSeed && !isDemoMode() && api.debug && pubs.length === 0) {
      setSeedLoading(true);
      try {
        await api.debug.seedReference();
        const [newPubs, newMems] = await Promise.all([
          api.feed.list(),
          api.family.listMembers(),
        ]);
        setItems(newPubs);
        setMembers(newMems);
      } catch {
      } finally {
        setSeedLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (viewParam === 'media' || viewParam === 'posts') setViewMode(viewParam);
  }, [viewParam]);

  const handleSeedReference = async () => {
    if (!api.debug) return;
    setSeedLoading(true);
    try {
      await api.debug.seedReference();
      await loadData(false);
      toast({ title: 'Тестовые данные загружены. Обновите страницу, если не видите изменения.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: 'Ошибка: ' + msg, variant: 'destructive' });
    } finally {
      setSeedLoading(false);
    }
  };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const currentId = myMemberId ?? currentUserId;

  let filtered = [...items];
  if (filterParam === 'my') filtered = filtered.filter(p => authorIdOf(p) === currentId);
  if (filterParam === 'with-me') filtered = filtered.filter(p => participantIdsOf(p).includes(currentId));
  if (authorParam) filtered = filtered.filter(p => authorIdOf(p) === authorParam);
  if (withParam) filtered = filtered.filter(p => participantIdsOf(p).includes(withParam));
  const list = searchQuery.trim()
    ? filtered.filter(p => (p.title || p.text).toLowerCase().includes(searchQuery.toLowerCase()))
    : filtered;

  const sorted = [...list].sort((a, b) => {
    const da = publishDateOf(a) || '';
    const db = publishDateOf(b) || '';
    return sortOrder === 'new' ? db.localeCompare(da) : da.localeCompare(db);
  });

  const mediaTiles: MediaTile[] = sorted.flatMap((p) =>
    (p.media ?? [])
      .filter(m => m.type === 'photo')
      .map(m => ({
        pubId: p.id,
        mediaId: m.id,
        url: (m as { thumbnail?: string }).thumbnail || m.url || '',
        thumbnail: (m as { thumbnail?: string }).thumbnail,
      }))
      .filter(x => !!x.url)
  );

  const mediaTilesWithDemo = mediaTiles.length > 0
    ? mediaTiles
    : sorted.slice(0, 12).map((p, i) => ({
        pubId: p.id,
        mediaId: `demo-${p.id}-${i}`,
        url: getPrototypePublicationPhotoBySeed(p.id, i).src,
        thumbnail: undefined as string | undefined,
      }));

  const monthLabel = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    const month = d.toLocaleString('ru-RU', { month: 'long' });
    const cap = month.charAt(0).toUpperCase() + month.slice(1);
    return `${cap} ${d.getFullYear()}`;
  };

  const groups = new Map<string, Publication[]>();
  for (const p of sorted) {
    const basis = publishDateOf(p) || eventDateOf(p) || '';
    const key = basis.slice(0, 7) || '0000-00';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const groupKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

  const memories = [...sorted]
    .sort((a, b) => (eventDateOf(b) || '').localeCompare(eventDateOf(a) || ''))
    .slice(0, 3)
    .map((p) => {
      const e = eventDateOf(p) || '';
      const y = e ? parseInt(e.slice(0, 4), 10) : new Date().getFullYear();
      const yearsAgo = Math.max(1, new Date().getFullYear() - (Number.isFinite(y) ? y : new Date().getFullYear()));
      return { id: p.id, title: p.title || 'Воспоминание', yearsAgo };
    });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(mediaTilesWithDemo.map(t => t.mediaId)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const setFilter = (value: string | null) => {
    if (!value) {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', value);
    }
    setSearchParams(searchParams);
    setFiltersOpen(false);
  };

  const gridClass = gridCols === 1 ? 'grid-cols-1' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-5';

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[#F5F0E8]">
        <div className="mx-auto max-w-full px-4 pt-4 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-semibold text-[var(--proto-text)]">Лента</h1>
              {items.length > 50 && <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">Демо · {items.length} публикаций</p>}
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
              <button
                type="button"
                onClick={() => setSelectionMode(v => !v)}
                className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors ${
                  selectionMode ? 'bg-[var(--proto-active)] text-white border-[var(--proto-active)]' : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text-muted)] hover:border-[var(--proto-active)]/40'
                }`}
                aria-label="Режим выбора"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <BrandLogoCircle className="h-10 w-10 bg-[var(--proto-card)] border-[var(--proto-border)]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('media')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'media' ? 'bg-[var(--proto-active)] text-white' : 'text-[var(--proto-text-muted)] hover:text-[var(--proto-text)]'}`}
              >
                Лента
              </button>
              <button
                type="button"
                onClick={() => setViewMode('posts')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'posts' ? 'bg-[var(--proto-active)] text-white' : 'text-[var(--proto-text-muted)] hover:text-[var(--proto-text)]'}`}
              >
                Посты
              </button>
            </div>
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <button
                type="button"
                onClick={() => setSortOrder(s => s === 'new' ? 'old' : 'new')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-sm font-medium text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
              >
                {sortOrder === 'new' ? 'Сначала новые' : 'Сначала старые'}
                <ChevronDown className={`h-4 w-4 transition-transform ${sortOrder === 'old' ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  filterParam ? 'bg-[var(--proto-active)] text-white border-[var(--proto-active)]' : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40'
                }`}
              >
                <Filter className="h-4 w-4" />
                Фильтры
              </button>
              {api.debug && (
                <button
                  type="button"
                  onClick={handleSeedReference}
                  disabled={seedLoading}
                  className="px-3 py-1.5 rounded-full border border-[var(--proto-border)] text-sm font-medium text-[var(--proto-active)] hover:border-[var(--proto-active)]/40 disabled:opacity-60"
                >
                  {seedLoading ? 'Заполняем…' : 'Заполнить тестовые данные'}
                </button>
              )}
            </div>
          </div>

          {viewMode === 'media' && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[var(--proto-text-muted)]">Сетка:</span>
              {([1, 3, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGridCols(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    gridCols === n ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text-muted)] hover:border-[var(--proto-active)]/40'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

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

          {selectionMode && selectedIds.size > 0 && (
            <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)]">
              <span className="text-sm font-medium text-[var(--proto-text)]">Выбрано: {selectedIds.size}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm font-medium text-[var(--proto-active)] hover:underline"
                >
                  Выбрать все
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm font-medium text-[var(--proto-text-muted)] hover:underline"
                >
                  Снять
                </button>
              </div>
            </div>
          )}

          {viewMode === 'media' ? (
            <div className={`grid ${gridClass} gap-2 sm:gap-3`}>
              {mediaTilesWithDemo.map((t) => (
                <button
                  key={t.mediaId}
                  type="button"
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelect(t.mediaId);
                    } else {
                      navigate(ROUTES.classic.publication(t.pubId));
                    }
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-[var(--proto-border)] hover:opacity-95 transition-opacity ${
                    selectionMode && selectedIds.has(t.mediaId) ? 'ring-2 ring-[var(--proto-active)] ring-offset-2 ring-offset-[#F5F0E8]' : ''
                  }`}
                >
                  <img src={t.thumbnail || t.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  {selectionMode && (
                    <div className="absolute top-2 right-2">
                      {selectedIds.has(t.mediaId) ? (
                        <CheckSquare className="h-6 w-6 text-white drop-shadow-md fill-[var(--proto-active)]" />
                      ) : (
                        <Square className="h-6 w-6 text-white drop-shadow-md" />
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <>
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
                            || getPrototypePublicationPhotoBySeed(pub.id, 0).src;
                          const photosCount = pub.media.filter(m => m.type === 'photo').length;
                          const aid = authorIdOf(pub);
                          const author = aid ? (memberMap.get(aid) ?? null) : null;
                          return (
                            <button
                              key={pub.id}
                              type="button"
                              onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                              className="w-full rounded-3xl bg-white border border-[var(--proto-border)] overflow-hidden text-left hover:border-[var(--proto-active)]/40 transition-colors"
                            >
                              <div className="relative aspect-[4/3] bg-[var(--proto-border)]">
                                {coverSrc ? (
                                  <img src={coverSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoBySeed(pub.id, 0).src; }} />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#F0EDE8] to-[#E5E1DC]" />
                                )}
                                {photosCount > 1 && (
                                  <div className="absolute top-2 right-2 rounded-full bg-black/55 text-white text-xs font-semibold px-2.5 py-1">
                                    1/{photosCount}
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="text-sm font-semibold text-[var(--proto-text)]">{memberDisplayName(author)}</p>
                                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{eventDateOf(pub)}</p>
                                <div className="flex items-center gap-4 text-sm text-[var(--proto-text-muted)] mt-3">
                                  <span className="inline-flex items-center gap-1">
                                    <Heart className="h-4 w-4" />
                                    {(pub.likes ?? []).length}
                                  </span>
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
            </>
          )}

          {(viewMode === 'media' ? mediaTilesWithDemo.length === 0 : list.length === 0) && (
            <div className="text-center py-12">
              <p className="text-[var(--proto-text-muted)] text-sm mb-4">
                {searchQuery.trim() ? 'Ничего не найдено' : viewMode === 'media' ? 'Нет фото' : 'Нет публикаций'}
              </p>
              {!searchQuery.trim() && !isDemoMode() && api.debug && (
                <button
                  type="button"
                  onClick={handleSeedReference}
                  disabled={seedLoading}
                  className="text-sm font-medium text-[var(--proto-active)] hover:underline disabled:opacity-60"
                >
                  {seedLoading ? 'Заполняем…' : 'Заполнить тестовые данные'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[var(--proto-bg)] border-[var(--proto-border)]">
          <SheetHeader>
            <SheetTitle className="text-[var(--proto-text)]">Фильтры</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setFilter(null)}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${!filterParam ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'}`}
            >
              Все публикации
            </button>
            <button
              type="button"
              onClick={() => setFilter('my')}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${filterParam === 'my' ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'}`}
            >
              Только мои
            </button>
            <button
              type="button"
              onClick={() => setFilter('with-me')}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${filterParam === 'with-me' ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'}`}
            >
              С моим участием
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Feed;
