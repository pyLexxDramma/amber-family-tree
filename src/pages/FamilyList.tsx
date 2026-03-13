import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { getPrototypeAvatarForMember, getPrototypeAvatar } from '@/lib/prototype-assets';
import { getFamilyRole } from '@/lib/family-role';
import { Search, SlidersHorizontal, User } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { api } from '@/integrations/api';

function getRelationshipLabel(member: FamilyMember, currentId: string): string {
  try {
    return getFamilyRole(member, currentId);
  } catch {
    return 'Член семьи';
  }
}

const statusLabel = (isActive: boolean) => (isActive ? 'Активен' : 'Неактивен');
const statusLabelF = (isActive: boolean) => (isActive ? 'Активна' : 'Неактивна');

const memberName = (m: FamilyMember & { first_name?: string; last_name?: string }) =>
  `${(m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name ?? ''} ${(m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name ?? ''}`.trim();

const norm = (m: FamilyMember & { first_name?: string; last_name?: string; avatar?: string; is_active?: boolean; relations?: { memberId?: string; member_id?: string; type: string }[] }) => ({
  ...m,
  firstName: (m as { firstName?: string }).firstName ?? m.first_name ?? '',
  lastName: (m as { lastName?: string }).lastName ?? m.last_name ?? '',
  isActive: m.isActive ?? m.is_active ?? true,
  relations: (m.relations ?? []).map(r => ({ memberId: r.memberId ?? (r as { member_id?: string }).member_id, type: r.type })),
});

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'about' | 'family'>('family');
  const [subTab, setSubTab] = useState<'profiles' | 'groups'>('profiles');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>(mockMembers);
  const [myProfile, setMyProfile] = useState<FamilyMember | null>(null);

  useEffect(() => {
    api.family.listMembers().then(setMembers);
    api.profile.getMyProfile().then(setMyProfile).catch(() => {});
  }, []);

  const myId = myProfile?.id ?? currentUserId;
  const myAvatarSrc = myProfile && (myProfile as { avatar?: string }).avatar
    ? (myProfile as { avatar: string }).avatar
    : getPrototypeAvatar(myId, myId).src;

  const filtered = members
    .filter(m => filterTab === 'all' || (filterTab === 'active' ? (m.isActive ?? (m as { is_active?: boolean }).is_active ?? true) : !(m.isActive ?? (m as { is_active?: boolean }).is_active ?? true)))
    .filter(m => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const fn = (m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name ?? '';
      const ln = (m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name ?? '';
      const nick = (m as { nickname?: string }).nickname ?? '';
      const city = (m as { city?: string }).city ?? '';
      return fn.toLowerCase().includes(q) || ln.toLowerCase().includes(q) || nick.toLowerCase().includes(q) || city.toLowerCase().includes(q);
    });

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Семья"
          onBack={() => navigate(-1)}
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
                      {filtered.map((m) => {
                        const mn = norm(m);
                        const isCurrent = m.id === myId;
                        const relationLabel = getRelationshipLabel(mn, myId);
                        const avatarSrc = (m as { avatar?: string }).avatar ?? getPrototypeAvatarForMember(mn, myId).src;
                        const ln = (m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name ?? '';
                        const isActive = m.isActive ?? (m as { is_active?: boolean }).is_active ?? true;
                        const status = ln.endsWith('а') || ln.endsWith('ова') || ln.endsWith('ева') ? statusLabelF(isActive) : statusLabel(isActive);

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left"
                          >
                            <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                              <img
                                src={avatarSrc}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[var(--proto-text)] truncate">{memberName(m) || 'Участник'}</p>
                              <p className="text-sm text-[var(--proto-text-muted)] truncate">{relationLabel}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${isActive ? 'bg-[var(--proto-card)] text-[var(--proto-text)] border border-[var(--proto-border)]' : 'bg-[var(--proto-border)] text-[var(--proto-text-muted)]'}`}>
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
                      src={myAvatarSrc}
                      alt=""
                      className="h-full w-full object-cover"
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
