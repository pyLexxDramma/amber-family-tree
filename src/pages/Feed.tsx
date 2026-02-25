import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getDemoFeedPhotoUrl } from '@/lib/demo-photos';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { UnreadMarker } from '@/components/UnreadMarker';
import { useUIVariant } from '@/contexts/UIVariantContext';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { mockPublications, allMediaItems, topicTags } from '@/data/mock-publications';
import { getMember, mockMembers, currentUserId } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LayoutList, Grid3X3, SlidersHorizontal, ArrowUpDown, Heart, MessageCircle, Image, Video, Mic, ChevronLeft, ChevronRight, Plus, Send } from 'lucide-react';
import type { Publication } from '@/types';

/** Год из eventDate (например "1985-07-15" -> 1985) для группировки по десятилетиям */
function getDecadeFromEventDate(eventDate: string): string {
  const year = parseInt(eventDate.slice(0, 4), 10);
  const decade = Math.floor(year / 10) * 10;
  return `${decade}-е`;
}

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { variant: uiVariant } = useUIVariant();
  useDemoWithPhotos();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const [mode, setMode] = useState<'publications' | 'media'>(viewParam === 'media' ? 'media' : 'publications');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [density, setDensity] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const mediaCount = (type: string, items: { type: string }[]) => items.filter(i => i.type === type).length;

  const feedCard = (pub: typeof sorted[0], isFirst = false) => {
    const author = getMember(pub.authorId);
    const hasMedia = pub.media.length > 0 && pub.media[0]?.type === 'photo';
    const imgUrl = isFirst
      ? '/bg-4.png'
      : (hasMedia ? (pub.media[0].url || pub.media[0].thumbnail) : getDemoFeedPhotoUrl(parseInt(pub.id.replace(/\D/g, '') || '1', 10)));

    return (
      <button
        key={pub.id}
        onClick={() => navigate(ROUTES.classic.publication(pub.id))}
        className="w-full text-left relative overflow-hidden rounded-2xl"
        style={{ aspectRatio: '3/4' }}
      >
        <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 editorial-overlay" />

        <div className="absolute right-3 top-1/3 flex flex-col items-center gap-4 z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">{pub.likes.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">{pub.comments.length}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Send className="h-4 w-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">
              {mediaCount('photo', pub.media) + mediaCount('video', pub.media)}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-14 p-5 flex flex-col gap-1.5 photo-card-text">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-full bg-muted/50 overflow-hidden ring-1 ring-white/20 shrink-0">
              {author?.photo ? <img src={author.photo} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-white text-xs font-semibold">{author?.firstName?.charAt(0)}</span>}
            </div>
            <span className="text-white font-semibold text-sm">{author?.firstName} {author?.lastName}</span>
          </div>
          <p className="text-white/80 text-sm font-normal line-clamp-2">{pub.text || pub.title}</p>
          {pub.topicTag && (
            <p className="text-primary/80 text-xs font-medium mt-0.5">#{pub.topicTag.replace(/\s+/g, '')}  #Memories  #Family</p>
          )}
        </div>
      </button>
    );
  };

  const smallCard = (pub: typeof sorted[0]) => {
    const author = getMember(pub.authorId);
    const firstPhoto = pub.media.find(m => m.type === 'photo');
    const imgUrl = firstPhoto ? (firstPhoto.url || firstPhoto.thumbnail) : getDemoFeedPhotoUrl(parseInt(pub.id.replace(/\D/g, '') || '1', 10));

    return (
      <button
        key={pub.id}
        onClick={() => navigate(ROUTES.classic.publication(pub.id))}
        className="text-left relative overflow-hidden rounded-2xl w-full"
        style={{ aspectRatio: '16/10' }}
      >
        <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-4 photo-card-text">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-muted/50 overflow-hidden ring-1 ring-white/20 shrink-0">
              {author?.photo ? <img src={author.photo} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-white text-[10px] font-semibold">{author?.firstName?.charAt(0)}</span>}
            </div>
            <span className="text-white font-medium text-xs">{author?.firstName}</span>
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight">{pub.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-white/50 text-xs">
            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{pub.likes.length}</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{pub.comments.length}</span>
          </div>
        </div>
      </button>
    );
  };

  const renderMagazineLayout = () => {
    if (filtered.length === 0) return null;

    const [first, ...rest] = filtered;

    return (
      <div className="flex flex-col gap-4 px-3 pb-4">
        {feedCard(first, true)}
        <div className="grid grid-cols-2 gap-3">
          {rest.map(pub => smallCard(pub))}
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

        <Button className="w-full min-h-[96px] text-lg font-semibold rounded-2xl gap-2" onClick={() => navigate(ROUTES.classic.create)}>
          <Plus className="h-6 w-6" /> ДОБАВИТЬ ФОТО
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
      </div>
    );
  };

  const showNoResults = hasActiveFilters && filtered.length === 0 && sorted.length > 0;
  const showEmptyFeed = sorted.length === 0;

  const masonry = allMediaItems.filter(m => m.type === 'photo' || m.type === 'video');
  const masonryAspects = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]'];

  return (
    <AppLayout>
      <TopBar
        title="Семейный альбом"
        subtitle="Моменты и воспоминания"
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFeedMode('publications')}
              className={`touch-target h-9 w-9 rounded-full flex items-center justify-center transition-colors ${mode === 'publications' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Публикации"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFeedMode('media')}
              className={`touch-target h-9 w-9 rounded-full flex items-center justify-center transition-colors ${mode === 'media' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Медиа"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFiltersOpen(true)}
              className="touch-target h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-colors"
              aria-label="Фильтры"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <div className="px-0 pt-2 pb-4 page-enter">
        {uiVariant !== 'current' && mode === 'publications' && (
          <p className="text-sm font-semibold text-primary/90 mb-2 px-3" role="status">
            Вариант: {uiVariant === 'classic' ? 'Классический архив' : uiVariant === 'calendar' ? 'Календарь воспоминаний' : uiVariant === 'living' ? 'Живая история' : uiVariant === 'journal' ? 'Журнал + Плеер' : uiVariant === 'minimal' ? 'Минимализм' : uiVariant === 'retro' ? 'Ретро' : 'Текущий'}
          </p>
        )}
        {(['living','journal','minimal','retro'] as const).includes(uiVariant as 'living' | 'journal' | 'minimal' | 'retro') && mode === 'publications' && (
          <p className="text-xs text-muted-foreground mb-3 px-3">Откройте любую публикацию — просмотр в выбранном стиле</p>
        )}
        {uiVariant !== 'classic' && uiVariant !== 'calendar' && (
          <p className="section-title text-primary mb-3 px-3">{mode === 'publications' ? 'Публикации' : 'Медиа'}</p>
        )}

        {(uiVariant !== 'classic' && uiVariant !== 'calendar') && (
        <div className="flex items-center gap-3 mb-4 px-3">
          <button
            onClick={() => setSortOrder(s => s === 'new' ? 'old' : 'new')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span className="editorial-caption">{sortOrder === 'new' ? 'Сначала новые' : 'Сначала старые'}</span>
          </button>
          {mode === 'media' && (
            <div className="ml-auto flex gap-1">
              {[1, 3, 5].map(d => (
                <button key={d} onClick={() => setDensity(d)} className={`h-5 w-5 rounded-sm text-[10px] font-light ${density === d ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>{d}</button>
              ))}
            </div>
          )}
        </div>
        )}

        {mode === 'publications' && showNoResults && (
          <div className="px-3 py-12 text-center">
            <p className="editorial-caption text-muted-foreground">Нет результатов</p>
            <p className="text-sm font-light text-muted-foreground mt-1">Измените параметры фильтров</p>
            <Button variant="outline" className="mt-4 rounded-sm" onClick={() => { resetFilters(); setFiltersOpen(false); }}>Сбросить фильтры</Button>
          </div>
        )}
        {mode === 'publications' && !showNoResults && uiVariant === 'classic' && renderClassicShowcase()}
        {mode === 'publications' && !showNoResults && uiVariant === 'calendar' && renderCalendarByYears()}
        {mode === 'publications' && !showNoResults && uiVariant !== 'classic' && uiVariant !== 'calendar' && renderMagazineLayout()}

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
    </AppLayout>
  );
};

export default Feed;
