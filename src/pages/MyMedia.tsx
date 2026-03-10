import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { Video } from 'lucide-react';
import type { MediaItem, MediaType } from '@/types';
import { api } from '@/integrations/api';

type FilterType = 'all' | 'photo' | 'video';
type CategoryFilter = 'popular' | 'collection' | 'family';

const categoryFilters: { id: CategoryFilter; label: string }[] = [
  { id: 'popular', label: 'Популярное' },
  { id: 'collection', label: 'Коллекция' },
  { id: 'family', label: 'Семья' },
];

const aspectClasses = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'];

const MyMedia: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('popular');
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    api.profile.listMyMedia().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'photo') list = list.filter(m => m.type === 'photo');
    if (filter === 'video') list = list.filter(m => m.type === 'video');
    if (categoryFilter === 'family') list = list.filter(m => m.category === 'Семья');
    if (categoryFilter === 'collection') list = list.filter(m => m.category === 'Путешествие' || m.category === 'Праздник');
    return list;
  }, [filter, categoryFilter, items]);

  const handleItemClick = (item: MediaItem) => {
    if (item.publicationId) navigate(ROUTES.classic.publication(item.publicationId));
  };

  const categoryTagClass = (category: string | undefined) => {
    if (category === 'Путешествие') return 'bg-[#4a7c59]/90 text-white';
    if (category === 'Праздник') return 'bg-[#8b6914]/90 text-white';
    return 'bg-[var(--proto-active)]/90 text-white';
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Лента"
          onBack={() => navigate(ROUTES.classic.myProfile)}
          light
          right={
            <div className="flex items-center gap-2">
              <button type="button" className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поиск">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              <button type="button" className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Добавить">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          }
        />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex flex-wrap gap-2 mb-4">
            {categoryFilters.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCategoryFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === f.id
                    ? 'bg-[var(--proto-active)] text-white'
                    : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-6 border-b border-[var(--proto-border)] mb-4">
            {(['all', 'photo', 'video'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                  filter === t ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'
                }`}
              >
                {t === 'all' ? 'Все' : t === 'photo' ? 'Фото' : 'Видео'}
              </button>
            ))}
          </div>

          <div className="columns-2 gap-3 space-y-3">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`break-inside-avoid w-full rounded-xl overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors text-left block ${aspectClasses[index % aspectClasses.length]}`}
              >
                <div className="relative w-full h-full min-h-[140px]">
                  <img
                    src={item.src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {item.type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-8 w-8 text-white" strokeWidth={2} />
                    </span>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {item.year && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#7b8fa1]/90 text-white shadow-sm">
                        {item.year}
                      </span>
                    )}
                    {item.category && (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm ${categoryTagClass(item.category)}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-left">
                    <p className="text-xs font-medium leading-tight line-clamp-2">{item.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-[var(--proto-text-muted)] text-sm py-12">
              {filter === 'photo' ? 'Нет фотографий' : filter === 'video' ? 'Нет видео' : 'Нет медиа'}
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyMedia;
