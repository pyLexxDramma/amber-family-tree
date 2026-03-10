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
import type { Publication } from '@/types';

const photoCount = (pub: Publication) => pub.media.filter(m => m.type === 'photo').length;

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const filterParam = searchParams.get('filter');
  const [mode, setMode] = useState<'all' | 'media'>(viewParam === 'media' ? 'media' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Publication[]>([]);

  useEffect(() => {
    api.feed.list().then(setItems);
  }, []);

  const setFeedMode = (m: 'all' | 'media') => {
    setMode(m);
    setSearchParams(m === 'media' ? { view: 'media' } : {}, { replace: true });
  };

  const sorted = [...items].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  let filtered = mode === 'media'
    ? sorted.filter(p => p.media.some(m => m.type === 'photo' || m.type === 'video'))
    : sorted;
  if (filterParam === 'my') filtered = filtered.filter(p => p.authorId === currentUserId);
  if (filterParam === 'with-me') filtered = filtered.filter(p => p.participantIds.includes(currentUserId));
  const list = searchQuery.trim()
    ? filtered.filter(p => (p.title || p.text).toLowerCase().includes(searchQuery.toLowerCase()))
    : filtered;

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Лента"
          onBack={() => navigate(ROUTES.home)}
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
                const author = getMember(pub.authorId);
                const nPhotos = photoCount(pub);
                const postPhoto = getPrototypeFeedPostPhotoByTopic(pub.topicTag);
                const authorAvatar = getPrototypeAvatar(pub.authorId, currentUserId);

                return (
                  <div key={pub.id} className="py-4 first:pt-4 block">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(ROUTES.classic.profile(pub.authorId)); }}
                        className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-left"
                      >
                        <span className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-card)] flex-shrink-0 block">
                          <img
                            src={authorAvatar.src}
                            alt=""
                            className="h-full w-full object-cover"
                            style={authorAvatar.objectPosition ? { objectPosition: authorAvatar.objectPosition } : undefined}
                          />
                        </span>
                        <span className="font-semibold text-[var(--proto-text)] text-sm">
                          {author ? `${author.firstName} ${author.lastName}` : 'Андрей Филатов'}
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
                    <div className="flex items-center gap-4 text-sm text-[var(--proto-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {pub.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {pub.comments.length}
                      </span>
                      {nPhotos > 0 && (
                        <span className="ml-auto">
                          {nPhotos} фотографий
                        </span>
                      )}
                    </div>
                  </button>
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
