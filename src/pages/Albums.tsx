import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { Publication } from '@/types';
import { getPrototypePublicationPhotoByTopic } from '@/lib/prototype-assets';

type AlbumDef = {
  id: string;
  title: string;
  match: (p: Publication) => boolean;
};

type AlbumView = {
  id: string;
  title: string;
  photoCount: number;
  coverUrl: string | null;
  topicTag: string;
};

function photoCoverOf(p: Publication): string | null {
  const ph = p.media.find(m => m.type === 'photo');
  return ph?.thumbnail || ph?.url || p.media.find(m => m.thumbnail)?.thumbnail || null;
}

const Albums: React.FC = () => {
  const navigate = useNavigate();
  const [pubs, setPubs] = useState<Publication[]>([]);

  const loadPubs = () => api.feed.list().then(setPubs);

  useEffect(() => {
    loadPubs();
  }, []);

  useEffect(() => {
    const onInvalidate = () => loadPubs();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) loadPubs();
    };
    try {
      if (sessionStorage.getItem('angelo:feed-invalidate')) {
        sessionStorage.removeItem('angelo:feed-invalidate');
        loadPubs();
      }
    } catch {}
    window.addEventListener('angelo:feed-invalidate', onInvalidate);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('angelo:feed-invalidate', onInvalidate);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  const defs: AlbumDef[] = useMemo(() => ([
    { id: 'sochi', title: 'Лето в Сочи', match: (p) => (p.place || '').toLowerCase().includes('сочи') },
    { id: 'new-year', title: 'Новый год', match: (p) => (p.title || '').toLowerCase().includes('новый') },
    { id: 'school', title: 'Школьные годы', match: (p) => (p.title || '').toLowerCase().includes('гордость') },
    { id: 'holidays', title: 'Семейные праздники', match: (p) => p.topicTag === 'Праздники' || p.topicTag === 'День рождения' },
    { id: 'nature', title: 'Дача и природа', match: (p) => (p.title || '').toLowerCase().includes('волге') || (p.text || '').toLowerCase().includes('дач') },
    { id: 'travel', title: 'Наши путешествия', match: (p) => p.topicTag === 'Путешествия' },
  ]), []);

  const albums: AlbumView[] = useMemo(() => {
    return defs.map((d) => {
      const matched = pubs.filter(d.match);
      const photos = matched.flatMap(p => p.media.filter(m => m.type === 'photo'));
      const cover = matched.map(photoCoverOf).find(Boolean) || null;
      const firstPub = matched.find(p => photoCoverOf(p));
      return { id: d.id, title: d.title, photoCount: photos.length, coverUrl: cover, topicTag: firstPub?.topicTag || '' };
    });
  }, [defs, pubs]);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <div className="mx-auto max-w-full px-4 pt-8 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-[var(--proto-text)] mb-6">Альбомы</h1>
          <div className="grid grid-cols-2 gap-4">
            {albums.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => navigate(ROUTES.classic.album(a.id))}
                className="text-left"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--proto-border)]">
                  <img
                    src={a.coverUrl || getPrototypePublicationPhotoByTopic(a.topicTag).src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(a.topicTag).src; }}
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium bg-black/55 text-white">
                    {a.photoCount} фото
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-[var(--proto-text)] line-clamp-1">{a.title}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.myMedia)}
            className="mt-6 w-full h-11 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
          >
            Открыть все медиа
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Albums;

