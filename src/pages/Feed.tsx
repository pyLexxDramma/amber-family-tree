import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { getMember, currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import {
  getPrototypeAvatar,
  getPrototypeFeedPostPhotoByTopic,
} from '@/lib/prototype-assets';
import { Search, ArrowUpDown, SlidersHorizontal, Heart, MessageCircle, LineChart } from 'lucide-react';
import type { FamilyMember, Publication } from '@/types';
import { toast } from '@/hooks/use-toast';

const photoCount = (pub: Publication) => pub.media.filter(m => m.type === 'photo').length;

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string } | null) =>
  m ? `${m.firstName ?? m.first_name ?? ''} ${m.lastName ?? m.last_name ?? ''}`.trim() || 'Автор' : 'Автор';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const filterParam = searchParams.get('filter');
  const [mode, setMode] = useState<'all' | 'media'>(viewParam === 'media' ? 'media' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoSearchOpen, setDemoSearchOpen] = useState(false);
  const [items, setItems] = useState<Publication[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const myMemberIdRef = useRef<string | null>(null);

  useEffect(() => {
    api.feed.list().then(setItems);
    api.family.listMembers().then(setMembers);
    api.profile.getMyProfile().then(me => setMyMemberId(me.id)).catch(() => {});
  }, []);

  useEffect(() => {
    myMemberIdRef.current = myMemberId;
  }, [myMemberId]);

  const setFeedMode = (m: 'all' | 'media') => {
    setMode(m);
    setSearchParams(m === 'media' ? { view: 'media' } : {}, { replace: true });
  };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const currentId = myMemberId ?? currentUserId;
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

  const ensureMyMemberId = async () => {
    if (myMemberId) return myMemberId;
    try {
      const me = await api.profile.getMyProfile();
      setMyMemberId(me.id);
      myMemberIdRef.current = me.id;
      return me.id;
    } catch {
      return null;
    }
  };

  const sorted = [...items].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  let filtered = mode === 'media'
    ? sorted.filter(p => p.media.some(m => m.type === 'photo' || m.type === 'video'))
    : sorted;
  if (filterParam === 'my') filtered = filtered.filter(p => authorIdOf(p) === currentId);
  if (filterParam === 'with-me') filtered = filtered.filter(p => participantIdsOf(p).includes(currentId));
  const list = searchQuery.trim()
    ? filtered.filter(p => (p.title || p.text).toLowerCase().includes(searchQuery.toLowerCase()))
    : filtered;

  const toggleLike = async (pubId: string) => {
    if (likingIds[pubId]) return;
    setLikingIds(v => ({ ...v, [pubId]: true }));
    try {
      const mid = await ensureMyMemberId();
      if (!mid) {
        toast({ title: 'Нужно войти, чтобы поставить лайк' });
        return;
      }
      const cur = items.find(p => p.id === pubId);
      const liked = cur ? (cur.likes ?? []).includes(mid) : false;
      setItems(prev => prev.map(p => {
        if (p.id !== pubId) return p;
        const likes = p.likes ?? [];
        const nextLikes = liked ? likes.filter(x => x !== mid) : (likes.includes(mid) ? likes : [...likes, mid]);
        return { ...p, likes: nextLikes };
      }));
      const updated = liked ? await api.feed.removeLike(pubId) : await api.feed.addLike(pubId);
      setItems(prev => prev.map(p => p.id === pubId ? updated : p));
    } catch {
      try {
        const fresh = await api.feed.getById(pubId);
        if (fresh) setItems(prev => prev.map(p => p.id === pubId ? fresh : p));
      } catch {}
      toast({ title: 'Не удалось поставить лайк' });
    } finally {
      setLikingIds(v => ({ ...v, [pubId]: false }));
    }
  };

  const monthLabel = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    const month = d.toLocaleString('ru-RU', { month: 'long' });
    const cap = month.charAt(0).toUpperCase() + month.slice(1);
    return `${cap} ${d.getFullYear()}`;
  };

  if (isDemoMode()) {
    const groups = new Map<string, Publication[]>();
    for (const p of list) {
      const key = (p.publishDate || '').slice(0, 7) || '0000-00';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    const groupKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

    const memories = [...list]
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title || 'Воспоминание',
        yearsAgo: Math.max(1, new Date().getFullYear() - parseInt(p.eventDate.slice(0, 4), 10)),
      }));

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
                  onClick={() => setDemoSearchOpen(v => !v)}
                  className="h-10 w-10 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] flex items-center justify-center text-[var(--proto-text-muted)] hover:border-[var(--proto-active)]/40 transition-colors"
                  aria-label="Поиск"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {demoSearchOpen && (
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
                const sectionItems = (groups.get(key) || []).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
                const label = key !== '0000-00' ? monthLabel(`${key}-01`) : 'Публикации';
                return (
                  <div key={key}>
                    <p className="text-lg font-semibold text-[var(--proto-text)] mb-3">{label}</p>
                    <div className="space-y-4">
                      {sectionItems.map((pub) => {
                        const coverSrc = pub.media.find(m => m.type === 'photo')?.url || pub.media.find(m => m.thumbnail)?.thumbnail || getPrototypeFeedPostPhotoByTopic(pub.topicTag).src;
                        const aid = authorIdOf(pub);
                        const author = memberMap.get(aid) ?? getMember(aid);
                        return (
                          <button
                            key={pub.id}
                            type="button"
                            onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                            className="w-full rounded-3xl bg-white border border-[var(--proto-border)] overflow-hidden text-left hover:border-[var(--proto-active)]/40 transition-colors"
                          >
                            <div className="aspect-[4/3] bg-[var(--proto-border)]">
                              <img src={coverSrc} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4">
                              <p className="text-sm font-semibold text-[var(--proto-text)]">{memberDisplayName(author ?? null)}</p>
                              <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{pub.eventDate}</p>
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

            {list.length === 0 && (
              <p className="text-center text-[var(--proto-text-muted)] text-sm py-12">
                Нет публикаций
              </p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Лента"
          onBack={() => navigate(-1)}
          light
          right={null}
        />
        <div className="mx-auto max-w-full px-3 pt-3 pb-4 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl">
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--proto-text-muted)]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Найти публикацию..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] text-sm text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]/30 focus:border-[var(--proto-active)]"
                />
              </div>
              <button type="button" className="h-10 w-10 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors shrink-0" aria-label="Сортировка">
                <ArrowUpDown className="h-4 w-4" />
              </button>
              <button type="button" className="h-10 w-10 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors shrink-0" aria-label="Фильтры">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-6 border-b border-[var(--proto-border)]">
              <button
                type="button"
                onClick={() => setFeedMode('all')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${mode === 'all' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => setFeedMode('media')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${mode === 'media' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
              >
                Медиа
              </button>
            </div>

            <div className="space-y-0 divide-y divide-[var(--proto-border)]">
              {list.map(pub => {
                const aid = authorIdOf(pub);
                const author = memberMap.get(aid) ?? getMember(aid);
                const nPhotos = photoCount(pub);
                const firstPhoto = pub.media.find(m => m.type === 'photo');
                const coverSrc = firstPhoto?.url || pub.media.find(m => m.thumbnail)?.thumbnail;
                const postPhoto = coverSrc
                  ? { src: coverSrc, objectPosition: 'center center' as const }
                  : getPrototypeFeedPostPhotoByTopic(pub.topicTag);
                const authorAvatarUrl = author && (author as { avatar?: string }).avatar
                  ? (author as { avatar: string }).avatar
                  : getPrototypeAvatar(aid, currentId).src;

                return (
                  <div key={pub.id} className="py-4 first:pt-4 block">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(ROUTES.classic.profile(aid)); }}
                        className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-left"
                      >
                        <span className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-card)] flex-shrink-0 block">
                          <img
                            src={authorAvatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span className="font-semibold text-[var(--proto-text)] text-sm">
                          {memberDisplayName(author ?? null)}
                        </span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                      className="w-full text-left block"
                    >
                      <div className="rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full mb-2">
                        <img
                          src={postPhoto.src}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ objectPosition: postPhoto.objectPosition }}
                        />
                      </div>
                      <h3 className="font-semibold text-[var(--proto-text)] text-base mb-1">{pub.title || 'Без названия'}</h3>
                      <p className="text-sm text-[var(--proto-text-muted)] line-clamp-2 mb-2">{pub.text}</p>
                    </button>
                    <div className="flex items-center gap-4 text-sm text-[var(--proto-text-muted)]">
                      <button
                        type="button"
                        onClick={() => toggleLike(pub.id)}
                        disabled={likingIds[pub.id]}
                        className="flex items-center gap-1 hover:text-[var(--proto-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Лайк"
                      >
                        <Heart className="h-4 w-4" fill={(myMemberId ?? myMemberIdRef.current) && (pub.likes ?? []).includes((myMemberId ?? myMemberIdRef.current) as string) ? 'currentColor' : 'none'} />
                        {(pub.likes ?? []).length}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                        className="flex items-center gap-1 hover:text-[var(--proto-text)] transition-colors"
                        aria-label="Комментарии"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {(pub.comments ?? []).length}
                      </button>
                      {nPhotos > 0 && (
                        <span className="ml-auto">
                          {nPhotos} фотографий
                        </span>
                      )}
                    </div>
                </div>
                );
              })}
            </div>

            {list.length === 0 && (
              <p className="text-center text-[var(--proto-text-muted)] text-sm py-8">
                {searchQuery.trim() ? 'Ничего не найдено' : 'Нет публикаций'}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Feed;
