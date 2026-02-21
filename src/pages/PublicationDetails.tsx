import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPublications } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { useUIVariant } from '@/contexts/UIVariantContext';
import { useVoice } from '@/ai/useVoice';
import { ROUTES } from '@/constants/routes';
import { getDemoFeedPhotoUrl } from '@/lib/demo-photos';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, MapPin, Calendar, Play, Mic, Edit, Trash2, EyeOff, ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { variant: uiVariant } = useUIVariant();
  const { speak, stopSpeaking } = useVoice(() => {});
  const pub = mockPublications.find(p => p.id === id);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (audioPlaying) {
      stopSpeaking();
      setAudioPlaying(false);
    } else if (pub?.text?.trim()) {
      speak(pub.text);
      setAudioPlaying(true);
    }
  };

  useEffect(() => {
    setAudioPlaying(false);
    return () => { stopSpeaking(); };
  }, [id, stopSpeaking]);

  if (!pub) return <div className="p-6 text-center text-muted-foreground">Публикация не найдена</div>;

  const author = getMember(pub.authorId);
  const photos = pub.media.filter(m => m.type === 'photo');
  const videos = pub.media.filter(m => m.type === 'video');
  const audios = pub.media.filter(m => m.type === 'audio');

  const heroImg = photos[0] || (videos[0] ? videos[0] : null);
  const fallbackSeed = (pub.id.replace(/\D/g, '') || '1').slice(0, 2);
  const heroUrl = heroImg
    ? (heroImg.url || heroImg.thumbnail || getDemoFeedPhotoUrl(parseInt(fallbackSeed, 10) || 1))
    : getDemoFeedPhotoUrl(parseInt(fallbackSeed, 10) || 1);

  const lightboxImages = photos.map(p => ({
    url: p.url || p.thumbnail || '',
    caption: p.name,
  }));

  const currentIndex = mockPublications.findIndex(p => p.id === pub.id);
  const prevPub = currentIndex > 0 ? mockPublications[currentIndex - 1] : null;
  const nextPub = currentIndex >= 0 && currentIndex < mockPublications.length - 1 ? mockPublications[currentIndex + 1] : null;

  /** Вариант 2: Живая история — просмотр с подписью, пред./след. */
  if (uiVariant === 'living') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {lightboxIndex !== null && (
          <PhotoLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
        <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '4/5', maxHeight: '55vh' }}>
          <img src={heroUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="touch-target p-2.5 rounded-xl border-2 border-white/40 text-white/90 hover:text-white hover:bg-white/15 hover:border-white/60 transition-colors shadow-sm" aria-label="Назад">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
        <p className="text-center py-3 text-sm text-muted-foreground border-b border-border">— Свайпните фото вправо/влево —</p>
        <div className="px-3 py-6 flex-1">
          <div className="content-card p-5 rounded-2xl mb-4 min-h-[96px]">
            <p className="flex items-center gap-2 text-base font-semibold text-foreground mb-2">
              <MapPin className="h-4 w-4 text-primary" /> {pub.place || '—'}, {pub.eventDate?.slice(0, 4) || ''} год
            </p>
            <p className="editorial-body text-foreground/90 leading-relaxed">{pub.text}</p>
          </div>
          <div className="flex items-center gap-6 py-4">
            <button className={`flex items-center gap-2 text-base font-semibold ${liked ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setLiked(!liked)}>
              <Heart className={`h-5 w-5 ${liked ? 'fill-primary' : ''}`} /> {pub.likes.length + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-2 text-muted-foreground font-medium"><MessageCircle className="h-5 w-5" /> {pub.comments.length}</span>
            <button className="flex items-center gap-2 text-muted-foreground font-medium hover:text-foreground transition-colors">
              <Share2 className="h-5 w-5" /> Поделиться
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 mt-6">
            <Button variant="outline" className="rounded-xl min-h-touch flex-1 gap-2" disabled={!prevPub} onClick={() => prevPub && navigate(ROUTES.classic.publication(prevPub.id))}>
              <ChevronLeft className="h-5 w-5" /> Предыдущее
            </Button>
            <Button variant="outline" className="rounded-xl min-h-touch flex-1 gap-2" disabled={!nextPub} onClick={() => nextPub && navigate(ROUTES.classic.publication(nextPub.id))}>
              Следующее <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="outline" className="w-full mt-4 rounded-xl min-h-touch font-semibold" onClick={() => navigate(ROUTES.classic.feed)}>
            КОЛЛЕКЦИЯ ВСЕХ ФОТО
          </Button>
        </div>
      </div>
    );
  }

  /** Вариант 4: Журнал + Плеер — озвучка, просмотр с аудио */
  if (uiVariant === 'journal') {
    const voiceLabel = author ? author.firstName : 'Мама';
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '4/5', maxHeight: '50vh' }}>
          <img src={heroUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-4">
            <button onClick={() => navigate(-1)} className="touch-target p-2.5 rounded-xl border-2 border-white/40 text-white/90 hover:text-white hover:bg-white/15 hover:border-white/60 transition-colors shadow-sm" aria-label="Назад">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="px-3 py-6 flex-1 space-y-6">
          <div className="content-card p-5 rounded-2xl min-h-[96px]">
            <button onClick={handlePlayPause} className="w-full flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                {audioPlaying ? <span className="w-4 h-4 rounded-full bg-primary" /> : <Play className="h-7 w-7 text-primary ml-0.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-lg">СЛУШАТЬ ИСТОРИЮ</p>
                <p className="text-sm text-muted-foreground">голос: {voiceLabel}</p>
                <p className="text-foreground/80 text-sm mt-1 italic line-clamp-2">«{pub.text.slice(0, 80)}…»</p>
              </div>
            </button>
          </div>
          <div className="content-card p-5 rounded-2xl min-h-[96px]">
            <p className="editorial-caption text-muted-foreground mb-2">Подпись</p>
            <p className="text-lg font-medium text-foreground leading-snug">{pub.text}</p>
          </div>
          <div className="flex items-center justify-center gap-6 py-4">
            <button className="touch-target p-3 rounded-full border-2 border-border hover:bg-muted transition-colors" aria-label="Назад"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={handlePlayPause} className="touch-target w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              {audioPlaying ? <span className="w-5 h-5 rounded-full bg-current" /> : <Play className="h-8 w-8 ml-0.5" />}
            </button>
            <button className="touch-target p-3 rounded-full border-2 border-border hover:bg-muted transition-colors" aria-label="Вперёд"><ChevronRight className="h-6 w-6" /></button>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full rounded-xl min-h-[96px] font-semibold gap-2" onClick={() => navigate(ROUTES.classic.feed)}>
              <ChevronLeft className="h-4 w-4" /> Поменять фото
            </Button>
            <Button variant="outline" className="w-full rounded-xl min-h-[96px] font-semibold gap-2">
              <Download className="h-4 w-4" /> Сохранить в телефон
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <button onClick={() => navigate(-1)} className="touch-target p-2.5 rounded-xl border-2 border-white/40 text-white/90 hover:text-white hover:bg-white/15 hover:border-white/60 transition-colors shadow-sm" aria-label="Назад">
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
        <div className="absolute bottom-0 left-0 right-0 p-6 photo-card-text">
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

      <div className="px-0 pt-6 pb-8 page-enter">
        <div className="content-card flex items-center gap-3 p-5 min-h-[96px] mb-6">
          <AvatarPlaceholder name={author ? `${author.firstName} ${author.lastName}` : ''} size="md" />
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-foreground">{author?.firstName} {author?.lastName}</p>
            <p className="text-xs font-medium text-muted-foreground/70">{new Date(pub.publishDate).toLocaleDateString()}</p>
          </div>
          <button className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-1 rounded-lg px-2 py-1">
            <UserPlus className="h-3 w-3" /> Соавтор
          </button>
        </div>

        <div className="content-card p-5 rounded-2xl max-w-prose mb-8 min-h-[96px]">
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
            <div className="absolute bottom-0 left-0 right-0 p-3 editorial-overlay photo-card-text">
              <p className="text-white text-sm font-light">{v.name}</p>
              {v.duration && <p className="text-white/50 text-xs">{Math.floor(v.duration/60)}:{String(v.duration%60).padStart(2,'0')}</p>}
            </div>
          </div>
        ))}

        {/* Audio */}
        {audios.map(a => (
          <div key={a.id} className="content-card mb-4 flex items-center gap-3 p-5 min-h-[96px]">
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

        <div className="content-card p-5 rounded-2xl mb-6 min-h-[96px]">
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
