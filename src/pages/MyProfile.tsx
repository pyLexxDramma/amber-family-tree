import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { currentUserId } from '@/data/mock-members';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Newspaper, Image, Settings, HelpCircle, CreditCard, ChevronRight, Pencil, Send } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { FamilyMember } from '@/types';
import { api } from '@/integrations/api';
import { isDemoMode, setDemoMode } from '@/lib/demoMode';
import { toast } from '@/hooks/use-toast';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<FamilyMember | null>(null);
  const plan = plans.find(p => p.id === currentSubscription.planId);
  const [demoCounts, setDemoCounts] = useState<{ members: number; photos: number }>({ members: 0, photos: 0 });

  useEffect(() => {
    api.profile.getMyProfile().then(setUser);
    if (isDemoMode()) {
      Promise.all([api.family.listMembers(), api.feed.list()]).then(([ms, pubs]) => {
        const photos = pubs.flatMap(p => p.media).filter(m => m.type === 'photo').length;
        setDemoCounts({ members: ms.length, photos });
      }).catch(() => {});
    }
  }, []);

  if (!user) {
    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex items-center justify-center text-[var(--proto-text-muted)]">
          Загрузка профиля...
        </div>
      </AppLayout>
    );
  }

  const sections = [
    { label: 'Мои публикации', icon: Newspaper, path: `${ROUTES.classic.feed}?filter=my` },
    { label: 'Публикации со мной', icon: Image, path: `${ROUTES.classic.feed}?filter=with-me` },
    { label: 'Моё медиа', icon: Image, path: ROUTES.classic.myMedia },
    { label: 'Подписка', icon: CreditCard, path: ROUTES.classic.store },
    { label: 'Настройки', icon: Settings, path: ROUTES.classic.settings },
    { label: 'Помощь и поддержка', icon: HelpCircle, path: ROUTES.classic.help },
  ];

  if (isDemoMode()) {
    if (!user) {
      return (
        <AppLayout>
          <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex items-center justify-center text-[var(--proto-text-muted)]">
            Загрузка профиля...
          </div>
        </AppLayout>
      );
    }

    const role = user.nickname || 'Профиль';
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Профиль';
    const familyName = `${user.lastName || 'Семья'} семьи`;

    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <div className="mx-auto max-w-full px-4 pt-8 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
            <h1 className="text-2xl font-semibold text-[var(--proto-text)] mb-6">Профиль</h1>

            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-[var(--proto-border)]">
                  <img src={(user as { avatar?: string }).avatar ?? getPrototypeAvatarUrl(user.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--proto-text)] truncate">{fullName}</p>
                  <p className="text-xs font-semibold text-[#A39B8A]">{role}</p>
                  <p className="text-xs text-[var(--proto-text-muted)]">{`${(user.firstName || 'user').toLowerCase()}@demo.ru`}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-4 mb-3">
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-3">{familyName}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#A39B8A]">{demoCounts.members || 0}</p>
                  <p className="text-xs text-[var(--proto-text-muted)]">участников</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#A39B8A]">{demoCounts.photos || 0}</p>
                  <p className="text-xs text-[var(--proto-text-muted)]">фото</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#A39B8A]">Базовый</p>
                  <p className="text-xs text-[var(--proto-text-muted)]">тариф</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[var(--proto-border)] overflow-hidden">
              <button type="button" onClick={() => navigate(ROUTES.classic.family)} className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--proto-bg)] transition-colors">
                <span className="text-sm font-medium text-[var(--proto-text)]">Члены семьи</span>
                <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
              </button>
              <div className="h-px bg-[var(--proto-border)]" />
              <button type="button" onClick={() => navigate(ROUTES.classic.store)} className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--proto-bg)] transition-colors">
                <span className="text-sm font-medium text-[var(--proto-text)]">Тариф</span>
                <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
              </button>
              <div className="h-px bg-[var(--proto-border)]" />
              <button type="button" onClick={() => toast({ title: 'В демо уведомления недоступны' })} className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--proto-bg)] transition-colors">
                <span className="text-sm font-medium text-[var(--proto-text)]">Уведомления</span>
                <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
              </button>
              <div className="h-px bg-[var(--proto-border)]" />
              <button type="button" onClick={() => navigate(ROUTES.classic.settings)} className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--proto-bg)] transition-colors">
                <span className="text-sm font-medium text-[var(--proto-text)]">Настройки</span>
                <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setDemoMode(false); navigate(ROUTES.home, { replace: true }); }}
              className="mt-4 w-full h-12 rounded-2xl bg-[#F4D6D6] text-[#C13A3A] font-semibold hover:opacity-90 transition-opacity"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Мой профиль" onBack={() => navigate(-1)} light right={
          <button type="button" onClick={() => navigate(ROUTES.classic.invite)} className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поделиться">
            <Send className="h-5 w-5" />
          </button>
        } />
        <div className="mx-auto max-w-full px-3 pt-4 pb-4 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl">
          <div className="relative mb-8 overflow-hidden rounded-xl bg-[var(--proto-card)] flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
            {(user as { avatar?: string }).avatar ? (
              <img src={(user as { avatar?: string }).avatar} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#F0EDE8] to-[#E5E1DC] flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-black/10 flex items-center justify-center text-[#6B6560] text-3xl font-semibold">
                  {`${(user.firstName || '').trim()[0] ?? ''}${(user.lastName || '').trim()[0] ?? ''}`.toUpperCase() || 'U'}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white/70 text-xs font-medium mb-1">{plan?.name === 'Free' ? 'Бесплатный' : plan?.name === 'Premium' ? 'Премиум' : plan?.name} · план</p>
              <h1 className="font-serif text-2xl font-semibold text-white">{`${(user as { firstName?: string; first_name?: string }).firstName ?? (user as { first_name?: string }).first_name ?? ''} ${(user as { lastName?: string; last_name?: string }).lastName ?? (user as { last_name?: string }).last_name ?? ''}`.trim() || 'Профиль'}</h1>
              <p className="text-white/80 text-sm mt-1">{user.city}</p>
            </div>
          </div>

          {user.about && (
            <div className="mb-6">
              <p className="text-sm text-[var(--proto-text-muted)]">{user.about}</p>
            </div>
          )}

          <button
            onClick={() => navigate(ROUTES.classic.editMyProfile)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left mb-4"
          >
            <Pencil className="h-5 w-5 shrink-0 text-[var(--proto-active)]" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-[var(--proto-text)] flex-1">Редактировать профиль</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--proto-text-muted)]" />
          </button>

          <div className="space-y-1">
            {sections.map(s => (
              <button
                key={s.label}
                onClick={() => navigate(s.path)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left"
              >
                <s.icon className="h-5 w-5 shrink-0 text-[var(--proto-active)]" strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-[var(--proto-text)] flex-1 text-left">{s.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--proto-text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
