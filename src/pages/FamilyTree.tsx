import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { User, Plus } from 'lucide-react';

const generationConfig: Record<number, { label: string }> = {
  1: { label: 'Дедушки и бабушки' },
  2: { label: 'Родители' },
  3: { label: 'Наше поколение' },
};

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const demoWithPhotos = useDemoWithPhotos();

  const generations: Record<number, typeof mockMembers> = {};
  mockMembers.forEach(m => { (generations[m.generation] ||= []).push(m); });

  const memberCard = (m: typeof mockMembers[0]) => {
    const isCurrent = m.id === currentUserId;

    return (
      <button
        key={m.id}
        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-card text-left border-2 border-border/60 active:bg-primary/10 active:border-primary/30 transition-colors"
        aria-label={`Открыть профиль: ${m.firstName} ${m.lastName}`}
      >
        {/* Avatar — large for accessibility */}
        <div className="h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
          {demoWithPhotos ? (
            <img
              src={`https://picsum.photos/seed/member${m.id}/200/200`}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <User className={`h-8 w-8 ${m.isActive ? 'text-foreground/60' : 'text-muted-foreground'}`} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-xl font-bold text-foreground truncate"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            {m.nickname || m.firstName} {m.lastName}
          </p>
          {m.birthDate && (
            <p className="text-base text-muted-foreground mt-0.5">
              {new Date(m.birthDate).getFullYear()} г.р.
              {m.city ? ` · ${m.city}` : ''}
            </p>
          )}
          {isCurrent && (
            <span className="inline-block mt-1 text-sm font-semibold text-primary">Это вы</span>
          )}
        </div>

        {/* Status dot */}
        <div className={`h-4 w-4 flex-shrink-0 rounded-full ${m.isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`} 
             aria-label={m.isActive ? 'Активен' : 'Неактивен'} />
      </button>
    );
  };

  return (
    <AppLayout>
      <TopBar title="Семейное дерево" />

      <div className="page-enter pb-6">
        {/* Stats */}
        <div className="px-6 pt-6 pb-4 flex gap-6">
          <div>
            <p className="text-3xl font-bold text-foreground">{mockMembers.length}</p>
            <p className="text-base text-muted-foreground">участников</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{Object.keys(generations).length}</p>
            <p className="text-base text-muted-foreground">поколений</p>
          </div>
        </div>

        <p className="px-6 text-lg text-foreground/70 mb-6">
          Нажмите на имя, чтобы открыть фотоальбом и связи
        </p>

        {[1, 2, 3].map(gen => {
          const members = generations[gen] || [];
          const config = generationConfig[gen];

          return (
            <div key={gen} className="mb-6">
              <h2
                className="px-6 text-2xl font-bold text-foreground mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
              >
                {config.label}
              </h2>
              <div className="px-4 space-y-2">
                {members.map(m => memberCard(m))}
              </div>
            </div>
          );
        })}

        {/* Invite CTA */}
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate(ROUTES.classic.invite)}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-2 border-dashed border-primary/40 text-primary text-xl font-bold active:bg-primary/10 transition-colors"
          >
            <Plus className="h-7 w-7" />
            Пригласить в семью
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
