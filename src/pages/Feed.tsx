import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { getMember, currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import {
  getPrototypeAvatar,
  getPrototypeFeedPostPhotoByTopic,
} from '@/lib/prototype-assets';
import { Search, ArrowUpDown, SlidersHorizontal, Heart, MessageCircle } from 'lucide-react';
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
  const [items, setItems] = useState<Publication[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);

  useEffect(() => {
    api.feed.list().then(setItems);
    api.family.listMembers().then(setMembers);
    api.profile.getMyProfile().then(me => setMyMemberId(me.id)).catch(() => {});
  }, []);

  const setFeedMode = (m: 'all' | 'media') => {
    setMode(m);
    setSearchParams(m === 'media' ? { view: 'media' } : {}, { replace: true });
  };

  const memberMap = new Map(members.map(m => [m.id, m]));
  const currentId = myMemberId ?? currentUserId;
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

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
    if (!myMemberId) return;
    if (likingIds[pubId]) return;
    setLikingIds(v => ({ ...v, [pubId]: true }));
    try {
      const cur = items.find(p => p.id === pubId);
      const liked = cur ? (cur.likes ?? []).includes(myMemberId) : false;
      const updated = liked ? await api.feed.removeLike(pubId) : await api.feed.addLike(pubId);
      setItems(prev => prev.map(p => p.id === pubId ? updated : p));
    } catch {
      toast({ title: 'Не удалось поставить лайк' });
    } finally {
      setLikingIds(v => ({ ...v, [pubId]: false }));
    }
  };

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
                const postPhoto = firstPhoto?.url
                  ? { src: firstPhoto.url, objectPosition: 'center center' as const }
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
                        disabled={!myMemberId || likingIds[pub.id]}
                        className="flex items-center gap-1 hover:text-[var(--proto-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Лайк"
                      >
                        <Heart className="h-4 w-4" fill={myMemberId && (pub.likes ?? []).includes(myMemberId) ? 'currentColor' : 'none'} />
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
