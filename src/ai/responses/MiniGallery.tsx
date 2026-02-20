import React from 'react';
import { useNavigate } from 'react-router-dom';
import { allMediaItems } from '@/data/mock-publications';
import { ExternalLink, Video, Mic } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { getDemoFeedPhotoUrl } from '@/lib/demo-photos';

export const MiniGallery: React.FC = () => {
  const navigate = useNavigate();
  const preview = allMediaItems.slice(0, 12);

  return (
    <div className="animate-in fade-in duration-300">
      <p className="editorial-caption text-muted-foreground/70 mb-3">Фото и медиа семьи</p>
      <div className="grid grid-cols-3 gap-2">
        {preview.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(ROUTES.classic.feed)}
            className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary/40 hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {item.type === 'photo' && (
              <img
                src={item.thumbnail || getDemoFeedPhotoUrl(1)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
            {item.type === 'video' && (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {item.type === 'audio' && (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Mic className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {allMediaItems.filter((m) => m.type === 'photo').length} фото,{' '}
        {allMediaItems.filter((m) => m.type === 'video').length} видео,{' '}
        {allMediaItems.filter((m) => m.type === 'audio').length} аудио
      </p>
      <button
        type="button"
        onClick={() => navigate(ROUTES.classic.feed)}
        className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Открыть галерею и ленту
      </button>
    </div>
  );
};
