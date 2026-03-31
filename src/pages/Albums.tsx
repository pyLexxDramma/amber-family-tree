import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { Publication } from '@/types';
import { getPrototypePublicationPhotoByTopic } from '@/lib/prototype-assets';
import { allAlbumDefs } from '@/lib/autoCollections';

type AlbumView = {
  id: string;
  title: string;
  photoCount: number;
  coverUrl: string | null;
  fallbackUrl: string;
  topicTag: string;
};

const ALBUM_FALLBACK_BY_ID: Record<string, string> = {
  sochi: '/demo/media/photo5.png',
  'new-year': '/demo/media/photo3.png',
  school: '/demo/media/photo7.png',
  holidays: '/demo/media/photo1.jpg',
  nature: '/demo/media/photo6.png',
  travel: '/demo/media/photo4.png',
};

function photoCoverOf(p: Publication): string | null {
  const ph = p.media.find(m => m.type === 'photo');
  return ph?.thumbnail || ph?.url || p.media.find(m => m.thumbnail)?.thumbnail || null;
}

const Albums: React.FC = () => {
  const navigate = useNavigate();
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(false);

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

  const defs = useMemo(() => allAlbumDefs(pubs, autoMode), [pubs, autoMode]);

  const albums: AlbumView[] = useMemo(() => {
    return defs.map((d) => {
      const matched = pubs.filter(d.match);
      const photos = matched.flatMap(p => p.media.filter(m => m.type === 'photo'));
      const cover = matched.map(photoCoverOf).find(Boolean) || null;
      const firstPub = matched.find(p => photoCoverOf(p));
      const fallbackUrl =
        ALBUM_FALLBACK_BY_ID[d.id] ||
        getPrototypePublicationPhotoByTopic(firstPub?.topicTag || '').src;
      return {
        id: d.id,
        title: d.title,
        photoCount: photos.length,
        coverUrl: cover,
        fallbackUrl,
        topicTag: firstPub?.topicTag || '',
      };
    });
  }, [defs, pubs]);

  const visibleAlbums = useMemo(
    () => (hideEmpty ? albums.filter((a) => a.photoCount > 0) : albums),
    [albums, hideEmpty],
  );

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <div className="mx-auto max-w-full px-4 pt-8 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-[var(--proto-text)] mb-6">Альбомы</h1>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAutoMode((v) => !v)}
              className={`h-10 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                autoMode
                  ? 'bg-[var(--proto-active)] text-white border-[var(--proto-active)]'
                  : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40'
              }`}
            >
              {autoMode ? 'Автосборка включена' : 'Собрать автоматически'}
            </button>
            <button
              type="button"
              onClick={() => setHideEmpty((v) => !v)}
              className={`h-10 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                hideEmpty
                  ? 'bg-[var(--proto-active)] text-white border-[var(--proto-active)]'
                  : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text-muted)]'
              }`}
            >
              {hideEmpty ? 'Пустые скрыты' : 'Скрыть пустые'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {visibleAlbums.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => navigate(ROUTES.classic.album(a.id))}
                className="text-left"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--proto-border)]">
                  <img
                    src={a.coverUrl || a.fallbackUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = a.fallbackUrl; }}
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

