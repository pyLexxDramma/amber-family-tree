import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getPrototypePublicationPhotoByTopic, getPrototypePublicationPhotoBySeed } from '@/lib/prototype-assets';
import { topicTags } from '@/data/mock-publications';
import { currentUserId, getMember } from '@/data/mock-members';
import { Users, MapPin, Tag, Send, FileImage, FileVideo, FileAudio, FileText, Sparkles, Heart, Cake, Trophy } from 'lucide-react';
import type { Publication } from '@/types';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import { getMilestoneIds } from '@/lib/milestones';

type Scale = 'decades' | 'years';
type PubType = Publication['type'];
type FocusMode = 'all' | 'key';

const typeLabels: Record<PubType, string> = {
  photo: 'Фото',
  video: 'Видео',
  audio: 'Аудио',
  text: 'Текст',
};

const publishDateOf = (p: Publication) => (p as { publishDate?: string; publish_date?: string }).publishDate ?? (p as { publish_date?: string }).publish_date ?? '';
const eventDateOf = (p: Publication) => (p as { eventDate?: string; event_date?: string }).eventDate ?? (p as { event_date?: string }).event_date ?? (publishDateOf(p) ? publishDateOf(p).slice(0, 10) : '');
const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id ?? '';
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];

function buildEvents(pubs: Publication[]) {
  return pubs.map(p => ({
    id: p.id,
    date: eventDateOf(p),
    title: p.title || 'Событие',
    subtitle: p.text || '',
    topic: p.topicTag,
    place: p.place,
    type: p.type,
    authorId: authorIdOf(p),
    participantIds: participantIdsOf(p),
    thumb: p.media.find(m => m.type === 'photo')?.thumbnail
      || p.media.find(m => m.type === 'photo')?.url
      || p.media.find(m => m.thumbnail)?.thumbnail
      || getPrototypePublicationPhotoBySeed(p.id, 0).src,
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
}

const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState<Scale>('years');
  const [focus, setFocus] = useState<FocusMode>('all');
  const [filterPersonId, setFilterPersonId] = useState<string | null>(null);
  const [filterPlace, setFilterPlace] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<PubType | null>(null);
  const [filterMenu, setFilterMenu] = useState<'people' | 'places' | 'tags' | 'types' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [baseEvents, setBaseEvents] = useState<ReturnType<typeof buildEvents>>([]);
  const [allPlaces, setAllPlaces] = useState<string[]>([]);
  const [milestoneVer, setMilestoneVer] = useState(0);

  useEffect(() => {
    api.feed.list().then(pubs => {
      setBaseEvents(buildEvents(pubs));
      setAllPlaces([...new Set(pubs.map(p => (p as { place?: string }).place).filter(Boolean))] as string[]);
    });
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

  const filteredEvents = useMemo(() => {
    return baseEvents.filter(ev => {
      if (filterPersonId && ev.authorId !== filterPersonId && !ev.participantIds.includes(filterPersonId)) return false;
      if (filterPlace && ev.place !== filterPlace) return false;
      if (filterTag && ev.topic !== filterTag) return false;
      if (filterType && ev.type !== filterType) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseEvents, filterPersonId, filterPlace, filterTag, filterType]);

  const milestoneIds = useMemo(() => getMilestoneIds(), [milestoneVer]);
  const focusEvents = useMemo(() => {
    if (focus === 'all') return filteredEvents;
    if (milestoneIds.length === 0) return [];
    const set = new Set(milestoneIds);
    return filteredEvents.filter(ev => set.has(ev.id));
  }, [filteredEvents, focus, milestoneIds]);

  const cards = useMemo(() => {
    if (scale === 'years') {
      const byYear = new Map<string, typeof focusEvents>();
      focusEvents.forEach((ev) => {
        const y = ev.date.slice(0, 4);
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y)!.push(ev);
      });
      return Array.from(byYear.entries())
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([y, evs]) => ({
          key: y,
          id: evs[0]?.id,
          title: y,
          subtitle: focus === 'key' ? `${evs.length} избранных` : `${evs.length} событий`,
          thumb: evs[0]?.thumb,
          topicTag: evs[0]?.topic,
          onClick: () => navigate(`${ROUTES.classic.timelineYear(y)}?focus=${focus}`),
        }));
    }

    const byDecade = new Map<number, typeof focusEvents>();
    focusEvents.forEach((ev) => {
      const y = parseInt(ev.date.slice(0, 4), 10);
      if (!Number.isFinite(y)) return;
      const d = Math.floor(y / 10) * 10;
      if (!byDecade.has(d)) byDecade.set(d, []);
      byDecade.get(d)!.push(ev);
    });
    return Array.from(byDecade.entries())
      .sort(([a], [b]) => b - a)
      .map(([d, evs]) => ({
        key: String(d),
        id: evs[0]?.id,
        title: `${d}-е`,
        subtitle: focus === 'key' ? `${evs.length} избранных` : `${evs.length} событий`,
        thumb: evs[0]?.thumb,
        topicTag: evs[0]?.topic,
        onClick: () => navigate(`${ROUTES.classic.timelineDecade(String(d))}?focus=${focus}`),
      }));
  }, [focus, focusEvents, navigate, scale]);

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

  if (isDemoMode()) {
    const events = [...baseEvents].sort((a, b) => b.date.localeCompare(a.date));
    const iconFor = (topic: string) => {
      if (topic === 'Праздники' || topic === 'День рождения') return Cake;
      if (topic === 'Истории') return Trophy;
      if (topic === 'Путешествия') return Sparkles;
      return Heart;
    };

    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <TopBar title="Семейная хроника" onBack={() => navigate(-1)} light right={null} />
          <div className="mx-auto max-w-full px-4 pt-4 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
            <div className="relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-[#D8D2CA]" />
              <div className="space-y-4">
                {events.map((ev) => {
                  const Icon = iconFor(ev.topic);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => navigate(ROUTES.classic.publication(ev.id))}
                      className="w-full text-left flex items-start gap-4"
                    >
                      <span className="relative z-10 mt-3 h-8 w-8 rounded-2xl bg-[#A39B8A] text-white flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 rounded-2xl bg-white border border-[var(--proto-border)] p-4 hover:border-[var(--proto-active)]/40 transition-colors">
                        <span className="block text-xs font-semibold text-[#A39B8A]">{formatDateByScale(ev.date, 'years')}</span>
                        <span className="block text-sm font-semibold text-[var(--proto-text)] mt-1">{ev.title}</span>
                        {ev.subtitle ? (
                          <span className="block text-xs text-[var(--proto-text-muted)] mt-1 line-clamp-2">{ev.subtitle}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              {events.length === 0 && (
                <p className="text-sm text-[var(--proto-text-muted)] py-12 text-center">
                  Нет событий
                </p>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Таймлайн"
          onBack={() => navigate(-1)}
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
            {(['years', 'decades'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  scale === s ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {s === 'years' ? 'Годы' : 'Десятилетия'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(['key', 'all'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFocus(m)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  focus === m ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
                }`}
              >
                {m === 'key' ? 'Ключевые' : 'Все'}
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
          {focus === 'key' && focusEvents.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-5">
              <p className="text-sm font-semibold text-[var(--proto-text)]">Пока нет ключевых событий</p>
              <p className="text-sm text-[var(--proto-text-muted)] mt-2">
                Откройте публикацию и нажмите «Важное», чтобы добавить её в избранное. Тогда она появится здесь.
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.feed)}
                className="mt-4 h-11 px-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                Перейти в ленту
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cards.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={c.onClick}
                    className="w-full rounded-2xl bg-white border border-[var(--proto-border)] overflow-hidden text-left hover:border-[var(--proto-active)]/40 transition-colors flex items-stretch"
                  >
                    <div className="w-24 shrink-0 bg-[var(--proto-border)]">
                      {c.thumb ? (
                        <img
                          src={c.thumb}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoBySeed(c.id || c.key, 0).src; }}
                        />
                      ) : (
                        <img src={getPrototypePublicationPhotoBySeed(c.id || c.key, 0).src} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-lg font-semibold text-[var(--proto-text)]">{c.title}</p>
                      <p className="text-sm text-[var(--proto-text-muted)]">{c.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
              {cards.length === 0 && (
                <p className="text-sm text-[var(--proto-text-muted)] py-4">Нет событий</p>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TimelinePage;
