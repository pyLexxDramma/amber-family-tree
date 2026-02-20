import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMember, mockMembers } from '@/data/mock-members';
import { TopBar } from '@/components/TopBar';
import { AppLayout } from '@/components/AppLayout';
import { usePlatform } from '@/platform/PlatformContext';
import { ChevronLeft, ChevronRight, Users, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

/**
 * Card Mini-Album profile for Family Album (TMA).
 * Linear navigation: vertical scroll only; move via "View Parents" / "View Children" only.
 * Accessibility: high contrast, large tap targets, legible serif for name, DOB/DOD visible.
 */
const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');
  const demoWithPhotos = useDemoWithPhotos();
  const [galleryIndex, setGalleryIndex] = useState(0);
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

  const photoUrls = demoWithPhotos
    ? [
        `https://picsum.photos/seed/member${member.id}/800/600`,
        `https://picsum.photos/seed/member${member.id}b/800/600`,
        `https://picsum.photos/seed/member${member.id}c/800/600`,
      ]
    : [];

  const goToParent = (parentId: string) => {
    platform.hapticFeedback('light');
    navigate(ROUTES.classic.profile(parentId));
  };
  const goToChild = (childId: string) => {
    platform.hapticFeedback('light');
    navigate(ROUTES.classic.profile(childId));
  };

  return (
    <AppLayout>
      <TopBar title="" onBack={() => navigate(-1)} />

      {/* Стиль как на скриншотах: тёмная тема, оранжевый акцент, высокий контраст */}
      <div className="tma-profile tma-style-dark min-h-screen bg-[#1a1a1a] text-white flex flex-col">
        {/* Section 1: Имя + даты — крупно, высокий контраст */}
        <section className="px-3 pt-6 pb-5 border-b border-white/10">
          <h1 className="text-[26px] font-bold leading-tight text-white mb-2">
            {displayName}
          </h1>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[17px] text-white/80">
            <span>Род.: {formatDate(member.birthDate)}</span>
            {member.deathDate && <span>— Ум.: {formatDate(member.deathDate)}</span>}
          </div>
          {member.city && (
            <p className="text-[15px] text-white/60 mt-2">{member.city}</p>
          )}
        </section>

        {/* Section 2: Large touch-friendly photo gallery / carousel */}
        <section className="px-0 py-6">
          <h2 className="px-3 text-[13px] font-semibold uppercase tracking-wider text-white/50 mb-3">
            Фото
          </h2>
          {photoUrls.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden">
                {photoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="w-full flex-shrink-0"
                    style={{
                      display: i === galleryIndex ? 'block' : 'none',
                      aspectRatio: '4/3',
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover bg-[#eee]"
                    />
                  </div>
                ))}
              </div>
              {photoUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center touch-target min-w-[48px] min-h-[48px]"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((i) => (i + 1) % photoUrls.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center touch-target min-w-[48px] min-h-[48px]"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {photoUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGalleryIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full touch-target min-w-[20px] min-h-[20px] ${
                          i === galleryIndex ? 'bg-[#1a1a1a]' : 'bg-[#ccc]'
                        }`}
                        aria-label={`Фото ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className="mx-3 flex items-center justify-center bg-[#2a2a2a] rounded-xl border border-white/10"
              style={{ aspectRatio: '4/3' }}
            >
              <User className="w-20 h-20 text-white/40" />
            </div>
          )}
        </section>

        {/* Section 3: Семья — две крупные оранжевые кнопки (стиль PROMME) */}
        <section className="px-3 py-6 pb-12">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-white/50 mb-4">
            Семья
          </h2>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => parents[0] && goToParent(parents[0].id)}
              disabled={parents.length === 0}
              className="tma-family-btn min-h-[96px] w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e85d04] to-[#d44a00] text-white text-[18px] font-semibold touch-target disabled:opacity-40 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              style={{ minHeight: '96px' }}
            >
              <Users className="w-6 h-6 shrink-0" />
              {parents.length === 0
                ? 'Родители не указаны'
                : parents.length === 1
                  ? `Родитель: ${parents[0].nickname || parents[0].firstName}`
                  : `Родители (${parents.length})`}
            </button>
            <button
              type="button"
              onClick={() => children[0] && goToChild(children[0].id)}
              disabled={children.length === 0}
              className="tma-family-btn min-h-[96px] w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e85d04] to-[#d44a00] text-white text-[18px] font-semibold touch-target disabled:opacity-40 disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              style={{ minHeight: '96px' }}
            >
              <Users className="w-6 h-6 shrink-0" />
              {children.length === 0
                ? 'Дети не указаны'
                : children.length === 1
                  ? `Ребёнок: ${children[0].nickname || children[0].firstName}`
                  : `Дети (${children.length})`}
            </button>
          </div>
          {(parents.length > 1 || children.length > 1) && (
            <p className="text-[13px] text-white/50 mt-4">
              Откроется профиль первого в списке. Листайте вверх/вниз для навигации.
            </p>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default ContactProfile;
