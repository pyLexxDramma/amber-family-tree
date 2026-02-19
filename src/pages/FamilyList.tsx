import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { mockMembers, currentUserId, getCurrentUser } from '@/data/mock-members';
import { Send } from 'lucide-react';

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const [sectionTab, setSectionTab] = useState<'about' | 'family'>('family');
  const [viewTab, setViewTab] = useState<'profiles' | 'groups'>('profiles');
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const filtered = mockMembers.filter(m => tab === 'all' || (tab === 'active' ? m.isActive : !m.isActive));
  const currentUser = getCurrentUser();

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Header */}
        <div className="relative overflow-hidden" style={{ height: '140px' }}>
          <img
            src="https://picsum.photos/seed/familylist/800/300"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'sepia(0.3) brightness(0.5)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <h1 className="editorial-title text-white text-2xl">Семья</h1>
            <button
              onClick={() => navigate(ROUTES.classic.invite)}
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-light text-white/50 hover:text-white transition-colors border border-white/20 px-3 py-1.5 hover:bg-white hover:text-black duration-300"
            >
              <Send className="h-3 w-3" /> Пригласить
            </button>
          </div>
        </div>

        {/* По ТЗ: вкладки Обо мне / Семья */}
        <div className="px-6 flex gap-6 mt-5 mb-1">
          {(['about', 'family'] as const).map(t => (
            <button key={t} onClick={() => setSectionTab(t)} className={`editorial-caption pb-2 transition-colors ${sectionTab === t ? 'text-foreground border-b border-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground/60'}`}>
              {t === 'about' ? 'Обо мне' : 'Семья'}
            </button>
          ))}
        </div>

        {/* По ТЗ: вкладки Профили / Группы */}
        <div className="px-6 flex gap-6 mb-3">
          {(['profiles', 'groups'] as const).map(t => (
            <button key={t} onClick={() => setViewTab(t)} className={`text-xs font-light pb-1.5 transition-colors ${viewTab === t ? 'text-foreground border-b border-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground/70'}`}>
              {t === 'profiles' ? 'Профили' : 'Группы'}
            </button>
          ))}
        </div>

        {sectionTab === 'about' && (
          <div className="px-6 mt-2">
            <div className="p-5 bg-card rounded-sm flex items-center gap-4">
              <img src={`https://picsum.photos/seed/member${currentUser.id}/120/120`} alt="" className="h-16 w-16 rounded-full object-cover" />
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
          <div className="px-6 py-8 text-center">
            <p className="editorial-caption text-muted-foreground">Пока нет групп</p>
            <p className="text-xs font-light text-muted-foreground mt-1">Группы появятся в следующих версиях</p>
          </div>
        )}

        {sectionTab === 'family' && viewTab === 'profiles' && (
          <>
        {/* Фильтр: все / активные / неактивные */}
        <div className="px-6 flex gap-6 mb-2">
          {(['all', 'active', 'inactive'] as const).map(t => {
            const labels = { all: 'Все', active: 'Активные', inactive: 'Неактивные' };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`editorial-caption pb-2 transition-colors ${tab === t ? 'text-foreground border-b border-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground/60'}`}
              >
                {labels[t]} ({mockMembers.filter(m => t === 'all' || (t === 'active' ? m.isActive : !m.isActive)).length})
              </button>
            );
          })}
        </div>

        {/* Members list */}
        <div className="px-4 mt-4 space-y-2 pb-2">
          {filtered.map(m => {
            const isCurrent = m.id === currentUserId;
            return (
              <button
                key={m.id}
                onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                className="w-full flex items-center gap-4 text-left group relative overflow-hidden rounded-sm"
                style={{ height: '72px' }}
              >
                {/* Mini background blur */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/member${m.id}/400/530`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover blur-2xl scale-150 opacity-[0.07]"
                  />
                </div>

                <div className="relative flex items-center gap-4 px-3 w-full">
                  {/* Avatar */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden relative">
                    <img
                      src={`https://picsum.photos/seed/member${m.id}/120/120`}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: m.isActive ? 'sepia(0.05)' : 'grayscale(0.6)' }}
                    />
                    {isCurrent && (
                      <div className="absolute bottom-0.5 right-0.5 h-2 w-2 bg-foreground rounded-full border border-background" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light tracking-wide">
                      {m.firstName} {m.lastName}
                      {isCurrent && <span className="text-muted-foreground/40 ml-1.5 text-[10px] tracking-widest uppercase">вы</span>}
                    </p>
                    <p className="text-[11px] font-light text-muted-foreground/50 truncate mt-0.5">
                      {m.nickname && <span className="italic">"{m.nickname}" · </span>}
                      {m.relations[0]?.type && <span className="capitalize">{m.relations[0].type}</span>}
                      {m.city && <span> · {m.city}</span>}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex flex-col items-end gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${m.isActive ? 'bg-foreground/30' : 'bg-muted-foreground/15'}`} />
                    <span className="text-[8px] tracking-widest uppercase text-muted-foreground/30 font-light">
                      {m.isActive ? 'в сети' : 'не в сети'}
                    </span>
                  </div>
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
