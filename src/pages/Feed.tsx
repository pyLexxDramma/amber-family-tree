import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { TopicTag } from '@/components/TopicTag';
import { UnreadMarker } from '@/components/UnreadMarker';
import { mockPublications, allMediaItems, topicTags } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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

  return (
    <AppLayout>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Feed</h1>
          <div className="flex items-center gap-2">
            <Button variant={mode === 'publications' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-3" onClick={() => setMode('publications')}>
              <LayoutList className="h-3.5 w-3.5 mr-1" /> Posts
            </Button>
            <Button variant={mode === 'media' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-3" onClick={() => setMode('media')}>
              <Grid3X3 className="h-3.5 w-3.5 mr-1" /> Media
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={() => setSortOrder(s => s === 'new' ? 'old' : 'new')}>
            <ArrowUpDown className="h-3 w-3 mr-1" /> {sortOrder === 'new' ? 'Newest' : 'Oldest'}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-3 w-3 mr-1" /> Filters
          </Button>
          {mode === 'media' && (
            <div className="ml-auto flex gap-1">
              {[1, 3, 5].map(d => (
                <button key={d} onClick={() => setDensity(d)} className={`h-6 w-6 rounded text-xs font-medium ${density === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{d}</button>
              ))}
            </div>
          )}
        </div>

        {/* Publications mode */}
        {mode === 'publications' && (
          <div className="space-y-3 pb-4">
            {sorted.map(pub => {
              const author = getMember(pub.authorId);
              return (
                <button key={pub.id} onClick={() => navigate(`/publication/${pub.id}`)} className="w-full text-left flex gap-3 rounded-2xl bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
                  {/* Media preview */}
                  <div className="w-[40%] flex-shrink-0 rounded-xl overflow-hidden bg-muted aspect-[4/3]">
                    {pub.media[0]?.thumbnail ? (
                      <img src={pub.media[0].thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-2xl">📝</div>
                    )}
                  </div>
                  {/* Text/meta */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        {!pub.isRead && <UnreadMarker />}
                        <span className="text-[10px] text-muted-foreground">{new Date(pub.publishDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-semibold leading-tight truncate">{pub.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{pub.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-muted-foreground">
                      <AvatarPlaceholder name={author ? `${author.firstName} ${author.lastName}` : ''} size="sm" />
                      <div className="flex items-center gap-2 text-[10px]">
                        {mediaCount('photo', pub.media) > 0 && <span className="flex items-center gap-0.5"><Image className="h-3 w-3" />{mediaCount('photo', pub.media)}</span>}
                        {mediaCount('video', pub.media) > 0 && <span className="flex items-center gap-0.5"><Video className="h-3 w-3" />{mediaCount('video', pub.media)}</span>}
                        {mediaCount('audio', pub.media) > 0 && <span className="flex items-center gap-0.5"><Mic className="h-3 w-3" />{mediaCount('audio', pub.media)}</span>}
                        <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{pub.likes.length}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" />{pub.comments.length}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Media mode */}
        {mode === 'media' && (
          <div className={`grid gap-1 pb-4`} style={{ gridTemplateColumns: `repeat(${density}, 1fr)` }}>
            {allMediaItems.filter(m => m.type === 'photo' || m.type === 'video').slice(0, 50).map(item => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={item.thumbnail || item.url} alt={item.name} className="h-full w-full object-cover" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Topic</p>
              <div className="flex flex-wrap gap-2">
                {topicTags.map(t => <TopicTag key={t} tag={t} />)}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setFiltersOpen(false)}>Reset</Button>
              <Button className="flex-1 rounded-xl" onClick={() => setFiltersOpen(false)}>Show Results</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Feed;
