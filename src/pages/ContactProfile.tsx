import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMember, mockMembers } from '@/data/mock-members';
import { TopBar } from '@/components/TopBar';
import { AppLayout } from '@/components/AppLayout';
import { ChevronUp, ChevronDown, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

/** Get gallery photos for a member (mock: 4-8 seeded photos) */
function getMemberPhotos(memberId: string): string[] {
  const count = 4 + (memberId.charCodeAt(1) % 5); // 4-8 photos
  return Array.from({ length: count }, (_, i) =>
    `https://picsum.photos/seed/${memberId}-photo${i}/800/800`
  );
}

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');
  const demoWithPhotos = useDemoWithPhotos();
  const [currentPhoto, setCurrentPhoto] = useState(0);

  if (!member) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-2xl text-foreground font-medium">Контакт не найден</p>
        </div>
      </AppLayout>
    );
  }

  const photos = getMemberPhotos(member.id);

  // Find parents and children from relations
  const parents = member.relations
    .filter(r => r.type === 'parent')
    .map(r => getMember(r.memberId))
    .filter(Boolean) as typeof mockMembers;

  const children = member.relations
    .filter(r => r.type === 'child')
    .map(r => getMember(r.memberId))
    .filter(Boolean) as typeof mockMembers;

  // Format birth date
  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
  const birthFormatted = member.birthDate
    ? new Date(member.birthDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const goToMember = (memberId: string) => {
    navigate(ROUTES.classic.profile(memberId));
  };

  const prevPhoto = () => setCurrentPhoto(p => (p > 0 ? p - 1 : photos.length - 1));
  const nextPhoto = () => setCurrentPhoto(p => (p < photos.length - 1 ? p + 1 : 0));

  return (
    <AppLayout>
      <TopBar title="Семейный альбом" onBack={() => navigate(-1)} />

      <div className="page-enter">
        {/* ===== SECTION 1: Name & Vital Stats ===== */}
        <section className="px-6 pt-8 pb-6 text-center">
          <h1
            className="text-4xl font-bold leading-tight text-foreground tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            {member.firstName} {member.lastName}
          </h1>
          {member.nickname && (
            <p className="text-xl text-muted-foreground mt-2 font-medium">
              «{member.nickname}»
            </p>
          )}

          <div className="mt-4 flex flex-col items-center gap-1">
            {birthFormatted && (
              <p className="text-lg text-foreground/80 font-medium">
                Дата рождения: {birthFormatted}
              </p>
            )}
            {member.city && (
              <p className="text-lg text-muted-foreground">
                {member.city}
              </p>
            )}
            <span
              className={`mt-2 inline-block text-base font-semibold px-4 py-1 rounded-full ${
                member.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {member.isActive ? 'Активный участник' : 'Неактивный'}
            </span>
          </div>

          {member.about && (
            <p className="mt-4 text-lg leading-relaxed text-foreground/70 max-w-md mx-auto">
              {member.about}
            </p>
          )}
        </section>

        {/* ===== SECTION 2: Photo Gallery / Carousel ===== */}
        <section className="px-4 pb-8">
          <h2
            className="text-2xl font-bold text-foreground mb-4 px-2"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            Фотографии
          </h2>

          {/* Main photo */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio: '1/1' }}>
            {demoWithPhotos ? (
              <img
                src={photos[currentPhoto]}
                alt={`Фото ${member.firstName} ${currentPhoto + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-32 w-32 text-muted-foreground/40" />
              </div>
            )}

            {/* Navigation arrows — large touch targets */}
            <button
              onClick={prevPhoto}
              className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-start pl-3 bg-gradient-to-r from-black/20 to-transparent active:from-black/40"
              aria-label="Предыдущее фото"
            >
              <ChevronUp className="h-10 w-10 text-white/80 -rotate-90" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-end pr-3 bg-gradient-to-l from-black/20 to-transparent active:from-black/40"
              aria-label="Следующее фото"
            >
              <ChevronDown className="h-10 w-10 text-white/80 -rotate-90" />
            </button>

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-base font-medium">
              {currentPhoto + 1} из {photos.length}
            </div>
          </div>

          {/* Thumbnail strip — large touch targets */}
          <div
            className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                  i === currentPhoto
                    ? 'border-primary shadow-md shadow-primary/30 scale-105'
                    : 'border-transparent opacity-60'
                }`}
                aria-label={`Фото ${i + 1}`}
              >
                {demoWithPhotos ? (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ===== SECTION 3: Family Connections ===== */}
        <section className="px-4 pb-10">
          <h2
            className="text-2xl font-bold text-foreground mb-5 px-2"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            Семейные связи
          </h2>

          <div className="space-y-4">
            {/* View Parents button */}
            <button
              onClick={() => {
                if (parents.length === 1) goToMember(parents[0].id);
              }}
              disabled={parents.length === 0}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-left transition-colors ${
                parents.length > 0
                  ? 'bg-primary text-primary-foreground active:opacity-90 shadow-lg shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              aria-label={parents.length > 0 ? `Смотреть родителей: ${parents.map(p => p.firstName).join(', ')}` : 'Нет данных о родителях'}
            >
              <ChevronUp className="h-8 w-8 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xl font-bold block">Смотреть родителей</span>
                {parents.length > 0 ? (
                  <span className="text-base opacity-80 block mt-0.5">
                    {parents.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                  </span>
                ) : (
                  <span className="text-base opacity-60 block mt-0.5">Нет данных</span>
                )}
              </div>
            </button>

            {/* If multiple parents, show individual buttons */}
            {parents.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {parents.map(parent => (
                  <button
                    key={parent.id}
                    onClick={() => goToMember(parent.id)}
                    className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-primary/10 text-foreground active:bg-primary/20 transition-colors border-2 border-primary/20"
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {demoWithPhotos ? (
                        <img
                          src={`https://picsum.photos/seed/member${parent.id}/200/200`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-center leading-tight">
                      {parent.nickname || parent.firstName}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* View Children button */}
            <button
              onClick={() => {
                if (children.length === 1) goToMember(children[0].id);
              }}
              disabled={children.length === 0}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-left transition-colors ${
                children.length > 0
                  ? 'bg-accent text-accent-foreground active:opacity-90 shadow-lg shadow-accent/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              aria-label={children.length > 0 ? `Смотреть детей: ${children.map(c => c.firstName).join(', ')}` : 'Нет данных о детях'}
            >
              <ChevronDown className="h-8 w-8 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xl font-bold block">Смотреть детей</span>
                {children.length > 0 ? (
                  <span className="text-base opacity-80 block mt-0.5">
                    {children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
                  </span>
                ) : (
                  <span className="text-base opacity-60 block mt-0.5">Нет данных</span>
                )}
              </div>
            </button>

            {/* If multiple children, show individual buttons */}
            {children.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => goToMember(child.id)}
                    className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-accent/10 text-foreground active:bg-accent/20 transition-colors border-2 border-accent/20"
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {demoWithPhotos ? (
                        <img
                          src={`https://picsum.photos/seed/member${child.id}/200/200`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-center leading-tight">
                      {child.nickname || child.firstName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default ContactProfile;
