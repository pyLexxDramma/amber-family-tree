import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
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

function photoCoverOf(p: Publication): string | null {
  const ph = p.media.find(m => m.type === 'photo');
  return ph?.thumbnail || ph?.url || p.media.find(m => m.thumbnail)?.thumbnail || null;
}

const AlbumDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const album = defs.find(d => d.id === id) ?? null;
  const matched = album ? pubs.filter(album.match) : [];
  const photos = matched
    .flatMap((p) => p.media.filter(m => m.type === 'photo').map(m => ({ pubId: p.id, url: m.thumbnail || m.url || '' })))
    .filter(x => !!x.url);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <div className="mx-auto max-w-full px-4 pt-6 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
              aria-label="Назад"
            >
              ←
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[var(--proto-text)] truncate">{album?.title || 'Альбом'}</h1>
              <p className="text-xs text-[var(--proto-text-muted)]">{photos.length} фото</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {matched.map((p) => {
              const cover = photoCoverOf(p) || getPrototypePublicationPhotoByTopic(p.topicTag).src;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(ROUTES.classic.publication(p.id))}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--proto-border)] hover:opacity-95 transition-opacity"
                >
                  <img
                    src={cover}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(p.topicTag).src; }}
                  />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-black/55 text-white">
                    <Heart className="h-3 w-3" fill="currentColor" />
                    {(p.likes ?? []).length}
                  </span>
                </button>
              );
            })}
          </div>

          {matched.length === 0 && (
            <p className="text-sm text-[var(--proto-text-muted)] py-12 text-center">
              В этом альбоме пока нет фото
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.feed)}
            className="mt-6 w-full h-11 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
          >
            Перейти в ленту
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AlbumDetails;

