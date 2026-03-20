import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import { getMilestoneIds } from '@/lib/milestones';
import { getPrototypePublicationPhotoBySeed } from '@/lib/prototype-assets';
import { Search, Heart, MessageCircle, LineChart, Filter, CheckSquare, Square, ChevronDown, Images } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { useAvatarFallback } from '@/lib/demoMode';
import type { FamilyMember, Publication } from '@/types';
import { toast } from '@/hooks/use-toast';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string } | null) =>
  m ? `${m.firstName ?? m.first_name ?? ''} ${m.lastName ?? m.last_name ?? ''}`.trim() || 'Автор' : 'Автор';
const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

type ViewMode = 'media' | 'posts';
type SortMode = 'event-new' | 'event-old' | 'publish-new';

type MediaTile = { pubId: string; mediaId: string; url: string; thumbnail?: string; photosCount?: number; likesCount?: number; myLikesCount?: number };

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const authorParam = searchParams.get('author');
  const withParam = searchParams.get('with');
  const tagParam = searchParams.get('tag');
  const placeParam = searchParams.get('place');
  const unreadParam = searchParams.get('unread');
  const viewParam = searchParams.get('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [items, setItems] = useState<Publication[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('media');
  const [sortMode, setSortMode] = useState<SortMode>('event-new');
  const [sortOpen, setSortOpen] = useState(false);
  const [gridCols, setGridCols] = useState<1 | 3 | 5>(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [seedLoading, setSeedLoading] = useState(false);
  const [milestoneVer, setMilestoneVer] = useState(0);
  const [animatedLikeIds, setAnimatedLikeIds] = useState<Set<string>>(new Set());
  const useAvatar = useAvatarFallback();

  useEffect(() => {
    const h = () => setMilestoneVer(v => v + 1);
    window.addEventListener('angelo:milestones-changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('angelo:milestones-changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);

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

  const milestoneIds = getMilestoneIds();
  let filtered = [...items];
  if (filterParam === 'with-me') filtered = filtered.filter(p => participantIdsOf(p).includes(currentId));
  if (filterParam === 'important') filtered = filtered.filter(p => milestoneIds.includes(p.id));
  if (authorParam) filtered = filtered.filter(p => authorIdOf(p) === authorParam);
  if (withParam) filtered = filtered.filter(p => participantIdsOf(p).includes(withParam));
  if (tagParam) filtered = filtered.filter(p => (p.topicTag || '').trim() === tagParam);
  if (placeParam) filtered = filtered.filter(p => (p.place || '').trim() === placeParam);
  if (unreadParam === '1') filtered = filtered.filter(p => !p.isRead);
  const list = searchQuery.trim()
    ? filtered.filter(p => (p.title || p.text).toLowerCase().includes(searchQuery.toLowerCase()))
    : filtered;

  const sorted = [...list].sort((a, b) => {
    if (sortMode === 'publish-new') {
      const da = publishDateOf(a) || '';
      const db = publishDateOf(b) || '';
      return db.localeCompare(da);
    }
    const da = eventDateOf(a) || '';
    const db = eventDateOf(b) || '';
    return sortMode === 'event-new' ? db.localeCompare(da) : da.localeCompare(db);
  });

  const mediaTiles: MediaTile[] = sorted
    .filter(p => (p.media ?? []).some(m => m.type === 'photo'))
    .map(p => {
      const first = (p.media ?? []).find(m => m.type === 'photo');
      const url = first ? ((first as { thumbnail?: string }).thumbnail || first.url || '') : '';
      const photosCount = (p.media ?? []).filter(m => m.type === 'photo').length;
      const likes = first?.likes ?? [];
      const myLikesCount = currentId ? likes.filter(id => id === currentId).length : 0;
      return url && first ? { pubId: p.id, mediaId: first.id, url, thumbnail: (first as { thumbnail?: string }).thumbnail, photosCount, likesCount: likes.length, myLikesCount } : null;
    })
    .filter((x): x is MediaTile => x !== null);

  const mediaTilesWithDemo = mediaTiles.length > 0
    ? mediaTiles
    : sorted.slice(0, 12).map((p, i) => ({
        pubId: p.id,
        mediaId: p.id,
        url: getPrototypePublicationPhotoBySeed(p.id, i).src,
        thumbnail: undefined as string | undefined,
        photosCount: 0,
        likesCount: (p.likes ?? []).length,
        myLikesCount: 0,
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

  const toggleTileLike = async (tile: MediaTile) => {
    if (!myMemberId) {
      toast({ title: 'Нужно войти, чтобы поставить лайк' });
      return;
    }
    try {
      const isLiked = (tile.myLikesCount ?? 0) > 0;
      const updated = isLiked
        ? await api.feed.removeMediaLike(tile.pubId, tile.mediaId)
        : await api.feed.addMediaLike(tile.pubId, tile.mediaId);
      setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (!isLiked) {
        setAnimatedLikeIds(prev => new Set(prev).add(tile.mediaId));
        setTimeout(() => {
          setAnimatedLikeIds(prev => {
            const next = new Set(prev);
            next.delete(tile.mediaId);
            return next;
          });
        }, 380);
      }
    } catch {
      toast({ title: 'Не удалось поставить лайк' });
    }
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

  const clearAllFilters = () => {
    searchParams.delete('filter');
    searchParams.delete('author');
    searchParams.delete('with');
    searchParams.delete('tag');
    searchParams.delete('place');
    searchParams.delete('unread');
    setSearchParams(searchParams);
  };

  const setQueryFilter = (key: 'author' | 'with' | 'tag' | 'place' | 'unread', value: string | null) => {
    if (!value) searchParams.delete(key);
    else searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  const toggleUnread = () => {
    setQueryFilter('unread', unreadParam === '1' ? null : '1');
  };

  const sortModeLabel =
    sortMode === 'event-new'
      ? 'По дате события: новые'
      : sortMode === 'event-old'
        ? 'По дате события: старые'
        : 'По дате публикации: новые';

  const uniqueAuthorIds = Array.from(new Set(items.map(p => authorIdOf(p)).filter((id): id is string => !!id))).filter(id => memberMap.has(id));
  const uniqueParticipantIds = Array.from(new Set(items.flatMap(p => participantIdsOf(p)))).filter(id => memberMap.has(id));
  const uniqueTags = Array.from(new Set(items.map(p => (p.topicTag || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru-RU'));
  const uniquePlaces = Array.from(new Set(items.map(p => (p.place || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru-RU'));

  const gridClass = gridCols === 1 ? 'grid-cols-1' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-5';

  const hasFilteredView = !!(authorParam || withParam || filterParam === 'with-me');
  const backTarget = authorParam ? ROUTES.classic.profile(authorParam) : withParam ? ROUTES.classic.profile(withParam) : filterParam === 'with-me' ? ROUTES.classic.myProfile : null;
  const barTitle = hasFilteredView
    ? (viewMode === 'media' ? (authorParam ? 'Медиа' : 'Медиа со мной') : (authorParam ? 'Публикации' : 'Публикации со мной'))
    : 'Лента';

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[#F5F0E8]">
        <TopBar
          title={barTitle}
          onBack={() => (backTarget ? navigate(backTarget) : navigate(-1))}
          light
          right={
            !hasFilteredView ? (
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
              </div>
            ) : undefined
          }
        />
        <div className="mx-auto max-w-full px-4 pt-2 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          {!hasFilteredView && items.length > 50 && (
            <p className="text-xs text-[var(--proto-text-muted)] mb-3">Демо · {items.length} публикаций</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] p-0.5 shrink-0">
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
            <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
              <button
                type="button"
                onClick={() => setSortOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-sm font-medium text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
              >
                {sortModeLabel}
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  (filterParam || authorParam || withParam || tagParam || placeParam || unreadParam === '1')
                    ? 'bg-[var(--proto-active)] text-white border-[var(--proto-active)]'
                    : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40'
                }`}
              >
                <Filter className="h-4 w-4" />
                Фильтры
              </button>
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
                  {t.photosCount != null && t.photosCount > 1 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <Images className="h-3 w-3" />
                      {t.photosCount}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectionMode) toggleTileLike(t);
                    }}
                    className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-black/60 transition-colors"
                  >
                    <Heart className={`h-3 w-3 ${(animatedLikeIds.has(t.mediaId) ? 'animate-pulse' : '')}`} fill={(t.myLikesCount ?? 0) > 0 ? 'currentColor' : 'none'} />
                    {t.likesCount ?? 0}
                  </button>
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
                {searchQuery.trim() ? 'Ничего не найдено' : 'Создайте первую историю'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="bg-[#F0EDE8] border-[#E5E1DC] rounded-3xl w-[92vw] max-w-md max-h-[85dvh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
            <DialogTitle className="text-[#333333] font-semibold">Фильтры</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <p className="text-xs font-semibold text-[#8D846F] uppercase tracking-wide mb-2">Быстрые</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { key: null, label: 'Все', onClick: () => setFilter(null) },
                { key: 'with-me', label: 'Со мной', onClick: () => setFilter('with-me') },
                { key: 'important', label: 'Важные', onClick: () => setFilter('important') },
                { key: 'unread', label: 'Непрочитанные', onClick: toggleUnread },
              ].map(({ key, label, onClick }) => {
                const active = (key === null && !filterParam) || (key === 'with-me' && filterParam === 'with-me') || (key === 'important' && filterParam === 'important') || (key === 'unread' && unreadParam === '1');
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className={`rounded-2xl border px-4 py-4 text-center text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 shadow-sm ${active ? 'bg-[#5D4B34] text-white border-[#5D4B34]' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-[#8D846F] uppercase tracking-wide mb-2">Автор</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setQueryFilter('author', null)}
                className={`rounded-2xl border px-2 py-3 text-center text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 ${!authorParam ? 'bg-[#5D4B34] text-white border-[#5D4B34]' : ''}`}
              >
                Все
              </button>
              {uniqueAuthorIds.map((id) => {
                const m = memberMap.get(id);
                const avSrc = (m as { avatar?: string })?.avatar ?? (useAvatar ? getPrototypeAvatarUrl(id, currentId) : '');
                const active = authorParam === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setQueryFilter('author', authorParam === id ? null : id)}
                    className={`rounded-2xl border px-2 py-3 text-center transition-colors flex flex-col items-center justify-center gap-1 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 ${active ? 'bg-[#5D4B34] text-white border-[#5D4B34]' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {avSrc ? <AvatarImage src={avSrc} /> : null}
                      <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-[10px]">{memberDisplayName(m ?? null).slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-medium truncate w-full">{memberDisplayName(m ?? null)}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-[#8D846F] uppercase tracking-wide mb-2">Участник</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setQueryFilter('with', null)}
                className={`rounded-2xl border px-2 py-3 text-center text-xs font-medium transition-colors flex flex-col items-center justify-center gap-1 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 ${!withParam ? 'bg-[#5D4B34] text-white border-[#5D4B34]' : ''}`}
              >
                Все
              </button>
              {uniqueParticipantIds.map((id) => {
                const m = memberMap.get(id);
                const avSrc = (m as { avatar?: string })?.avatar ?? (useAvatar ? getPrototypeAvatarUrl(id, currentId) : '');
                const active = withParam === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setQueryFilter('with', withParam === id ? null : id)}
                    className={`rounded-2xl border px-2 py-3 text-center transition-colors flex flex-col items-center justify-center gap-1 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 ${active ? 'bg-[#5D4B34] text-white border-[#5D4B34]' : ''}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {avSrc ? <AvatarImage src={avSrc} /> : null}
                      <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-[10px]">{memberDisplayName(m ?? null).slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-medium truncate w-full">{memberDisplayName(m ?? null)}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-[#8D846F] uppercase tracking-wide mb-2">Тег темы</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                type="button"
                onClick={() => setQueryFilter('tag', null)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${!tagParam ? 'bg-[#5D4B34] text-white' : 'bg-white border border-[var(--proto-border)] text-[#333333] hover:border-[var(--proto-active)]/40'}`}
              >
                Все
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQueryFilter('tag', tagParam === tag ? null : tag)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${tagParam === tag ? 'bg-[#5D4B34] text-white' : 'bg-white border border-[var(--proto-border)] text-[#333333] hover:border-[var(--proto-active)]/40'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-[#8D846F] uppercase tracking-wide mb-2">Место</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setQueryFilter('place', null)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${!placeParam ? 'bg-[#5D4B34] text-white' : 'bg-white border border-[var(--proto-border)] text-[#333333] hover:border-[var(--proto-active)]/40'}`}
              >
                Все
              </button>
              {uniquePlaces.map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => setQueryFilter('place', placeParam === place ? null : place)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${placeParam === place ? 'bg-[#5D4B34] text-white' : 'bg-white border border-[var(--proto-border)] text-[#333333] hover:border-[var(--proto-active)]/40'}`}
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 p-4 bg-[#F0EDE8] border-t border-[#E5E1DC] flex items-center gap-2">
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-3 rounded-xl text-sm font-medium bg-[#F8F5F1] border border-[#E5E1DC] text-[#333333]"
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-[#5D4B34] text-white"
            >
              Показать ленту
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[#F0EDE8] border-[#E5E1DC]">
          <SheetHeader>
            <SheetTitle className="text-[#333333] font-semibold">Сортировка</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => { setSortMode('event-new'); setSortOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${sortMode === 'event-new' ? 'bg-[#5D4B34] text-white' : 'bg-[#F8F5F1] border border-[#E5E1DC] text-[#333333]'}`}
            >
              По дате события: новые
            </button>
            <button
              type="button"
              onClick={() => { setSortMode('event-old'); setSortOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${sortMode === 'event-old' ? 'bg-[#5D4B34] text-white' : 'bg-[#F8F5F1] border border-[#E5E1DC] text-[#333333]'}`}
            >
              По дате события: старые
            </button>
            <button
              type="button"
              onClick={() => { setSortMode('publish-new'); setSortOpen(false); }}
              className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${sortMode === 'publish-new' ? 'bg-[#5D4B34] text-white' : 'bg-[#F8F5F1] border border-[#E5E1DC] text-[#333333]'}`}
            >
              По дате публикации: новые
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Feed;
