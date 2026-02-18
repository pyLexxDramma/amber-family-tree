import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { UnreadMarker } from '@/components/UnreadMarker';
import { mockPublications, allMediaItems, topicTags } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { LayoutList, Grid3X3, SlidersHorizontal, ArrowUpDown, Heart, MessageCircle, Image, Video, Mic } from 'lucide-react';

const Feed: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'publications' | 'media'>('publications');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [density, setDensity] = useState(3);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sorted = [...mockPublications].sort((a, b) =>
    sortOrder === 'new' ? b.publishDate.localeCompare(a.publishDate) : a.publishDate.localeCompare(b.publishDate)
  );

  const mediaCount = (type: string, items: any[]) => items.filter(i => i.type === type).length;

  const heroCard = (pub: typeof sorted[0]) => {
    const author = getMember(pub.authorId);
    const hasMedia = pub.media.length > 0 && pub.media[0]?.type === 'photo';
    const imgUrl = hasMedia
      ? (pub.media[0].url || pub.media[0].thumbnail)
      : `https://picsum.photos/seed/hero${pub.id}/800/1000`;

    return (
      <button
        key={pub.id}
        onClick={() => navigate(`/publication/${pub.id}`)}
        className="w-full text-left relative overflow-hidden"
        style={{ aspectRatio: '3/4' }}
      >
        <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
          {!pub.isRead && (
            <div className="flex items-center gap-2">
              <UnreadMarker />
              <span className="text-white/60 editorial-caption">new</span>
            </div>
          )}
          <h2 className="editorial-title text-white text-2xl">{pub.title}</h2>
          <p className="text-white/70 text-sm font-light line-clamp-2">{pub.text}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/50 text-xs font-light">
              {author?.firstName} {author?.lastName}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/50 text-xs font-light">
              {pub.place}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/50 text-xs font-light">
              {pub.eventDate}
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/40 text-xs mt-1">
            {mediaCount('photo', pub.media) > 0 && <span className="flex items-center gap-1"><Image className="h-3 w-3" />{mediaCount('photo', pub.media)}</span>}
            {mediaCount('video', pub.media) > 0 && <span className="flex items-center gap-1"><Video className="h-3 w-3" />{mediaCount('video', pub.media)}</span>}
            {mediaCount('audio', pub.media) > 0 && <span className="flex items-center gap-1"><Mic className="h-3 w-3" />{mediaCount('audio', pub.media)}</span>}
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{pub.likes.length}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{pub.comments.length}</span>
          </div>
        </div>
      </button>
    );
  };

  const editorialCard = (pub: typeof sorted[0], size: 'full' | 'half') => {
    const author = getMember(pub.authorId);
    const hasPhoto = pub.media.some(m => m.type === 'photo');
    const isTextOnly = pub.type === 'text' || pub.type === 'audio';

    if (isTextOnly) {
      return (
        <button
          key={pub.id}
          onClick={() => navigate(`/publication/${pub.id}`)}
          className={`text-left bg-card rounded-sm overflow-hidden ${size === 'full' ? 'w-full' : 'w-full'}`}
        >
          <div className="p-6 flex flex-col gap-3" style={{ minHeight: size === 'full' ? '240px' : '200px' }}>
            {!pub.isRead && <UnreadMarker />}
            <span className="editorial-caption text-muted-foreground">{pub.topicTag}</span>
            <h3 className="editorial-title text-xl leading-snug">{pub.title}</h3>
            <p className="text-sm font-light text-foreground/70 line-clamp-3 editorial-body">{pub.text}</p>
            <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground font-light">
              <span>{author?.firstName} {author?.lastName}</span>
              <span>·</span>
              <span>{pub.eventDate}</span>
            </div>
          </div>
        </button>
      );
    }

    const firstPhoto = pub.media.find(m => m.type === 'photo');
    const imgUrl = firstPhoto ? (firstPhoto.url || firstPhoto.thumbnail) : `https://picsum.photos/seed/ed${pub.id}/600/400`;

    return (
      <button
        key={pub.id}
        onClick={() => navigate(`/publication/${pub.id}`)}
        className={`text-left relative overflow-hidden rounded-sm ${size === 'full' ? 'w-full' : 'w-full'}`}
        style={{ aspectRatio: size === 'full' ? '16/10' : '1/1' }}
      >
        <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 editorial-overlay" />

        {!pub.isRead && (
          <div className="absolute top-0 left-0 w-0.5 h-full bg-primary" />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="editorial-caption text-white/50 block mb-1">{pub.topicTag}</span>
          <h3 className="editorial-title text-white text-lg leading-tight">{pub.title}</h3>
          {size === 'full' && (
            <p className="text-white/60 text-xs font-light mt-1.5 line-clamp-2">{pub.text}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
            <span>{author?.firstName}</span>
            <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{pub.likes.length}</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" />{pub.comments.length}</span>
          </div>
        </div>
      </button>
    );
  };

  const renderMagazineLayout = () => {
    if (sorted.length === 0) return null;

    const items: React.ReactNode[] = [];
    const [first, ...rest] = sorted;

    items.push(heroCard(first));

    let i = 0;
    while (i < rest.length) {
      const pattern = Math.floor(i / 3) % 2;

      if (pattern === 0) {
        if (i + 1 < rest.length) {
          items.push(
            <div key={`pair-${i}`} className="grid grid-cols-2 gap-1">
              {editorialCard(rest[i], 'half')}
              {editorialCard(rest[i + 1], 'half')}
            </div>
          );
          i += 2;
        } else {
          items.push(editorialCard(rest[i], 'full'));
          i += 1;
        }
      } else {
        items.push(editorialCard(rest[i], 'full'));
        i += 1;
      }
    }

    return <div className="flex flex-col gap-1 pb-4">{items}</div>;
  };

  const masonry = allMediaItems.filter(m => m.type === 'photo' || m.type === 'video');
  const masonryAspects = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]'];

  return (
    <AppLayout>
      <div className="pt-2">
        <div className="px-5 flex items-center justify-between mb-3">
          <h1 className="editorial-title text-xl text-foreground">Feed</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('publications')}
              className={`p-2 rounded-sm transition-colors ${mode === 'publications' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode('media')}
              className={`p-2 rounded-sm transition-colors ${mode === 'media' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 flex items-center gap-3 mb-4">
          <button
            onClick={() => setSortOrder(s => s === 'new' ? 'old' : 'new')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span className="editorial-caption">{sortOrder === 'new' ? 'Newest' : 'Oldest'}</span>
          </button>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="editorial-caption">Filters</span>
          </button>
          {mode === 'media' && (
            <div className="ml-auto flex gap-1">
              {[1, 3, 5].map(d => (
                <button key={d} onClick={() => setDensity(d)} className={`h-5 w-5 rounded-sm text-[10px] font-light ${density === d ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>{d}</button>
              ))}
            </div>
          )}
        </div>

        {mode === 'publications' && renderMagazineLayout()}

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
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle className="editorial-title">Filters</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="editorial-caption text-muted-foreground mb-3">Topic</p>
              <div className="flex flex-wrap gap-2">
                {topicTags.map(t => (
                  <button key={t} className="px-3 py-1.5 text-xs font-light border border-border rounded-sm hover:bg-foreground hover:text-background transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-sm h-11" onClick={() => setFiltersOpen(false)}>Reset</Button>
              <Button className="flex-1 rounded-sm h-11" onClick={() => setFiltersOpen(false)}>Show Results</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Feed;
