import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMember } from '@/data/mock-members';
import { AppLayout } from '@/components/AppLayout';
import { usePlatform } from '@/platform/PlatformContext';
import { ChevronLeft, Users, User, Heart, MessageCircle, Calendar } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');
  const demoWithPhotos = useDemoWithPhotos();
  const platform = usePlatform();

  if (!member) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-foreground font-medium min-h-touch flex items-center justify-center">
          Контакт не найден
        </div>
      </AppLayout>
    );
  }

  const parentIds = member.relations.filter((r) => r.type === 'parent').map((r) => r.memberId);
  const childIds = member.relations.filter((r) => r.type === 'child').map((r) => r.memberId);
  const parents = parentIds.map((mid) => getMember(mid)).filter(Boolean);
  const children = childIds.map((mid) => getMember(mid)).filter(Boolean);

  const displayName = member.nickname || `${member.firstName} ${member.lastName}`.trim();
  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-');
      return day && m && y ? `${day}.${m}.${y}` : d;
    } catch {
      return d;
    }
  };

  const photoUrl = demoWithPhotos ? getDemoMemberPhotoUrl(member.id) : null;
  const birthYear = member.birthDate?.slice(0, 4);
  const deathYear = member.deathDate?.slice(0, 4);

  const goToRelative = (relId: string) => {
    platform.hapticFeedback('light');
    navigate(ROUTES.classic.profile(relId));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative w-full" style={{ minHeight: '65vh' }}>
        {photoUrl ? (
          <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            <User className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 z-10 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h1 className="font-serif text-3xl font-bold text-white leading-tight mb-1">
            {displayName}
          </h1>
          <p className="text-white/70 text-sm">
            {member.city || ''}{member.city && member.birthDate ? ' · ' : ''}{member.birthDate ? `Род. ${formatDate(member.birthDate)}` : ''}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              className="px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Подписаться
            </button>
            <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {(birthYear || deathYear) && (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {birthYear && (
              <div className="flex-shrink-0 px-5 py-3 rounded-2xl bg-card border border-border/30 shadow-sm min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">{birthYear}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Дата рождения</p>
                <p className="text-xs text-muted-foreground">{formatDate(member.birthDate)}</p>
              </div>
            )}
            {deathYear && (
              <div className="flex-shrink-0 px-5 py-3 rounded-2xl bg-card border border-border/30 shadow-sm min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{deathYear}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Дата ухода</p>
                <p className="text-xs text-muted-foreground">{formatDate(member.deathDate!)}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="editorial-caption text-primary mb-3">Семья</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => parents[0] && goToRelative(parents[0]!.id)}
              disabled={parents.length === 0}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {parents.length === 0 ? 'Родители не указаны' : parents.map(p => p!.nickname || p!.firstName).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">{parents.length > 0 ? `Родител${parents.length > 1 ? 'и' : 'ь'}` : ''}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => children[0] && goToRelative(children[0]!.id)}
              disabled={children.length === 0}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {children.length === 0 ? 'Дети не указаны' : children.map(c => c!.nickname || c!.firstName).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">{children.length > 0 ? `Дет${children.length > 1 ? 'и' : 'ь'}` : ''}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
