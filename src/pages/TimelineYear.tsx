import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { Publication } from '@/types';
import { getPrototypeFeedPostPhotoByTopic } from '@/lib/prototype-assets';
import { getMilestoneIds } from '@/lib/milestones';

const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

const TimelineYear: React.FC = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<Publication[]>([]);
  const [milestoneVer, setMilestoneVer] = useState(0);

  useEffect(() => {
    api.feed.list().then(setItems);
  }, []);

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
    if (milestoneIds.length === 0) return byYear;
    return byYear.filter(p => milestoneIds.includes(p.id));
  }, [items, milestoneIds, safeYear]);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={`События ${safeYear || ''}`} onBack={() => navigate(-1)} light right={null} />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="space-y-4">
            {list.map((pub) => {
              const coverSrc = pub.media.find(m => m.type === 'photo')?.url
                || pub.media.find(m => (m as { thumbnail?: string }).thumbnail)?.thumbnail
                || getPrototypeFeedPostPhotoByTopic(pub.topicTag).src;
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
                    <p className="text-xs text-[var(--proto-text-muted)]">{eventDateOf(pub)}</p>
                    <p className="text-sm font-semibold text-[var(--proto-text)] mt-1">{pub.title || 'Событие'}</p>
                    {pub.place ? <p className="text-xs text-[var(--proto-text-muted)] mt-2">📍 {pub.place}</p> : null}
                  </div>
                </button>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--proto-text-muted)]">Нет значимых событий за этот год</p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.feed)}
                className="mt-4 h-11 px-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                Перейти в ленту
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TimelineYear;

