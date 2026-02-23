import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId, getCurrentUser } from '@/data/mock-members';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';
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
  const currentUser = getCurrentUserForDisplay();

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
      <div className="px-0 pt-4 pb-4 page-enter">
        <p className="section-title text-base sm:text-lg text-primary mb-4 px-3">Контакты</p>

        <div className="flex gap-3 mt-4 mb-4 px-3">
          {(['about', 'family'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSectionTab(t)}
              className={`tab-warm touch-target min-h-[48px] flex items-center text-base font-semibold px-4 ${sectionTab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
            >
              {t === 'about' ? 'Обо мне' : 'Семья'}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-5 px-3">
          {(['profiles', 'groups'] as const).map(t => (
            <button
              key={t}
              onClick={() => setViewTab(t)}
              className={`tab-warm touch-target min-h-[48px] flex items-center text-base font-semibold px-4 ${viewTab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
            >
              {t === 'profiles' ? 'Профили' : 'Группы'}
            </button>
          ))}
        </div>

        {sectionTab === 'about' && (
          <div className="mt-4">
            <button
              onClick={() => navigate(ROUTES.classic.myProfile)}
              className="content-card p-5 flex items-center gap-4 min-h-[144px] w-full text-left hover:border-primary/30 transition-colors"
            >
              {demoWithPhotos ? (
                <img src={getDemoMemberPhotoUrl(currentUser.id)} alt="" className="h-16 w-16 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <div className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${demoWithPhotos ? 'hidden' : ''}`}>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-medium tracking-wide">{currentUser.firstName} {currentUser.lastName}</p>
                {currentUser.nickname && <p className="text-xs text-muted-foreground italic">"{currentUser.nickname}"</p>}
                {currentUser.city && <p className="text-xs text-muted-foreground mt-0.5">{currentUser.city}</p>}
              </div>
              <span className="text-xs tracking-widest uppercase font-light text-muted-foreground">Профиль</span>
            </button>
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
        <div className="flex flex-wrap gap-3 mb-4 px-3">
          {(['all', 'active', 'inactive'] as const).map(t => {
            const labels = { all: 'Все', active: 'Активные', inactive: 'Неактивные' };
            const count = mockMembers.filter(m => t === 'all' || (t === 'active' ? m.isActive : !m.isActive)).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab-warm touch-target min-h-[48px] flex items-center text-base font-semibold px-4 ${tab === t ? 'tab-warm-active' : 'tab-warm-inactive'}`}
              >
                {labels[t]} ({count})
              </button>
            );
          })}
        </div>

        <p className="text-sm sm:text-base font-bold tracking-widest uppercase text-primary mb-3 px-3 dark:text-[hsl(36,80%,58%)]">Выберите, чьи фото и ленту смотреть</p>
        <div className="mt-2 space-y-4 pb-4">
          {filtered.map(m => {
            const isCurrent = m.id === currentUserId;
            return (
              <button
                key={m.id}
                onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                className="person-card person-card-accent w-full flex items-center gap-5 text-left group relative min-h-[144px] pl-5 pr-5 py-4 touch-target"
              >
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="h-[108px] w-[108px] rounded-full bg-muted flex items-center justify-center relative overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    {demoWithPhotos && (
                      <img src={getDemoMemberPhotoUrl(m.id)} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                    )}
                    <div className={`h-full w-full flex items-center justify-center relative ${demoWithPhotos ? 'hidden' : ''}`}>
                      <User className={`h-9 w-9 ${m.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      {isCurrent && (
                        <div className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="card-name text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide leading-tight dark:text-white">
                    {m.firstName} {m.lastName}
                    {isCurrent && <span className="text-primary ml-2 text-sm font-bold tracking-widest uppercase">вы</span>}
                  </p>
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
