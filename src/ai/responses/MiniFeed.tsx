import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockPublications } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { ExternalLink } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const MiniFeed: React.FC = () => {
  const navigate = useNavigate();
  const recent = [...mockPublications]
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate))
    .slice(0, 5);

  return (
    <div className="animate-in fade-in duration-300">
      <p className="editorial-caption text-muted-foreground/70 mb-3">Лента публикаций</p>
      <ul className="space-y-3">
        {recent.map((pub) => {
          const author = getMember(pub.authorId);
          const thumb = pub.media.find((m) => m.type === 'photo');
          return (
            <li key={pub.id}>
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.feed)}
                className="w-full flex gap-3 p-2 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 text-left transition-colors"
              >
                {thumb ? (
                  <img
                    src={thumb.thumbnail || thumb.url}
                    alt=""
                    className="w-14 h-14 rounded object-cover flex-shrink-0"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{pub.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {author ? `${author.firstName} ${author.lastName}` : ''} · {pub.eventDate}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => navigate(ROUTES.classic.feed)}
        className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Открыть полную ленту
      </button>
    </div>
  );
};
