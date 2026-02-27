import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getDemoFeedPhotoUrl, getDemoMemberPhotoUrl } from '@/lib/demo-photos';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { UnreadMarker } from '@/components/UnreadMarker';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { mockPublications, allMediaItems, topicTags } from '@/data/mock-publications';
import { getMember, mockMembers, currentUserId, getCurrentUser } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SlidersHorizontal, Heart, Image, Video, Mic, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import iconToListen from '@/assets/icons/icon-to-listen.gif';
import iconWatch from '@/assets/icons/icon-watch.gif';
import iconNewPost from '@/assets/icons/new-post.gif';
import type { Publication } from '@/types';

/** Год из eventDate (например "1985-07-15" -> 1985) для группировки по десятилетиям */
function getDecadeFromEventDate(eventDate: string): string {
  const year = parseInt(eventDate.slice(0, 4), 10);
  const decade = Math.floor(year / 10) * 10;
  return `${decade}-е`;
}

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  useDemoWithPhotos();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const [mode, setMode] = useState<'publications' | 'media'>(viewParam === 'media' ? 'media' : 'publications');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [density, setDensity] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createCtaVisible, setCreateCtaVisible] = useState(false);
  const createCtaRef = useRef<HTMLDivElement>(null);
  const memberAvatar = currentUser ? getDemoMemberPhotoUrl(currentUser.id) : undefined;

  useEffect(() => {
    const el = createCtaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCreateCtaVisible(true); },
      { threshold: 0.2, rootMargin: '0px 0px -20% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = searchParams.get('view');
    setMode(v === 'media' ? 'media' : 'publications');
  }, [searchParams]);

  useEffect(() => {
    const author = searchParams.get('author');
    const participant = searchParams.get('participant');
    if (author) setFilterAuthorId(author);
    if (participant) setFilterParticipantIds(prev => (prev.includes(participant) ? prev : [...prev, participant]));
  }, [searchParams]);

  const setFeedMode = (m: 'publications' | 'media') => {
    setMode(m);
    if (m === 'media') setSearchParams({ view: 'media' }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const [filterAuthorId, setFilterAuthorId] = useState<string | null>(null);
  const [filterParticipantIds, setFilterParticipantIds] = useState<string[]>([]);
  const [filterPublishFrom, setFilterPublishFrom] = useState('');
  const [filterPublishTo, setFilterPublishTo] = useState('');
  const [filterEventFrom, setFilterEventFrom] = useState('');
  const [filterEventTo, setFilterEventTo] = useState('');
  const [filterTopicTag, setFilterTopicTag] = useState<string | null>(null);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);

  const sorted = [...mockPublications].sort((a, b) =>
    sortOrder === 'new' ? b.publishDate.localeCompare(a.publishDate) : a.publishDate.localeCompare(b.publishDate)
  );

  const filtered = sorted.filter(pub => {
    if (filterAuthorId && pub.authorId !== filterAuthorId) return false;
    if (filterParticipantIds.length && !filterParticipantIds.some(id => pub.participantIds.includes(id))) return false;
    if (filterPublishFrom && pub.publishDate < filterPublishFrom) return false;
    if (filterPublishTo && pub.publishDate > filterPublishTo) return false;
    if (filterEventFrom && pub.eventDate < filterEventFrom) return false;
    if (filterEventTo && pub.eventDate > filterEventTo) return false;
    if (filterTopicTag && pub.topicTag !== filterTopicTag) return false;
    if (filterFavorite && !pub.likes.includes(currentUserId)) return false;
    if (filterUnread && !pub.isRead) return false;
    return true;
  });

  const unreadCount = mockPublications.filter(pub => !pub.isRead).length;

  const hasActiveFilters = !!(filterAuthorId || filterParticipantIds.length || filterPublishFrom || filterPublishTo || filterEventFrom || filterEventTo || filterTopicTag || filterFavorite || filterUnread);

  const resetFilters = () => {
    setFilterAuthorId(null);
    setFilterParticipantIds([]);
    setFilterPublishFrom('');
    setFilterPublishTo('');
    setFilterEventFrom('');
    setFilterEventTo('');
    setFilterTopicTag(null);
    setFilterFavorite(false);
    setFilterUnread(false);
  };

  const toggleParticipant = (id: string) => {
    setFilterParticipantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const feedPublicationCard = (pub: typeof sorted[0]) => {
    const author = getMember(pub.authorId);
    const firstPhoto = pub.media.find(m => m.type === 'photo');
    const imgUrl = firstPhoto ? (firstPhoto.url || firstPhoto.thumbnail) : getDemoFeedPhotoUrl(parseInt(pub.id.replace(/\D/g, '') || '1', 10));

    return (
      <button
        key={pub.id}
        onClick={() => navigate(ROUTES.classic.publication(pub.id))}
        className="content-card feed-card-block overflow-hidden text-left rounded-2xl w-full aspect-[4/5] block"
      >
        <div className="relative w-full h-full">
          <img src={imgUrl} alt={pub.title || ''} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 h-[33.333%] min-h-[4.25rem] p-2.5 feed-card-overlay flex flex-col justify-end">
            <p className="feed-card-overlay-title text-white leading-tight line-clamp-2">
              {pub.title || pub.text}
            </p>
            <p className="feed-card-overlay-caption text-white/90 mt-0.5 truncate">
              {author ? `${author.firstName} ${author.lastName}` : ''}
            </p>
          </div>
        </div>
      </button>
    );
  };

  const createPublicationBlock = () => (
    <div
      ref={createCtaRef}
      className={`feed-create-block transition-all duration-500 ${createCtaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <button
        type="button"
        onClick={() => navigate(ROUTES.classic.create)}
        className="content-card feed-card-block overflow-hidden rounded-2xl w-full aspect-[4/5] block text-foreground relative"
      >
        <div className="feed-create-block-border rounded-2xl p-[3px] w-full h-full min-h-0 flex flex-col items-center justify-center absolute inset-0">
          <span className="feed-create-block-inner rounded-[14px] w-full h-full min-h-0 flex flex-col items-center justify-center bg-white">
            <img src={iconNewPost} alt="Создать публикацию" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
          </span>
        </div>
      </button>
    </div>
  );

  const renderMagazineLayout = () => {
    if (filtered.length === 0) return null;

    const col0 = filtered.filter((_, i) => i % 2 === 0);
    const col1 = filtered.filter((_, i) => i % 2 === 1);

    const renderColumn = (items: typeof filtered, columnIndex: number) => (
      <div key={columnIndex} className={`feed-masonry-col ${columnIndex === 1 ? 'feed-masonry-col--offset' : ''}`}>
        {items.map(pub => feedPublicationCard(pub))}
        {columnIndex === 1 && createPublicationBlock()}
      </div>
    );

    return (
      <div className="px-3 pb-4">
        <div className="feed-masonry">
          {renderColumn(col0, 0)}
          {renderColumn(col1, 1)}
        </div>
      </div>
    );
  };

  /** Вариант 1: Классический семейный архив — витрина (лента альбомов) */
  const renderClassicShowcase = () => {
    if (filtered.length === 0) return null;
    const [feat1, feat2, mainEvent, ...rest] = filtered;
    const main = mainEvent || feat2;
    const cardPub = rest[0] || feat2;

    const albumCard = (pub: Publication, label: string, sublabel: string, big = false) => {
      const hasPhoto = pub.media.some(m => m.type === 'photo');
      const imgUrl = hasPhoto ? (pub.media.find(m => m.type === 'photo')!.url || pub.media.find(m => m.type === 'photo')!.thumbnail) : getDemoFeedPhotoUrl(parseInt(pub.id.replace(/\D/g, '') || '1', 10));
      return (
        <button key={pub.id} onClick={() => navigate(ROUTES.classic.publication(pub.id))} className={`content-card overflow-hidden text-left rounded-2xl ${big ? 'aspect-[3/4]' : 'aspect-square'}`}>
          <div className="relative w-full h-full">
            <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 editorial-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-4 photo-card-text">
              <p className="editorial-caption text-white/80">{label}</p>
              <p className="text-white font-semibold text-lg">{sublabel}</p>
              <p className="text-white/70 text-sm mt-0.5">{pub.eventDate?.slice(0, 7) || ''}</p>
            </div>
          </div>
        </button>
      );
    };

    return (
      <div className="space-y-6 pb-6">
        <h2 className="section-title text-center tracking-widest py-2 px-3">СЕМЕЙНЫЙ АЛЬБОМ</h2>

        <div className="flex flex-col gap-4">
          {feat1 && albumCard(feat1, 'ФОТО 2024', feat1.title, true)}
          {feat2 && albumCard(feat2, 'ЛЕТО 2023', feat2.title, true)}
        </div>

        {main && (
          <div className="content-card rounded-2xl overflow-hidden min-h-[96px]">
            <p className="editorial-caption text-primary px-4 pt-4">Главное событие месяца</p>
            <div className="flex items-center gap-2 px-4 pb-4">
              <button type="button" className="touch-target p-2 rounded-xl hover:bg-primary/10 transition-colors" aria-label="Назад"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => navigate(ROUTES.classic.publication(main.id))} className="flex-1 text-left py-2">
                <span className="font-semibold text-foreground">{main.title}</span>
              </button>
              <button type="button" className="touch-target p-2 rounded-xl hover:bg-primary/10 transition-colors" aria-label="Вперёд"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <button onClick={() => navigate(ROUTES.classic.publication(main.id))} className="block w-full relative aspect-[16/10]">
              <img src={main.media[0]?.type === 'photo' ? (main.media[0].url || main.media[0].thumbnail) : getDemoFeedPhotoUrl(parseInt(main.id.replace(/\D/g, '') || '1', 10))} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 editorial-overlay" />
            </button>
          </div>
        )}

        {cardPub && (
          <button onClick={() => navigate(ROUTES.classic.publication(cardPub.id))} className="content-card w-full flex items-center gap-4 min-h-[96px] p-5 rounded-2xl text-left">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img src={cardPub.media[0]?.type === 'photo' ? (cardPub.media[0].url || cardPub.media[0].thumbnail) : getDemoFeedPhotoUrl(parseInt(cardPub.id.replace(/\D/g, '') || '1', 10))} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{cardPub.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{cardPub.topicTag}</p>
            </div>
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <Heart className="h-4 w-4" /> {cardPub.likes.length}
            </span>
          </button>
        )}

        <Button className="create-cta-animated" onClick={() => navigate(ROUTES.classic.create)}>
          <Plus className="h-6 w-6" /> СОЗДАТЬ ПУБЛИКАЦИЮ
        </Button>
      </div>
    );
  };

  /** Вариант 3: Календарь воспоминаний — лента по годам */
  const renderCalendarByYears = () => {
    const byDecade: Record<string, Publication[]> = {};
    filtered.forEach(pub => {
      const decade = getDecadeFromEventDate(pub.eventDate || pub.publishDate);
      if (!byDecade[decade]) byDecade[decade] = [];
      byDecade[decade].push(pub);
    });
    const decades = Object.keys(byDecade).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    return (
      <div className="space-y-8 pb-8">
        {decades.map(decade => (
          <div key={decade}>
            <h2 className="section-title text-primary mb-4 px-3">{decade}</h2>
            <div className="space-y-4">
              {byDecade[decade].map(pub => {
                const year = (pub.eventDate || pub.publishDate).slice(0, 4);
                const firstPhoto = pub.media.find(m => m.type === 'photo');
                const imgUrl = firstPhoto ? (firstPhoto.url || firstPhoto.thumbnail) : getDemoFeedPhotoUrl(parseInt(pub.id.replace(/\D/g, '') || '1', 10));
                return (
                  <button key={pub.id} onClick={() => navigate(ROUTES.classic.publication(pub.id))} className="content-card w-full flex items-center gap-4 min-h-[96px] p-5 rounded-2xl text-left">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/30">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{year}: {pub.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{pub.place}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full min-h-[96px] rounded-2xl font-semibold">
          ↓ ЗАГРУЗИТЬ СТАРЫЕ ФОТО
        </Button>
        <Button className="create-cta-animated" onClick={() => navigate(ROUTES.classic.create)}>
          <Plus className="h-6 w-6" /> СОЗДАТЬ ПУБЛИКАЦИЮ
        </Button>
      </div>
    );
  };

  const showNoResults = hasActiveFilters && filtered.length === 0 && sorted.length > 0;
  const showEmptyFeed = sorted.length === 0;

  const masonry = allMediaItems.filter(m => m.type === 'photo' || m.type === 'video');
  const masonryAspects = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]'];

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-gradient-to-b from-[#f8f3ec] via-[#f4f1ec] to-[#e5e1dc] feed-page-bg">
        <div className="feed-topbar-enter">
          <TopBar
            title={currentUser ? `Привет, ${currentUser.firstName}!` : 'Семейный альбом'}
            subtitle={unreadCount ? `У тебя ${unreadCount} новых воспоминаний` : 'Моменты и воспоминания'}
            avatarUrl={memberAvatar}
            sticky={false}
            transparent
            right={
              <button
                onClick={() => setFiltersOpen(true)}
                className="touch-target h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-colors"
                aria-label="Фильтры"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            }
          />
        </div>
        <div className="px-0 pt-2 pb-4 feed-page-enter">
          <div className="feed-page-enter-stagger">
            <div>
              <div className="px-3 pb-4">
                <div className="space-y-3">
              <div className="feed-row-cream-border rounded-2xl p-[3px]">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-[14px] bg-primary/8 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <Image className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">Новые фото в альбоме</p>
                    </div>
                  </div>
                  <span className="feed-cta-shimmer-border inline-flex rounded-xl p-[2px] flex-shrink-0">
                    <img src={iconWatch} alt="Открыть" className="h-10 sm:h-12 w-auto touch-target rounded-[10px]" />
                  </span>
                </button>
              </div>
              <div className="feed-row-cream-border rounded-2xl p-[3px]">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-[14px] bg-primary/4 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-foreground">Новая аудио-история</p>
                    </div>
                  </div>
                  <span className="feed-cta-shimmer-border inline-flex rounded-xl p-[2px] flex-shrink-0">
                    <img src={iconToListen} alt="Слушать" className="h-10 sm:h-12 w-auto touch-target rounded-[10px]" />
                  </span>
                </button>
              </div>
            </div>
              </div>
            </div>
            <div>
        {mode === 'publications' && showNoResults && (
          <div className="px-3 py-12 text-center">
            <p className="editorial-caption text-muted-foreground">Нет результатов</p>
            <p className="text-sm font-light text-muted-foreground mt-1">Измените параметры фильтров</p>
            <Button variant="outline" className="mt-4 rounded-sm" onClick={() => { resetFilters(); setFiltersOpen(false); }}>Сбросить фильтры</Button>
          </div>
        )}
        {mode === 'publications' && !showNoResults && renderMagazineLayout()}

          {mode === 'publications' && showEmptyFeed && (
            <div className="px-3 py-12 text-center">
              <p className="editorial-title text-lg">Создайте первую историю</p>
              <p className="text-sm font-light text-muted-foreground mt-2">Добавьте публикацию или пригласите близких</p>
              <div className="flex gap-3 justify-center mt-6">
                <Button className="rounded-sm" onClick={() => navigate(ROUTES.classic.create)}>Создать</Button>
                <Button variant="outline" className="rounded-sm" onClick={() => navigate(ROUTES.classic.invite)}>Пригласить</Button>
              </div>
            </div>
          )}

          {mode === 'media' && (
            <div className="px-0.5">
              <div className={`grid gap-0.5 pb-4`} style={{ gridTemplateColumns: `repeat(${density}, 1fr)` }}>
                {masonry.slice(0, 60).map((item, idx) => (
                  <div key={item.id} className={`relative overflow-hidden bg-muted ${density === 1 ? 'aspect-[16/10]' : masonryAspects[idx % masonryAspects.length]}`}>
                    <img src={item.thumbnail || item.url} alt={item.name} className="h-full w-full object-cover" />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Video className="h-5 w-5 text-white/80" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle className="editorial-title">Фильтры</SheetTitle></SheetHeader>
            <div className="space-y-5 py-4">
              <div>
                <p className="editorial-caption text-muted-foreground mb-2">Автор</p>
                <div className="flex flex-wrap gap-2">
                  {mockMembers.slice(0, 12).map(m => (
                    <button key={m.id} onClick={() => setFilterAuthorId(filterAuthorId === m.id ? null : m.id)} className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${filterAuthorId === m.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {m.nickname || m.firstName}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="editorial-caption text-muted-foreground mb-2">Участники</p>
                <div className="flex flex-wrap gap-2">
                  {mockMembers.slice(0, 10).map(m => (
                    <button key={m.id} onClick={() => toggleParticipant(m.id)} className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${filterParticipantIds.includes(m.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {m.nickname || m.firstName}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="editorial-caption text-muted-foreground mb-1">Дата публикации от</p>
                  <input type="date" value={filterPublishFrom} onChange={e => setFilterPublishFrom(e.target.value)} className="w-full h-9 px-2 text-sm border border-border rounded-sm bg-background" />
                </div>
                <div>
                  <p className="editorial-caption text-muted-foreground mb-1">до</p>
                  <input type="date" value={filterPublishTo} onChange={e => setFilterPublishTo(e.target.value)} className="w-full h-9 px-2 text-sm border border-border rounded-sm bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="editorial-caption text-muted-foreground mb-1">Дата события от</p>
                  <input type="date" value={filterEventFrom} onChange={e => setFilterEventFrom(e.target.value)} className="w-full h-9 px-2 text-sm border border-border rounded-sm bg-background" />
                </div>
                <div>
                  <p className="editorial-caption text-muted-foreground mb-1">до</p>
                  <input type="date" value={filterEventTo} onChange={e => setFilterEventTo(e.target.value)} className="w-full h-9 px-2 text-sm border border-border rounded-sm bg-background" />
                </div>
              </div>
              <div>
                <p className="editorial-caption text-muted-foreground mb-2">Тег темы</p>
                <div className="flex flex-wrap gap-2">
                  {topicTags.map(t => (
                    <button key={t} onClick={() => setFilterTopicTag(filterTopicTag === t ? null : t)} className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${filterTopicTag === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterFavorite} onChange={e => setFilterFavorite(e.target.checked)} className="rounded border-border" />
                  <span className="text-sm font-light">Избранное</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterUnread} onChange={e => setFilterUnread(e.target.checked)} className="rounded border-border" />
                  <span className="text-sm font-light">Непрочитанное</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-2xl h-11" onClick={() => { resetFilters(); setFiltersOpen(false); }}>Сбросить</Button>
                <Button className="flex-1 rounded-2xl h-11" onClick={() => setFiltersOpen(false)}>Показать</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
};

export default Feed;
