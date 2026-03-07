import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getPrototypePublicationPhotoByTopic } from '@/lib/prototype-assets';
import { mockPublications } from '@/data/mock-publications';
import { currentUserId } from '@/data/mock-members';
import { Users, MapPin, Tag } from 'lucide-react';

const timelineEvents = mockPublications
  .filter(p => p.authorId === currentUserId || p.participantIds.includes(currentUserId))
  .slice(0, 8)
  .map(p => ({
    id: p.id,
    date: p.eventDate,
    title: p.title || 'Событие',
    topic: p.topicTag,
    thumb: getPrototypePublicationPhotoByTopic(p.topicTag).src,
  }));

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState<'decades' | 'years' | 'months'>('months');
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Экран «Таймлайн»"
          onBack={() => navigate(ROUTES.classic.tree)}
          light
        />
        <div className="mx-auto max-w-full px-4 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.tree)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]"
            >
              Дерево
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.timeline)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--proto-active)] text-white"
            >
              Таймлайн
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(['decades', 'years', 'months'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  scale === s ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {s === 'decades' ? 'Десятилетия' : s === 'years' ? 'Годы' : 'Месяцы'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-[var(--proto-text-muted)] self-center mr-1">Фильтры:</span>
            <button type="button" className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] flex items-center gap-1">
              <Users className="h-3.5 w-3" /> Люди
            </button>
            <button type="button" className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] flex items-center gap-1">
              <MapPin className="h-3.5 w-3" /> Места
            </button>
            <button type="button" className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] flex items-center gap-1">
              <Tag className="h-3.5 w-3" /> Теги
            </button>
            <button type="button" className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]">
              Типы
            </button>
          </div>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'single' ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'}`}
            >
              Одиночный
            </button>
            <button
              type="button"
              onClick={() => setMode('compare')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'compare' ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'}`}
            >
              Сравнение
            </button>
          </div>
          <div className="relative pl-8 border-l-2 border-[var(--proto-border)] ml-2 space-y-6">
            {timelineEvents.map((ev, i) => (
              <div key={ev.id} className="relative flex gap-4">
                <span className="absolute -left-[2.25rem] top-1 text-xs font-medium text-[var(--proto-text-muted)]">
                  {ev.date.split('-').reverse().slice(0, 2).join('.')}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.classic.publication(ev.id))}
                  className="flex-1 flex gap-3 p-3 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors text-left"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[var(--proto-bg)]">
                    <img src={ev.thumb} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--proto-text)] truncate">{ev.title}</p>
                    <p className="text-xs text-[var(--proto-text-muted)]">{ev.topic}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
            <p className="text-sm font-semibold text-[var(--proto-text)] mb-3">AI инсайты</p>
            <div className="space-y-2">
              <button type="button" className="w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors text-left">
                Подсветка радостных периодов
              </button>
              <button type="button" className="w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors text-left">
                Подсветка задумчивых/сложных периодов
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TimelinePage;
