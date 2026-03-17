import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { Publication } from '@/types';
import { getMilestoneIds } from '@/lib/milestones';

const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');

const TimelineDecade: React.FC = () => {
  const { decadeStart } = useParams();
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
    const h = () => setMilestoneVer(v => v + 1);
    window.addEventListener('angelo:milestones-changed', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('angelo:milestones-changed', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const start = parseInt((decadeStart || '').slice(0, 4), 10);
  const safeStart = Number.isFinite(start) ? start : 0;
  const end = safeStart ? safeStart + 9 : 0;

  const milestoneIds = useMemo(() => getMilestoneIds(), [milestoneVer]);

  const yearCounts = useMemo(() => {
    const map = new Map<string, number>();
    const inDecade = items.filter((p) => {
      const y = parseInt(eventDateOf(p).slice(0, 4), 10);
      if (!Number.isFinite(y) || !safeStart) return false;
      return y >= safeStart && y <= end;
    });
    const filtered = focus === 'key'
      ? (milestoneIds.length ? inDecade.filter(p => milestoneIds.includes(p.id)) : [])
      : inDecade;
    for (const p of filtered) {
      const y = eventDateOf(p).slice(0, 4);
      map.set(y, (map.get(y) || 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [end, focus, items, milestoneIds, safeStart]);

  useEffect(() => {
    const next = focusParam === 'key' ? 'key' : 'all';
    setFocus(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusParam]);

  const setFocusMode = (m: 'all' | 'key') => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('focus', m);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={safeStart ? `${safeStart}-е` : 'Десятилетие'} onBack={() => navigate(-1)} light right={null} />
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
          <div className="space-y-3">
            {yearCounts.map(([y, c]) => (
              <button
                key={y}
                type="button"
                onClick={() => navigate(`${ROUTES.classic.timelineYear(y)}?focus=${focus}`)}
                className="w-full rounded-2xl bg-white border border-[var(--proto-border)] p-4 text-left hover:border-[var(--proto-active)]/40 transition-colors"
              >
                <p className="text-lg font-semibold text-[var(--proto-text)]">{y}</p>
                <p className="text-sm text-[var(--proto-text-muted)]">{focus === 'key' ? `${c} избранных` : `${c} событий`}</p>
              </button>
            ))}
          </div>

          {yearCounts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--proto-text-muted)]">
                {focus === 'key' ? 'Нет ключевых (избранных) событий за это десятилетие' : 'Нет событий за это десятилетие'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TimelineDecade;

