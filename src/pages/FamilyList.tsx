import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { getPrototypeAvatarForMember, getPrototypeAvatar } from '@/lib/prototype-assets';
import { getFamilyRole } from '@/lib/family-role';
import { Search, SlidersHorizontal, User } from 'lucide-react';
import type { FamilyMember } from '@/types';

function getRelationshipLabel(member: FamilyMember, currentId: string): string {
  return getFamilyRole(member, currentId);
}

const statusLabel = (isActive: boolean) => (isActive ? 'Активен' : 'Неактивен');
const statusLabelF = (isActive: boolean) => (isActive ? 'Активна' : 'Неактивна');

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'about' | 'family'>('family');
  const [subTab, setSubTab] = useState<'profiles' | 'groups'>('profiles');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('active');
  const [search, setSearch] = useState('');
  const myProfileAvatar = getPrototypeAvatar(currentUserId, currentUserId);

  const filtered = mockMembers
    .filter(m => filterTab === 'all' || (filterTab === 'active' ? m.isActive : !m.isActive))
    .filter(m => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.nickname || '').toLowerCase().includes(q) ||
        (m.city || '').toLowerCase().includes(q)
      );
    });

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Семья"
          onBack={() => navigate(ROUTES.home)}
          light
          right={
            <button type="button" className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Фильтры">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          }
        />
        <div className="mx-auto max-w-full px-3 pt-3 pb-4 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl">
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--proto-text-muted)]" />
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] text-sm text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]/30 focus:border-[var(--proto-active)]"
                />
              </div>
              <button type="button" className="h-10 w-10 rounded-lg border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors shrink-0" aria-label="Фильтры">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-6 border-b border-[var(--proto-border)]">
              <button
                type="button"
                onClick={() => setMainTab('about')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${mainTab === 'about' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
              >
                Обо мне
              </button>
              <button
                type="button"
                onClick={() => setMainTab('family')}
                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${mainTab === 'family' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
              >
                Семья
              </button>
            </div>

            {mainTab === 'family' && (
              <>
                <div className="flex gap-6 border-b border-[var(--proto-border)]">
                  <button
                    type="button"
                    onClick={() => setSubTab('profiles')}
                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${subTab === 'profiles' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
                  >
                    Профили
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab('groups')}
                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${subTab === 'groups' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'}`}
                  >
                    Группы
                  </button>
                </div>

                {subTab === 'profiles' && (
                  <>
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'active', 'inactive'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFilterTab(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filterTab === t
                              ? 'bg-[var(--proto-active)] text-white border border-[var(--proto-active)]'
                              : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] hover:text-[var(--proto-text)]'
                          }`}
                        >
                          {{ all: 'Все', active: 'Активные', inactive: 'Неактивные' }[t]}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filtered.map((m, index) => {
                        const isCurrent = m.id === currentUserId;
                        const relationLabel = getRelationshipLabel(m, currentUserId);
                        const avatar = getPrototypeAvatarForMember(m, currentUserId);
                        const status = m.lastName.endsWith('а') || m.lastName.endsWith('ова') || m.lastName.endsWith('ева') ? statusLabelF(m.isActive) : statusLabel(m.isActive);

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left"
                          >
                            <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                              <img
                                src={avatar.src}
                                alt=""
                                className="h-full w-full object-cover"
                                style={avatar.objectPosition ? { objectPosition: avatar.objectPosition } : undefined}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[var(--proto-text)] truncate">{m.firstName} {m.lastName}</p>
                              <p className="text-sm text-[var(--proto-text-muted)] truncate">{relationLabel}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${m.isActive ? 'bg-[var(--proto-card)] text-[var(--proto-text)] border border-[var(--proto-border)]' : 'bg-[var(--proto-border)] text-[var(--proto-text-muted)]'}`}>
                              {status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {subTab === 'groups' && (
                  <p className="text-sm text-[var(--proto-text-muted)] py-6 text-center">Раздел «Группы» в разработке</p>
                )}
              </>
            )}

            {mainTab === 'about' && (
              <div className="py-6">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.classic.myProfile)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left"
                >
<div className="h-14 w-14 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                  <img
                    src={myProfileAvatar.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={myProfileAvatar.objectPosition ? { objectPosition: myProfileAvatar.objectPosition } : undefined}
                  />
                </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--proto-text)] text-lg">Мой профиль</p>
                    <p className="text-sm text-[var(--proto-text-muted)]">Перейти в профиль</p>
                  </div>
                </button>
              </div>
            )}

            {mainTab === 'family' && subTab === 'profiles' && filtered.length === 0 && (
              <p className="text-center text-[var(--proto-text-muted)] text-sm py-8">Никого не найдено</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyList;
