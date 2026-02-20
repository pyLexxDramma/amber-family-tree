import React, { useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, UserPlus, Contact, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

const generationConfig: Record<number, { label: string; subtitle: string }> = {
  1: { label: 'Дедушки и бабушки', subtitle: 'Корни нашей истории' },
  2: { label: 'Родители', subtitle: 'Связь поколений' },
  3: { label: 'Наше поколение', subtitle: 'Пишем следующую главу' },
};

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const demoWithPhotos = useDemoWithPhotos();

  const generations: Record<number, typeof mockMembers> = {};
  mockMembers.forEach(m => { (generations[m.generation] ||= []).push(m); });

  const totalMembers = mockMembers.length;
  const activeMembers = mockMembers.filter(m => m.isActive).length;
  const genCount = Object.keys(generations).length;

  const memberCard = (m: typeof mockMembers[0], variant: 'portrait' | 'landscape' | 'scroll') => {
    const isCurrent = m.id === currentUserId;
    const widthClass = variant === 'scroll' ? 'w-28 flex-shrink-0' : 'w-full';

    return (
      <button
        key={m.id}
        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
        className={`person-card relative overflow-hidden group ${widthClass} aspect-square flex flex-col hover:border-primary/40 hover:shadow-md hover:shadow-primary/10`}
      >
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center bg-muted rounded-t-2xl overflow-hidden">
          {demoWithPhotos && (
            <img src={`https://picsum.photos/seed/member${m.id}/400/400`} alt="" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          )}
          <div className={`h-full w-full flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
            <User className={`h-1/2 w-1/2 ${m.isActive ? 'text-primary/70' : 'text-muted-foreground'}`} />
          </div>
          {isCurrent && (
            <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          )}
          {!m.isActive && (
            <span className="absolute top-1.5 left-1.5 text-[8px] tracking-widest uppercase text-muted-foreground font-medium bg-black/20 px-1.5 py-0.5 rounded">offline</span>
          )}
        </div>
        <div className="p-2.5 text-center bg-card/95 border-t border-primary/10 rounded-b-2xl group-hover:bg-primary/5 transition-colors">
          <p className="text-foreground text-xs font-semibold truncate text-primary/90 group-hover:text-primary" title={m.nickname || m.firstName}>
            {m.nickname || m.firstName}
          </p>
          <p className="text-[10px] font-medium text-primary/60 mt-0.5">Смотреть фото</p>
        </div>
      </button>
    );
  };

  return (
    <AppLayout>
      <TopBar
        title="Дерево"
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="touch-target flex items-center gap-1.5 min-h-touch px-3 py-2 text-xs font-medium tracking-wide border border-current/30 rounded-xl hover:bg-white/15 transition-colors"
              onClick={() => {}}
            >
              <UserPlus className="h-4 w-4" /> Создать контакт
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="touch-target flex h-10 w-10 items-center justify-center rounded-xl border border-current/30 hover:bg-white/15 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm font-light"><Contact className="h-4 w-4 mr-2" /> Добавить из контактов</DropdownMenuItem>
                <DropdownMenuItem className="text-sm font-light"><UserPlus className="h-4 w-4 mr-2" /> Создать новый контакт</DropdownMenuItem>
                <DropdownMenuItem className="text-sm font-light" onClick={() => navigate(ROUTES.classic.invite)}><Send className="h-4 w-4 mr-2" /> Отправить приглашение</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <div className="pb-4 page-enter">
        <div className="relative w-full bg-muted/30 overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {demoWithPhotos && (
            <img src="https://picsum.photos/seed/sokolov/1200/675" alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { if (e.currentTarget.src !== '/placeholder.svg') e.currentTarget.src = '/placeholder.svg'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-white text-2xl font-light">{totalMembers}</p>
                <p className="editorial-caption text-white/40">участников</p>
              </div>
              <div>
                <p className="text-white text-2xl font-light">{genCount}</p>
                <p className="editorial-caption text-white/40">поколений</p>
              </div>
              <div>
                <p className="text-white text-2xl font-light">{activeMembers}</p>
                <p className="editorial-caption text-white/40">активных</p>
              </div>
            </div>
          </div>
        </div>

        {[1, 2, 3].map(gen => {
          const raw = generations[gen] || [];
          const members = gen === 3
            ? [...raw].sort((a, b) => (a.id === currentUserId ? -1 : b.id === currentUserId ? 1 : 0))
            : raw;
          const config = generationConfig[gen];
          const isLastGen = gen === 3;

          return (
            <div key={gen} className="mt-8">
              <div className="px-6 mb-4">
                <p className="section-title text-primary">{config.label}</p>
                <p className="text-sm font-light text-muted-foreground mt-1 italic">{config.subtitle}</p>
              </div>

              {isLastGen ? (
                /* Horizontal scroll for youngest generation */
                <div className="relative">
                  <div
                    ref={scrollRef}
                    className="flex gap-2 px-6 overflow-x-auto snap-x-mandatory pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {members.map(m => memberCard(m, 'scroll'))}
                    {/* Invite card */}
                    <button
                      onClick={() => navigate(ROUTES.classic.invite)}
                      className="w-28 flex-shrink-0 aspect-square rounded-xl border border-dashed border-border/50 flex flex-col items-center justify-center gap-2 group hover:border-foreground/30 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                      <span className="text-[9px] tracking-widest uppercase text-muted-foreground/30 group-hover:text-foreground/50 transition-colors">Пригласить</span>
                    </button>
                  </div>
                  <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>
              ) : gen === 1 ? (
                /* Grandparents: 2-column large portraits */
                <div className="px-6 grid grid-cols-2 gap-2">
                  {members.map(m => memberCard(m, 'portrait'))}
                </div>
              ) : (
                /* Parents: mixed layout — first pair large, rest in grid */
                <div className="px-6">
                  {members.length <= 2 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {members.map(m => memberCard(m, 'portrait'))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {members.slice(0, 2).map(m => memberCard(m, 'portrait'))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {members.slice(2).map(m => memberCard(m, 'portrait'))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer hint */}
        <div className="mt-10 mb-4 px-6 text-center">
          <div className="h-px bg-border/30 mb-4" />
          <p className="editorial-caption text-muted-foreground/30">
            Нажмите на портрет или скажите голосом: «дерево», «лента», «семья»
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.app)}
            className="mt-3 text-sm font-light text-primary hover:underline"
          >
            Голосовой режим (демо)
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
