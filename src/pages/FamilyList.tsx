import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { currentUserId, mockMembers } from '@/data/mock-members';
import { getPrototypeAvatarForMember } from '@/lib/prototype-assets';
import { getFamilyRole } from '@/lib/family-role';
import { Search } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { api } from '@/integrations/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isDemoMode, useAvatarFallback } from '@/lib/demoMode';
import { toast } from '@/hooks/use-toast';

function getRelationshipLabel(member: FamilyMember, currentId: string | undefined): string {
  if (!currentId) return 'Член семьи';
  try {
    return getFamilyRole(member, currentId);
  } catch {
    return 'Член семьи';
  }
}

const memberName = (m: FamilyMember & { first_name?: string; last_name?: string }) =>
  `${(m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name ?? ''} ${(m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name ?? ''}`.trim();

const initials = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
};

const hasDeathDate = (m: { deathDate?: string; death_date?: string }) =>
  !!((m.deathDate ?? m.death_date ?? '').trim());

const norm = (m: FamilyMember & { first_name?: string; last_name?: string; avatar?: string; death_date?: string; relations?: { memberId?: string; member_id?: string; type: string }[] }) => ({
  ...m,
  firstName: (m as { firstName?: string }).firstName ?? m.first_name ?? '',
  lastName: (m as { lastName?: string }).lastName ?? m.last_name ?? '',
  relations: (m.relations ?? []).map(r => ({ memberId: r.memberId ?? (r as { member_id?: string }).member_id, type: r.type })),
});

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<'profiles' | 'groups'>('profiles');
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>(isDemoMode() ? mockMembers : []);
  const [myProfile, setMyProfile] = useState<FamilyMember | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(!isDemoMode());
  const [contactOpen, setContactOpen] = useState(false);
  const [contactPending, setContactPending] = useState(false);
  const [contactTargetId, setContactTargetId] = useState<string | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);

  useEffect(() => {
    api.family.listMembers()
      .then(setMembers)
      .catch(() => {
        if (isDemoMode()) setMembers(mockMembers);
        else {
          setMembers([]);
          toast({ title: 'Не удалось загрузить семью' });
        }
      })
      .finally(() => setIsLoadingMembers(false));
    api.profile.getMyProfile()
      .then(m => {
        setMyProfile(m);
        setMyMemberId(m?.id ?? null);
      })
      .catch(() => {
        api.auth.me().then(u => setMyMemberId(u?.member?.id ?? null)).catch(() => {});
      });
  }, []);

  const myId = myProfile?.id ?? myMemberId ?? (isDemoMode() ? currentUserId : undefined);

  const filtered = members
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
        />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl">
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
            </div>

            <div className="flex gap-6 border-b border-[var(--proto-border)]">
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.myProfile)}
                className="pb-2 text-sm font-medium transition-colors border-b-2 text-[var(--proto-text-muted)] border-transparent hover:text-[var(--proto-text)]"
              >
                Обо мне
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.family)}
                className="pb-2 text-sm font-medium transition-colors border-b-2 text-[var(--proto-text)] border-[var(--proto-active)]"
              >
                Семья
              </button>
            </div>

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
                <div className="space-y-2">
                  {!isDemoMode() && isLoadingMembers && (
                    <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 text-sm text-[var(--proto-text-muted)]">
                      Загрузка…
                    </div>
                  )}
                  {filtered.map((m) => {
                    const mn = norm(m);
                    const isCurrent = m.id === myId;
                    const relationLabel = getRelationshipLabel(mn, myId);
                    const avatarSrc = (m as { avatar?: string }).avatar ?? (useAvatarFallback() ? getPrototypeAvatarForMember(mn, myId).src : '');
                    const isDeceased = hasDeathDate(m);
                    const full = memberName(m) || 'Участник';

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left ${
                          isDeceased ? 'bg-[#E5E2DD]' : 'bg-[var(--proto-card)]'
                        }`}
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#E5E1DC] text-[#6B6560] font-semibold">
                              {initials(full)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--proto-text)] truncate">{full}</p>
                          <p className="text-sm text-[var(--proto-text-muted)] truncate">{relationLabel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {subTab === 'groups' && (
              <p className="text-sm text-[var(--proto-text-muted)] py-6 text-center">Раздел «Группы» в разработке</p>
            )}

            {subTab === 'profiles' && filtered.length === 0 && (
              <p className="text-center text-[var(--proto-text-muted)] text-sm py-8">Никого не найдено</p>
            )}

            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(myProfile ? ROUTES.classic.createMemberProfile : '/onboarding')}
                  className="h-12 rounded-2xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
                >
                  {myProfile ? 'Создать профиль члена семьи' : 'Создать профиль'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.classic.invite)}
                  className="h-12 rounded-2xl bg-[var(--proto-active)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Пригласить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (contactPending) return;
                    if (!myId && !isDemoMode()) {
                      toast({ title: 'Загрузка профиля…' });
                      return;
                    }
                    const hasTarget = members
                      .map(norm)
                      .some(x => x.id !== myId && !hasDeathDate(x));
                    if (!hasTarget) {
                      toast({ title: 'Нет живых участников' });
                      return;
                    }
                    setContactOpen(true);
                  }}
                  disabled={!myId && !isDemoMode()}
                  className={`h-12 rounded-2xl border-2 text-sm font-semibold transition-colors ${
                    contactPending || (!myId && !isDemoMode())
                      ? 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text-muted)] cursor-default'
                      : 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40'
                  }`}
                >
                  {contactPending ? 'На рассмотрении' : 'Установить контакт'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.contactRequests)}
                className="mt-3 text-xs text-[var(--proto-text-muted)] underline"
              >
                Запросы контакта
              </button>
            </div>
          </div>
        </div>

        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>С кем связаться?</DialogTitle>
            </DialogHeader>
            <div className="space-y-1 max-h-[360px] overflow-y-auto">
              {members
                .map(norm)
                .filter(m => m.id !== myId && !hasDeathDate(m))
                .map((m) => {
                  const full = memberName(m) || 'Участник';
                  const relationLabel = getRelationshipLabel(m, myId);
                  const avatarSrc = (m as { avatar?: string }).avatar ?? (useAvatarFallback() ? getPrototypeAvatarForMember(m, myId).src : '');
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await api.contactRequests.createWith(m.id);
                          setContactTargetId(m.id);
                          if (res.status === 'pending') {
                            setContactPending(true);
                            toast({ title: 'Запрос на установление контакта отправлен' });
                          } else if (res.status === 'accepted') {
                            toast({ title: 'Контакт уже установлен, можно писать сообщения' });
                            navigate(ROUTES.classic.messages(m.id));
                          } else if (res.status === 'rejected') {
                            toast({ title: 'Ранее запрос был отклонён' });
                          }
                        } catch {
                          toast({ title: 'Не удалось отправить запрос' });
                        } finally {
                          setContactOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors text-left"
                    >
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[#E5E1DC] text-[#6B6560] text-xs font-semibold">
                            {initials(full)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--proto-text)] truncate">{full}</p>
                        <p className="text-xs text-[var(--proto-text-muted)] truncate">{relationLabel}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default FamilyList;
