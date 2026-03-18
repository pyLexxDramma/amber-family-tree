import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { Publication } from '@/types';
import { getPrototypeFeedPostPhotoByTopic } from '@/lib/prototype-assets';
import { getMilestoneIds } from '@/lib/milestones';
import { isDemoMode } from '@/lib/demoMode';
import { Video } from 'lucide-react';

const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

const topicPillClass: Record<string, string> = {
  Путешествия: 'bg-emerald-500/70 text-white',
  Праздники: 'bg-amber-600/70 text-white',
  'День рождения': 'bg-amber-600/70 text-white',
  Рецепты: 'bg-amber-700/70 text-white',
  Будни: 'bg-slate-500/70 text-white',
  Истории: 'bg-slate-600/70 text-white',
  Семья: 'bg-slate-500/70 text-white',
};

const TimelineYear: React.FC = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Publication[]>([]);
  const [milestoneVer, setMilestoneVer] = useState(0);
  const focusParam = (searchParams.get('focus') || '').toLowerCase();
  const [focus, setFocus] = useState<'all' | 'key'>(focusParam === 'key' ? 'key' : 'all');

  useEffect(() => {
    api.feed.list().then(setItems);
  }, []);

  useEffect(() => {
    const next = focusParam === 'key' ? 'key' : 'all';
    setFocus(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusParam]);

  useEffect(() => {
    const h = () => setMilestoneVer(v => v + 1);
    window.addEventListener('angelo:milestones-changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('angelo:milestones-changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const safeYear = (year || '').slice(0, 4);
  const milestoneIds = useMemo(() => getMilestoneIds(), [milestoneVer]);

  const list = useMemo(() => {
    const byYear = items
      .filter((p) => eventDateOf(p).slice(0, 4) === safeYear)
      .sort((a, b) => (eventDateOf(b) || '').localeCompare(eventDateOf(a) || ''));
    if (focus === 'all') return byYear;
    if (milestoneIds.length === 0) return [];
    return byYear.filter(p => milestoneIds.includes(p.id));
  }, [focus, items, milestoneIds, safeYear]);

  const setFocusMode = (m: 'all' | 'key') => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('focus', m);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[#F5F0E8]">
        <TopBar title={`События ${safeYear || ''}`} onBack={() => navigate(-1)} light right={null} />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex flex-wrap gap-2 mb-4">
            {(['key', 'all'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFocusMode(m)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  focus === m ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {m === 'key' ? 'Ключевые' : 'Все'}
              </button>
            ))}
          </div>
          <div className="columns-2 gap-3">
            {list.map((pub) => {
              const coverSrc = pub.media.find(m => m.type === 'photo')?.url
                || pub.media.find(m => (m as { thumbnail?: string }).thumbnail)?.thumbnail
                || (isDemoMode() ? getPrototypeFeedPostPhotoByTopic(pub.topicTag).src : '');
              const hasVideo = !!pub.media.find(m => m.type === 'video');
              const eventY = eventDateOf(pub).slice(0, 4);
              const pillClass = topicPillClass[pub.topicTag] ?? 'bg-slate-600/70 text-white';
              return (
                <button
                  key={pub.id}
                  type="button"
                  onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                  className="w-full break-inside-avoid mb-3 rounded-xl overflow-hidden bg-[var(--proto-border)] hover:opacity-95 transition-opacity text-left block"
                >
                  <div className="relative aspect-[4/5]">
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = getPrototypeFeedPostPhotoByTopic(pub.topicTag).src; }}
                      />
                    ) : (
                      <img src={getPrototypeFeedPostPhotoByTopic(pub.topicTag).src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-600/80 text-white text-xs font-semibold">
                        {eventY}
                      </span>
                      {pub.topicTag && (
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${pillClass}`}>
                          {pub.topicTag}
                        </span>
                      )}
                    </div>
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Video className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-semibold text-white drop-shadow-md line-clamp-2">
                        {pub.title || 'Событие'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--proto-text-muted)]">
                {focus === 'key' ? 'Нет ключевых (избранных) событий за этот год' : 'Нет событий за этот год'}
              </p>
              <button
                type="button"
                onClick={() => focus === 'key' ? setFocusMode('all') : navigate(ROUTES.classic.feed)}
                className="mt-4 h-11 px-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                {focus === 'key' ? 'Показать все события года' : 'Перейти в ленту'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TimelineYear;

