import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPublications } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, MapPin, Calendar, Play, Mic, Edit, Trash2, EyeOff } from 'lucide-react';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pub = mockPublications.find(p => p.id === id);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  if (!pub) return <div className="p-6 text-center text-muted-foreground">Publication not found</div>;

  const author = getMember(pub.authorId);
  const photos = pub.media.filter(m => m.type === 'photo');
  const videos = pub.media.filter(m => m.type === 'video');
  const audios = pub.media.filter(m => m.type === 'audio');

  const heroImg = photos[0] || (videos[0] ? videos[0] : null);
  const heroUrl = heroImg
    ? (heroImg.url || heroImg.thumbnail || `https://picsum.photos/seed/det${pub.id}/800/1000`)
    : `https://picsum.photos/seed/det${pub.id}/800/1000`;

  const lightboxImages = photos.map(p => ({
    url: p.url || p.thumbnail || '',
    caption: p.name,
  }));

  return (
    <div className="min-h-screen bg-background">
      {lightboxIndex !== null && (
        <PhotoLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Hero image full-bleed */}
      <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: '70vh' }}>
        <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 editorial-overlay-top" />
        <div className="absolute inset-0 editorial-overlay" />

        {/* Nav over hero */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white/80 hover:text-white transition-colors">
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem><EyeOff className="h-4 w-4 mr-2" /> Unpublish</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title overlay on hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="editorial-caption text-white/50 block mb-2">{pub.topicTag}</span>
          <h1 className="editorial-title text-white text-3xl mb-2">{pub.title}</h1>
          <div className="flex items-center gap-3 text-white/50 text-xs font-light">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{pub.eventDate}</span>
            {pub.place && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pub.place}</span>}
          </div>
        </div>

        {heroImg?.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pt-6 pb-8 page-enter">
        <div className="content-card flex items-center gap-3 p-4 mb-6">
          <AvatarPlaceholder name={author ? `${author.firstName} ${author.lastName}` : ''} size="md" />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-foreground">{author?.firstName} {author?.lastName}</p>
            <p className="text-xs font-medium text-muted-foreground/70">{new Date(pub.publishDate).toLocaleDateString()}</p>
          </div>
          <button className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-1 rounded-lg px-2 py-1">
            <UserPlus className="h-3 w-3" /> Соавтор
          </button>
        </div>

        <div className="content-card p-4 rounded-2xl max-w-prose mb-8">
          <p className="editorial-body text-foreground/80">{pub.text}</p>
        </div>

        {/* Photo gallery -- horizontal snap scroll */}
        {photos.length > 1 && (
          <div className="mb-8 -mx-6">
            <div
              ref={galleryRef}
              className="flex gap-2 overflow-x-auto snap-x-mandatory px-6 pb-3"
              style={{ scrollbarWidth: 'none' }}
            >
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="flex-shrink-0 snap-center rounded-sm overflow-hidden"
                  style={{ width: '75vw', maxWidth: '320px' }}
                >
                  <div className="aspect-[4/3]">
                    <img
                      src={photo.url || photo.thumbnail}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="px-6 editorial-caption text-muted-foreground mt-1">
              {photos.length} photos — tap to view full screen
            </p>
          </div>
        )}

        {photos.length === 1 && (
          <button onClick={() => setLightboxIndex(0)} className="w-full mb-8 rounded-sm overflow-hidden">
            <div className="aspect-[16/10]">
              <img src={photos[0].url || photos[0].thumbnail} alt={photos[0].name} className="h-full w-full object-cover" />
            </div>
          </button>
        )}

        {/* Videos */}
        {videos.map(v => (
          <div key={v.id} className="mb-4 relative rounded-sm overflow-hidden">
            <div className="aspect-video bg-muted">
              <img src={v.thumbnail || v.url} alt={v.name} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-6 w-6 text-white ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 editorial-overlay">
              <p className="text-white text-sm font-light">{v.name}</p>
              {v.duration && <p className="text-white/50 text-xs">{Math.floor(v.duration/60)}:{String(v.duration%60).padStart(2,'0')}</p>}
            </div>
          </div>
        ))}

        {/* Audio */}
        {audios.map(a => (
          <div key={a.id} className="content-card mb-4 flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{a.name}</p>
              {a.duration && <p className="text-xs text-muted-foreground font-light">{Math.floor(a.duration/60)}:{String(a.duration%60).padStart(2,'0')}</p>}
            </div>
          </div>
        ))}

        {/* Participants */}
        {pub.participantIds.length > 0 && (
          <div className="mb-6">
            <p className="editorial-caption text-muted-foreground mb-2">Participants</p>
            <div className="flex flex-wrap gap-2">
              {pub.participantIds.map(pid => {
                const m = getMember(pid);
                return m ? (
                  <span key={pid} className="text-xs font-light bg-secondary/50 px-3 py-1 rounded-sm">{m.firstName} {m.lastName}</span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="content-card p-4 rounded-2xl mb-6">
          <div className="flex items-center gap-6 pb-4 border-b border-border/80">
            <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 text-sm font-semibold ${liked ? 'text-primary' : 'text-muted-foreground'}`}>
              <Heart className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} /> {pub.likes.length + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> {pub.comments.length}
            </span>
          </div>

          <div className="space-y-4 mt-4 mb-4">
            {pub.comments.map(c => {
              const ca = getMember(c.authorId);
              return (
                <div key={c.id} className="flex gap-3">
                  <AvatarPlaceholder name={ca ? `${ca.firstName} ${ca.lastName}` : ''} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{ca?.firstName}</p>
                    <p className="text-sm font-medium text-foreground/80">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Input placeholder="Написать комментарий..." value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 rounded-xl border-2 min-h-touch" />
            <Button size="sm" className="rounded-xl border-2 min-h-touch font-semibold" disabled={!newComment.trim()}>Отправить</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetails;
