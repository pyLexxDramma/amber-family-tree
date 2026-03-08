import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getPrototypePublicationPhotoByTopic } from '@/lib/prototype-assets';
import { mockPublications, topicTags } from '@/data/mock-publications';
import { currentUserId, getMember } from '@/data/mock-members';
import { Users, MapPin, Tag, Send, FileImage, FileVideo, FileAudio, FileText } from 'lucide-react';
import type { Publication } from '@/types';

type Scale = 'decades' | 'years' | 'months';
type PubType = Publication['type'];

const typeLabels: Record<PubType, string> = {
  photo: 'Фото',
  video: 'Видео',
  audio: 'Аудио',
  text: 'Текст',
};

function buildEvents(pubs: Publication[]) {
  return pubs.map(p => ({
    id: p.id,
    date: p.eventDate,
    title: p.title || 'Событие',
    topic: p.topicTag,
    place: p.place,
    type: p.type,
    authorId: p.authorId,
    participantIds: p.participantIds,
    thumb: getPrototypePublicationPhotoByTopic(p.topicTag).src,
  }));
}

function getDecade(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4), 10);
  const dec = Math.floor(y / 10) * 10;
  return `${dec}-е`;
}

function formatDateByScale(dateStr: string, scale: Scale): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (scale === 'decades') return getDecade(dateStr);
  if (scale === 'years') return `${d.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}.${y}`;
  return `${d.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`;
}

const allPlaces = [...new Set(mockPublications.map(p => p.place).filter(Boolean))] as string[];

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState<Scale>('months');
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [filterPersonId, setFilterPersonId] = useState<string | null>(null);
  const [filterPlace, setFilterPlace] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<PubType | null>(null);
  const [filterMenu, setFilterMenu] = useState<'people' | 'places' | 'tags' | 'types' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseEvents = useMemo(() => buildEvents(mockPublications), []);

  const filteredEvents = useMemo(() => {
    return baseEvents.filter(ev => {
      if (filterPersonId && ev.authorId !== filterPersonId && !ev.participantIds.includes(filterPersonId)) return false;
      if (filterPlace && ev.place !== filterPlace) return false;
      if (filterTag && ev.topic !== filterTag) return false;
      if (filterType && ev.type !== filterType) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseEvents, filterPersonId, filterPlace, filterTag, filterType]);

  const groupedByScale = useMemo(() => {
    if (scale === 'decades') {
      const byDecade = new Map<string, typeof filteredEvents>();
      filteredEvents.forEach(ev => {
        const dec = getDecade(ev.date);
        if (!byDecade.has(dec)) byDecade.set(dec, []);
        byDecade.get(dec)!.push(ev);
      });
      return Array.from(byDecade.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([label, events]) => ({ label, events }));
    }
    if (scale === 'years') {
      const byYear = new Map<string, typeof filteredEvents>();
      filteredEvents.forEach(ev => {
        const y = ev.date.slice(0, 4);
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y)!.push(ev);
      });
      return Array.from(byYear.entries()).sort(([a], [b]) => b.localeCompare(a)).map(([label, events]) => ({ label, events }));
    }
    return [{ label: null as string | null, events: filteredEvents }];
  }, [filteredEvents, scale]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (filterMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) setFilterMenu(null);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [filterMenu]);

  const filterPeopleLabel = filterPersonId ? (getMember(filterPersonId)?.firstName || 'Я') : 'Люди';
  const filterPlacesLabel = filterPlace || 'Места';
  const filterTagsLabel = filterTag || 'Теги';
  const filterTypesLabel = filterType ? typeLabels[filterType] : 'Типы';

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Экран «Таймлайн»"
          onBack={() => navigate(ROUTES.classic.tree)}
          light
          right={
            <button type="button" onClick={() => navigate(ROUTES.classic.invite)} className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поделиться">
              <Send className="h-5 w-5" />
            </button>
          }
        />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
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
          <div className="flex flex-wrap gap-2 mb-4 relative" ref={menuRef}>
            <span className="text-xs text-[var(--proto-text-muted)] self-center mr-1">Фильтры:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterMenu(m => m === 'people' ? null : 'people')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                  filterPersonId ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                <Users className="h-3.5 w-3" /> {filterPeopleLabel}
              </button>
              {filterMenu === 'people' && (
                <div className="absolute top-full left-0 mt-1 py-1 rounded-lg bg-[var(--proto-card)] border border-[var(--proto-border)] shadow-lg z-10 min-w-[140px]">
                  <button type="button" onClick={() => { setFilterPersonId(null); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">Все</button>
                  <button type="button" onClick={() => { setFilterPersonId(currentUserId); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">Только я</button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterMenu(m => m === 'places' ? null : 'places')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                  filterPlace ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                <MapPin className="h-3.5 w-3" /> {filterPlacesLabel}
              </button>
              {filterMenu === 'places' && (
                <div className="absolute top-full left-0 mt-1 py-1 rounded-lg bg-[var(--proto-card)] border border-[var(--proto-border)] shadow-lg z-10 min-w-[160px] max-h-48 overflow-y-auto">
                  <button type="button" onClick={() => { setFilterPlace(null); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">Все</button>
                  {allPlaces.map(pl => (
                    <button key={pl} type="button" onClick={() => { setFilterPlace(pl); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">{pl}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterMenu(m => m === 'tags' ? null : 'tags')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                  filterTag ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                <Tag className="h-3.5 w-3" /> {filterTagsLabel}
              </button>
              {filterMenu === 'tags' && (
                <div className="absolute top-full left-0 mt-1 py-1 rounded-lg bg-[var(--proto-card)] border border-[var(--proto-border)] shadow-lg z-10 min-w-[160px] max-h-48 overflow-y-auto">
                  <button type="button" onClick={() => { setFilterTag(null); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">Все</button>
                  {topicTags.map(t => (
                    <button key={t} type="button" onClick={() => { setFilterTag(t); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">{t}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterMenu(m => m === 'types' ? null : 'types')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {filterTypesLabel}
              </button>
              {filterMenu === 'types' && (
                <div className="absolute top-full left-0 mt-1 py-1 rounded-lg bg-[var(--proto-card)] border border-[var(--proto-border)] shadow-lg z-10 min-w-[120px]">
                  <button type="button" onClick={() => { setFilterType(null); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)]">Все</button>
                  {(['photo', 'video', 'audio', 'text'] as const).map(t => (
                    <button key={t} type="button" onClick={() => { setFilterType(t); setFilterMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-[var(--proto-text)] hover:bg-[var(--proto-bg)] flex items-center gap-2">
                      {t === 'photo' && <FileImage className="h-3.5 w-3" />}
                      {t === 'video' && <FileVideo className="h-3.5 w-3" />}
                      {t === 'audio' && <FileAudio className="h-3.5 w-3" />}
                      {t === 'text' && <FileText className="h-3.5 w-3" />}
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            {groupedByScale.map(({ label, events }) => (
              <div key={label ?? 'flat'} className="space-y-4">
                {label != null && <p className="text-sm font-semibold text-[var(--proto-text-muted)] -ml-8">{label}</p>}
                {events.map((ev) => (
                  <div key={ev.id} className="relative flex gap-4">
                    <span className="absolute -left-[2.25rem] top-1 text-xs font-medium text-[var(--proto-text-muted)]">
                      {formatDateByScale(ev.date, scale)}
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
                        <p className="text-xs text-[var(--proto-text-muted)]">{ev.topic}{ev.place ? ` · ${ev.place}` : ''}</p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {filteredEvents.length === 0 && (
            <p className="text-sm text-[var(--proto-text-muted)] py-4">Нет событий по выбранным фильтрам</p>
          )}
          {mode === 'compare' && filteredEvents.length > 0 && (
            <p className="text-xs text-[var(--proto-text-muted)] mt-4">Режим сравнения: можно выбрать второго человека для сравнения таймлайнов (в разработке).</p>
          )}
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
