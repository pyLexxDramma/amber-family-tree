import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { getDemoMemberPhotoUrl, getDemoTreeHeroUrl } from '@/lib/demo-photos';
import { User, Plus, UserPlus, Contact, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const generationConfig: Record<number, { label: string }> = {
  1: { label: 'Дедушки и бабушки' },
  2: { label: 'Родители' },
  3: { label: 'Наше поколение' },
};

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const demoWithPhotos = useDemoWithPhotos();
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const generations: Record<number, typeof mockMembers> = {};
  mockMembers.forEach(m => { (generations[m.generation] ||= []).push(m); });

  const memberCard = (m: typeof mockMembers[0]) => {
    const isCurrent = m.id === currentUserId;
    return (
      <button
        key={m.id}
        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
        className="w-full flex items-center gap-4 text-left group p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
        aria-label={`Открыть профиль: ${m.firstName} ${m.lastName}`}
      >
        <div className="relative h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
          {demoWithPhotos && (
            <img src={getDemoMemberPhotoUrl(m.id)} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          )}
          <div className={`absolute inset-0 flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
            <User className={`h-7 w-7 ${m.isActive ? 'text-primary/70' : 'text-muted-foreground'}`} />
          </div>
          {isCurrent && (
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={m.nickname || m.firstName}>
            {m.nickname || m.firstName}
          </p>
          <p className="text-xs text-muted-foreground">{m.city || ''}</p>
        </div>
      </button>
    );
  };

  return (
    <AppLayout>
      <TopBar
        title="Семейное дерево"
        subtitle="Генеалогия"
        right={
          <div className="flex items-center gap-1">
            <DropdownMenu open={addMenuOpen} onOpenChange={setAddMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="touch-target h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" aria-label="Добавить">
                  <Plus className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm"><Contact className="h-4 w-4 mr-2" /> Добавить из контактов</DropdownMenuItem>
                <DropdownMenuItem className="text-sm"><UserPlus className="h-4 w-4 mr-2" /> Создать новый контакт</DropdownMenuItem>
                <DropdownMenuItem className="text-sm" onClick={() => { setAddMenuOpen(false); navigate(ROUTES.classic.invite); }}><Send className="h-4 w-4 mr-2" /> Отправить приглашение</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <div className="pb-4 page-enter">
        <div className="relative w-full bg-muted/30 overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {demoWithPhotos && (
            <img src={getDemoTreeHeroUrl()} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { if (e.currentTarget.src !== '/placeholder.svg') e.currentTarget.src = '/placeholder.svg'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        </div>

      <div className="page-enter pb-6">
        {[1, 2, 3].map(gen => {
          const members = generations[gen] || [];
          const config = generationConfig[gen];
          const isLastGen = gen === 3;

          return (
            <div key={gen} className="mt-8">
              <div className="px-3 mb-4">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">{config.label}</p>
              </div>

              <div className="px-3 flex flex-col gap-3">
                {members.map(m => memberCard(m))}
                {isLastGen && (
                  <button
                    onClick={() => navigate(ROUTES.classic.invite)}
                    className="content-card w-full min-h-[144px] rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center gap-2 group hover:border-foreground/30 transition-colors"
                  >
                    <Plus className="h-8 w-8 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                    <span className="text-xs sm:text-sm tracking-widest uppercase text-muted-foreground/30 group-hover:text-foreground/50 transition-colors">Пригласить</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Footer hint */}
        <div className="mt-10 mb-4 px-3 text-center">
          <div className="h-px bg-border/30 mb-4" />
          <p className="editorial-caption text-muted-foreground/30">
            Нажмите на портрет или скажите голосом: «дерево», «лента», «семья»
          </p>
        </div>

        <div className="px-4 mt-4">
          <button
            onClick={() => navigate(ROUTES.classic.invite)}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-2 border-dashed border-primary/40 text-primary text-base sm:text-lg md:text-xl font-bold active:bg-primary/10 transition-colors"
          >
            <Plus className="h-7 w-7" />
            Пригласить в семью
          </button>
        </div>
      </div>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
