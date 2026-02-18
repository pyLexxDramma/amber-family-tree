import React, { useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, UserPlus, Contact, Send, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const generationConfig: Record<number, { label: string; subtitle: string }> = {
  1: { label: 'Дедушки и бабушки', subtitle: 'Корни нашей истории' },
  2: { label: 'Родители', subtitle: 'Связь поколений' },
  3: { label: 'Наше поколение', subtitle: 'Пишем следующую главу' },
};

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const generations: Record<number, typeof mockMembers> = {};
  mockMembers.forEach(m => { (generations[m.generation] ||= []).push(m); });

  const totalMembers = mockMembers.length;
  const activeMembers = mockMembers.filter(m => m.isActive).length;
  const genCount = Object.keys(generations).length;

  const memberCard = (m: typeof mockMembers[0], variant: 'portrait' | 'landscape' | 'scroll') => {
    const isCurrent = m.id === currentUserId;
    const imgSeed = `member${m.id}`;

    const aspectClass =
      variant === 'portrait' ? 'aspect-[3/4]'
      : variant === 'landscape' ? 'aspect-[4/3]'
      : 'aspect-[3/4]';

    const widthClass =
      variant === 'scroll' ? 'w-36 flex-shrink-0' : 'w-full';

    return (
      <button
        key={m.id}
        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
        className={`relative overflow-hidden group ${widthClass} ${aspectClass}`}
      >
        <img
          src={`https://picsum.photos/seed/${imgSeed}/400/530`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: m.isActive ? 'sepia(0.08)' : 'grayscale(0.6) sepia(0.1)' }}
        />
        <div className="absolute inset-0 editorial-overlay" />

        {isCurrent && (
          <div className="absolute top-3 right-3">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        )}

        {!m.isActive && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] tracking-widest uppercase text-white/30 font-light">offline</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-light tracking-wide leading-tight">
            {m.nickname || m.firstName}
          </p>
          <p className="text-white/40 text-[10px] font-light tracking-wider mt-0.5">
            {m.firstName} {m.lastName}
          </p>
          {m.city && (
            <p className="text-white/25 text-[9px] font-light tracking-wider mt-0.5">{m.city}</p>
          )}
        </div>
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Hero banner */}
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <img
            src="https://picsum.photos/seed/rossifamily/800/450"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'sepia(0.25) brightness(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

          <div className="absolute top-0 left-0 right-0 p-5 flex items-start justify-between">
            <div>
              <p className="editorial-caption text-white/40">Семья</p>
              <h1 className="editorial-title text-white text-4xl mt-0.5">Соколовы</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 flex items-center justify-center border border-white/20 text-white/60 hover:bg-white hover:text-black transition-all duration-300">
                  <Plus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm font-light"><Contact className="h-4 w-4 mr-2" /> Добавить из контактов</DropdownMenuItem>
                <DropdownMenuItem className="text-sm font-light"><UserPlus className="h-4 w-4 mr-2" /> Создать контакт</DropdownMenuItem>
                <DropdownMenuItem className="text-sm font-light" onClick={() => navigate(ROUTES.classic.invite)}><Send className="h-4 w-4 mr-2" /> Пригласить</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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

        {/* Generations */}
        {[1, 2, 3].map(gen => {
          const members = generations[gen] || [];
          const config = generationConfig[gen];
          const isLastGen = gen === 3;

          return (
            <div key={gen} className="mt-8">
              {/* Section header */}
              <div className="px-6 mb-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="editorial-caption text-muted-foreground/60">{`Поколение ${gen}`}</p>
                    <h2 className="editorial-title text-xl mt-1">{config.label}</h2>
                  </div>
                  <p className="text-[11px] font-light text-muted-foreground/40 italic">{config.subtitle}</p>
                </div>
                <div className="h-px bg-border/40 mt-3" />
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
                      className="w-36 flex-shrink-0 aspect-[3/4] border border-dashed border-border/50 flex flex-col items-center justify-center gap-2 group hover:border-foreground/30 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                      <span className="text-[10px] tracking-widest uppercase text-muted-foreground/30 group-hover:text-foreground/50 transition-colors">Пригласить</span>
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
