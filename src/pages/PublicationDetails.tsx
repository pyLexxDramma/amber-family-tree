import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPublications } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { useVoice } from '@/ai/useVoice';
import { ROUTES } from '@/constants/routes';
import { getDemoFeedPhotoUrl } from '@/lib/demo-photos';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { speak, stopSpeaking } = useVoice(() => {});
  const pub = mockPublications.find(p => p.id === id);
  const [audioPlaying, setAudioPlaying] = useState(false);

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

  useEffect(() => {
    const handler = () => {
      stopSpeaking();
      setAudioPlaying(false);
    };
    window.addEventListener('voice-control-start', handler);
    return () => window.removeEventListener('voice-control-start', handler);
  }, [stopSpeaking]);

  if (!pub) return <div className="p-6 text-center text-muted-foreground">Публикация не найдена</div>;

  const author = getMember(pub.authorId);
  const photos = pub.media.filter(m => m.type === 'photo');
  const heroImg = photos[0];
  const fallbackSeed = (pub.id.replace(/\D/g, '') || '1').slice(0, 2);
  const heroUrl = heroImg
    ? (heroImg.url || heroImg.thumbnail || getDemoFeedPhotoUrl(parseInt(fallbackSeed, 10) || 1))
    : getDemoFeedPhotoUrl(parseInt(fallbackSeed, 10) || 1);

  const voiceLabel = author ? author.firstName : 'Мама';
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '4/5', maxHeight: '50vh' }}>
        <img src={heroUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 p-4">
          <button onClick={() => navigate(-1)} className="touch-target p-2.5 rounded-full bg-card shadow-sm hover:bg-secondary transition-colors" aria-label="Назад">
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
};

export default PublicationDetails;
