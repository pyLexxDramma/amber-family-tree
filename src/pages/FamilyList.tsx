import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId, getCurrentUser } from '@/data/mock-members';
import { Send, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

const FALLBACK = '/placeholder.svg';

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const demoWithPhotos = useDemoWithPhotos();
  const [sectionTab, setSectionTab] = useState<'about' | 'family'>('family');
  const [viewTab, setViewTab] = useState<'profiles' | 'groups'>('profiles');
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const filtered = mockMembers.filter(m => tab === 'all' || (tab === 'active' ? m.isActive : !m.isActive));
  const currentUser = getCurrentUser();

  return (
    <AppLayout>
      <TopBar
        title="Семья"
        right={
          <button
            onClick={() => navigate(ROUTES.classic.invite)}
            className="touch-target flex items-center gap-2 min-h-touch px-3 py-2 text-xs font-medium tracking-wide text-current/90 hover:text-current rounded-xl hover:bg-white/10 transition-colors"
          >
            <Send className="h-4 w-4" /> Пригласить
          </button>
        }
      />
      <div className="px-6 pt-4 pb-4 page-enter">
        <p className="section-title text-primary mb-4">Контакты</p>

        <div className="flex gap-2 mt-4 mb-3">
          {(['about', 'family'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSectionTab(t)}
              className={`tab-warm touch-target min-h-touch flex items-center text-sm ${sectionTab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
            >
              {t === 'about' ? 'Обо мне' : 'Семья'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {(['profiles', 'groups'] as const).map(t => (
            <button
              key={t}
              onClick={() => setViewTab(t)}
              className={`tab-warm touch-target min-h-touch flex items-center text-sm ${viewTab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
            >
              {t === 'profiles' ? 'Профили' : 'Группы'}
            </button>
          ))}
        </div>

        {sectionTab === 'about' && (
          <div className="mt-4">
            <div className="content-card p-5 flex items-center gap-4">
              {demoWithPhotos ? (
                <img src={`https://picsum.photos/seed/member${currentUser.id}/120/120`} alt="" className="h-16 w-16 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <div className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${demoWithPhotos ? 'hidden' : ''}`}>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium tracking-wide">{currentUser.firstName} {currentUser.lastName}</p>
                {currentUser.nickname && <p className="text-xs text-muted-foreground italic">"{currentUser.nickname}"</p>}
                {currentUser.city && <p className="text-xs text-muted-foreground mt-0.5">{currentUser.city}</p>}
              </div>
              <button onClick={() => navigate(ROUTES.classic.myProfile)} className="text-xs tracking-widest uppercase font-light text-muted-foreground hover:text-foreground transition-colors">Профиль</button>
            </div>
          </div>
        )}

        {sectionTab === 'family' && viewTab === 'groups' && (
          <div className="py-8 text-center">
            <p className="editorial-caption text-muted-foreground">Пока нет групп</p>
            <p className="text-xs font-light text-muted-foreground mt-1">Группы появятся в следующих версиях</p>
          </div>
        )}

        {sectionTab === 'family' && viewTab === 'profiles' && (
          <>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'active', 'inactive'] as const).map(t => {
            const labels = { all: 'Все', active: 'Активные', inactive: 'Неактивные' };
            const count = mockMembers.filter(m => t === 'all' || (t === 'active' ? m.isActive : !m.isActive)).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab-warm touch-target flex items-center text-sm ${tab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
              >
                {labels[t]} ({count})
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold tracking-widest uppercase text-primary/70 mb-2">Выберите, чьи фото и ленту смотреть</p>
        <div className="mt-2 space-y-3 pb-2">
          {filtered.map(m => {
            const isCurrent = m.id === currentUserId;
            return (
              <button
                key={m.id}
                onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                className="person-card person-card-accent w-full flex items-center gap-4 text-left group relative min-h-[76px] pl-4 pr-4 py-3"
              >
                <div className="h-14 w-14 flex-shrink-0 rounded-full bg-muted flex items-center justify-center relative overflow-hidden ring-4 ring-primary/15 group-hover:ring-primary/30 transition-all">
                  {demoWithPhotos && (
                    <img src={`https://picsum.photos/seed/member${m.id}/112/112`} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                  )}
                  <div className={`h-full w-full flex items-center justify-center relative ${demoWithPhotos ? 'hidden' : ''}`}>
                    <User className={`h-7 w-7 ${m.isActive ? 'text-primary/80' : 'text-muted-foreground'}`} />
                    {isCurrent && (
                      <div className="absolute bottom-0.5 right-0.5 h-2 w-2 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground tracking-wide">
                    {m.firstName} {m.lastName}
                    {isCurrent && <span className="text-primary/80 ml-1.5 text-[10px] font-medium tracking-widest uppercase">вы</span>}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground/80 truncate mt-0.5">
                    {m.nickname && <span className="italic text-foreground/70">"{m.nickname}" · </span>}
                    {m.relations[0]?.type && <span className="capitalize">{m.relations[0].type}</span>}
                    {m.city && <span> · {m.city}</span>}
                  </p>
                  <p className="text-[10px] font-medium text-primary/70 mt-1">Смотреть фото и ленту →</p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className={`h-2 w-2 rounded-full ${m.isActive ? 'bg-primary/80' : 'bg-muted-foreground/30'}`} />
                  <span className="text-[9px] tracking-widest uppercase font-medium text-muted-foreground/60">
                    {m.isActive ? 'в сети' : 'не в сети'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default FamilyList;
